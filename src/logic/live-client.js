/**
 * LIVE CLIENT
 * Wrapper for Gemini Multimodal Live API
 */

import { AudioRecorder, AudioStreamer } from './audio-utils';

const WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";

export class LiveClient {
    constructor(apiKey, model, voice, knowledge) {
        this.apiKey = apiKey;
        this.model = model;
        this.voice = voice || "Puck";
        this.knowledge = knowledge || "";
        this.ws = null;
        this.recorder = null;
        this.streamer = null;
        this.isConnected = false;

        // Event callbacks
        this.onOpen = () => { };
        this.onClose = () => { };
        this.onError = () => { };
        this.onAudioLevel = () => { }; // For visualizer
    }

    connect() {
        const url = `${WS_URL}?key=${this.apiKey}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log("Connected to Gemini Live");
            this.isConnected = true;
            this.setupSession();
            this.startAudio();
            this.onOpen();
        };

        this.ws.onmessage = async (event) => {
            const data = event.data;
            let response;
            try {
                if (data instanceof Blob) {
                    const text = await data.text();
                    response = JSON.parse(text);
                } else {
                    response = JSON.parse(data);
                }
            } catch (e) {
                console.error("Error parsing WS message", e);
                return;
            }

            this.handleMessage(response);
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
            this.onError(error);
        };

        this.ws.onclose = () => {
            console.log("Disconnected from Gemini Live");
            this.isConnected = false;
            this.stopAudio();
            this.onClose();
        };
    }

    setupSession() {
        const setupMsg = {
            setup: {
                model: `models/${this.model}`,
                system_instruction: {
                    parts: [{
                        text: this.getSystemInstruction()
                    }]
                },
                generation_config: {
                    response_modalities: ["AUDIO"],
                    speech_config: {
                        voice_config: {
                            prebuilt_voice_config: {
                                voice_name: this.voice
                            }
                        }
                    }
                }
            }
        };
        this.send(setupMsg);
    }

    getSystemInstruction() {
        const lang = import.meta.env.VITE_AI_LANGUAGE || 'en';
        const style = import.meta.env.VITE_AI_STYLE || 'la_slang';

        let baseInstruction = "";

        if (lang === 'de') {
            baseInstruction = "Du bist 'The 6ixth Man'. Du bist ein freundlicher, weiser Mentor. Sprich Deutsch.";
            if (style === 'la_slang') {
                baseInstruction += " Nutze einen lockeren, modernen Jugendsprache-Stil, gemischt mit Weisheit. Du bist wie ein cooler Basketball-Coach aus der Hood, der aber Deutsch spricht. Nutze Anglizismen wo passend. Sei cool, autoritär aber herzlich.";
            } else {
                baseInstruction += " Sprich professionell, klar und höflich. Wie ein erfahrener Berater.";
            }
        } else {
            // Default English
            baseInstruction = "You are 'The 6ixth Man'. You are a wise mentor.";
            if (style === 'la_slang') {
                baseInstruction += " You are a 50-year-old retired black basketball player. You speak in English using AAVE (African American Vernacular English) naturally but professionally, like a wise coach. You are calm, authoritative, and encouraging. Your goal is to help the user navigate their life with wisdom from the court. Keep responses concise and spoken.";
            } else {
                baseInstruction += " Speak in standard, professional English. Be helpful, concise, and polite.";
            }
        }

        // Append Knowledge
        if (this.knowledge) {
            baseInstruction += `\n\n[CONTEXT/KNOWLEDGE BASE]\nUse the following information to answer questions if relevant:\n${this.knowledge}`;
        }

        return baseInstruction;
    }

    handleMessage(msg) {
        // Handle Audio
        if (msg.serverContent?.modelTurn?.parts) {
            const parts = msg.serverContent.modelTurn.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
                    // Play audio
                    this.streamer.addPCM16(part.inlineData.data);
                }
            }
        }

        // Setup Complete
        if (msg.setupComplete) {
            console.log("Session Setup Complete");
        }
    }

    startAudio() {
        this.streamer = new AudioStreamer();
        this.recorder = new AudioRecorder((base64Data) => {
            this.sendAudioChunk(base64Data);
        });
        this.recorder.start();
    }

    stopAudio() {
        if (this.recorder) {
            this.recorder.stop();
            this.recorder = null;
        }
        if (this.streamer) {
            this.streamer.stop();
            this.streamer = null;
        }
    }

    sendAudioChunk(base64Data) {
        const msg = {
            realtime_input: {
                media_chunks: [
                    {
                        mime_type: "audio/pcm;rate=16000",
                        data: base64Data
                    }
                ]
            }
        };
        this.send(msg);
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.stopAudio();
    }
}
