/**
 * AUDIO UTILITIES
 * Handles recording (16kHz PCM) and playback (PCM stream)
 */

export class AudioRecorder {
    constructor(onDataAvailable) {
        this.onDataAvailable = onDataAvailable;
        this.audioContext = null;
        this.mediaStream = null;
        this.workletNode = null;
        this.isRecording = false;
    }

    async start() {
        if (this.isRecording) return;

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000
                }
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);

            // AudioWorklet for processing
            // In a real bundler setup, this might be a separate file, but here we blob it
            const workletCode = `
                class RecorderProcessor extends AudioWorkletProcessor {
                    process(inputs, outputs, parameters) {
                        const input = inputs[0];
                        if (input.length > 0) {
                            const float32Data = input[0]; 
                            // Convert Float32 to Int16
                            const int16Data = new Int16Array(float32Data.length);
                            for (let i = 0; i < float32Data.length; i++) {
                                const s = Math.max(-1, Math.min(1, float32Data[i]));
                                int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                            }
                            this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
                        }
                        return true;
                    }
                }
                registerProcessor('recorder-processor', RecorderProcessor);
            `;

            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);

            await this.audioContext.audioWorklet.addModule(url);

            this.workletNode = new AudioWorkletNode(this.audioContext, 'recorder-processor');

            this.workletNode.port.onmessage = (event) => {
                const int16Buffer = event.data;
                // Convert buffer to base64
                const base64String = this.arrayBufferToBase64(int16Buffer);
                if (this.onDataAvailable) {
                    this.onDataAvailable(base64String);
                }
            };

            source.connect(this.workletNode);
            // Must connect to destination to keep alive in some browsers, but we mute it
            // distinct from "echo cancellation" which is handled by browser
            // this.workletNode.connect(this.audioContext.destination); 

            this.isRecording = true;

        } catch (error) {
            console.error("Error starting recorder:", error);
            throw error;
        }
    }

    stop() {
        if (!this.isRecording) return;

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isRecording = false;
    }

    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}

export class AudioStreamer {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.queue = [];
        this.scheduledTime = 0;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000 // Gemini often output 24kHz
            });
        }
    }

    // Expects Base64 PCM16
    addPCM16(base64Data) {
        this.init();
        const binary = window.atob(base64Data);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);

        for (let i = 0; i < int16Data.length; i++) {
            const int = int16Data[i];
            float32Data[i] = int >= 32768 ? -(65536 - int) / 32768 : int / 32767;
        }

        this.playChunk(float32Data);
    }

    playChunk(float32Data) {
        // Gemini 2.0 Flash Exp output is 24kHz
        const listSampleRate = 24000;
        const buffer = this.audioContext.createBuffer(1, float32Data.length, listSampleRate);
        buffer.copyToChannel(float32Data, 0);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        const currentTime = this.audioContext.currentTime;
        if (this.scheduledTime < currentTime) {
            this.scheduledTime = currentTime;
        }

        source.start(this.scheduledTime);
        this.scheduledTime += buffer.duration;
    }

    stop() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.scheduledTime = 0;
    }
}
