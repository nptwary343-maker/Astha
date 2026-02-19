'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface SoundContextType {
    isSoundEnabled: boolean;
    toggleSound: () => void;
    playSuccess: () => void;
    playNotification: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEY = 'aez_sound_enabled';

export function SoundProvider({ children }: { children: ReactNode }) {
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsSoundEnabled(stored === 'true');
        }
        setIsInitialized(true);
    }, []);

    const toggleSound = () => {
        setIsSoundEnabled(prev => {
            const newState = !prev;
            localStorage.setItem(STORAGE_KEY, String(newState));
            return newState;
        });
    };

    const playSuccess = useCallback(() => {
        if (!isSoundEnabled) return;
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();

            // Play a pleasant ascending major triad (C - E - G)
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            const start = ctx.currentTime;

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start + i * 0.1);

                gain.gain.setValueAtTime(0, start + i * 0.1);
                gain.gain.linearRampToValueAtTime(0.1, start + i * 0.1 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, start + i * 0.1 + 0.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(start + i * 0.1);
                osc.stop(start + i * 0.1 + 0.5);
            });
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }, [isSoundEnabled]);

    const playNotification = useCallback(() => {
        if (!isSoundEnabled) return;
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }, [isSoundEnabled]);



    return (
        <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playSuccess, playNotification }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
