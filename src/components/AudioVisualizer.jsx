import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AudioVisualizer({ isActive, mode }) {
    // Mode: 'listening' | 'speaking' | 'processing' | 'idle'

    // We'll simulate the "Gemini Live" 4-bar or blob aesthetic.
    // For simplicity, we use 4 animated bars that react to "mode".

    return (
        <div className="visualizer-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            height: '100px'
        }}>
            {[0, 1, 2, 3].map(i => (
                <VisualizerBar key={i} index={i} mode={mode} isActive={isActive} />
            ))}
        </div>
    );
}

const VisualizerBar = ({ index, mode, isActive }) => {
    // Define animation properties based on mode
    let animate = {};
    let colors = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6']; // Blue -> Purple -> Pink

    if (!isActive || mode === 'idle') {
        animate = {
            height: 10,
            opacity: 0.3
        };
    } else if (mode === 'listening') {
        // Breathing animation
        animate = {
            height: [20, 40, 20],
            opacity: 0.8,
            transition: {
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
            }
        };
    } else if (mode === 'speaking') {
        // Active waveform simulation
        animate = {
            height: [30, 80, 40, 90, 30],
            opacity: 1,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.1,
                ease: "easeInOut"
            }
        };
    } else if (mode === 'processing') {
        // Fast pulsation
        animate = {
            height: [15, 25, 15],
            opacity: 0.6,
            transition: {
                duration: 0.5,
                repeat: Infinity,
                delay: index * 0.1
            }
        };
    }

    return (
        <motion.div
            style={{
                width: '16px',
                backgroundColor: colors[index],
                borderRadius: '8px',
                boxShadow: `0 0 15px ${colors[index]}80`
            }}
            initial={{ height: 10 }}
            animate={animate}
        />
    );
};
