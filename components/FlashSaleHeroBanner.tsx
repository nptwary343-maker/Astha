'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { fetchFlashSaleConfigAction } from '@/actions/public-data';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashSaleConfig {
    title: string;
    subtitle?: string;
    targetDate: string;
    isActive: boolean;
    backgroundImage?: string;
}

export default function FlashSaleHeroBanner() {
    const [config, setConfig] = useState<FlashSaleConfig | null>(null);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'flash-sale'), (docSnap) => {
            if (docSnap.exists()) {
                setConfig(docSnap.data() as FlashSaleConfig);
            }
        }, (err) => {
            console.error("Flash Sale Sync Error:", err);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (!config || !config.isActive || !config.targetDate) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(config.targetDate).getTime();
            const difference = target - now;

            if (difference <= 0) {
                setIsExpired(true);
                clearInterval(timer);
            } else {
                setIsExpired(false);
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [config]);

    if (!config || !config.isActive || isExpired) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full overflow-hidden rounded-[3rem] bg-slate-950 border border-slate-800 shadow-2xl"
        >
            {/* Dark abstract backgrounds */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[120px] -mr-60 -mt-60 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] -ml-40 -mb-40" />

                {/* 🌈 NEW: Premium Colorful Blobs for Flash Sale */}
                <motion.div
                    animate={{
                        x: [0, 60, -30, 0],
                        y: [0, -40, 40, 0],
                        scale: [1, 1.3, 0.8, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-red-600/20 blur-[130px] rounded-full mix-blend-screen"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 40, 0],
                        y: [0, 60, -20, 0],
                        scale: [1, 0.9, 1.2, 1],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/3 w-[35%] h-[35%] bg-amber-500/15 blur-[110px] rounded-full mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 right-1/4 w-[30%] h-[30%] bg-cyan-500/10 blur-[90px] rounded-full mix-blend-screen"
                />

                {/* Image Overlay if available */}
                {config.backgroundImage && (
                    <img
                        src={config.backgroundImage}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-[30s] linear animate-slow-zoom"
                        alt="Flash Sale Background"
                    />
                )}

                {/* Patterns */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 px-8 py-16 md:py-24 flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    animate={{
                        y: [0, -6, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                >
                    <Zap size={12} fill="currentColor" className="animate-pulse" />
                    Limited Time Offer
                </motion.div>

                <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter italic uppercase leading-tight drop-shadow-2xl">
                    {config.title || 'DHAMAKA FLASH SALE'}
                </h2>
                <p className="text-slate-400 text-sm md:text-xl max-w-2xl mb-12 font-medium tracking-wide">
                    {config.subtitle || 'Premium quality artifacts at unbeatable prices. Once the timer hits zero, the deals are gone forever!'}
                </p>

                {/* Countdown Grid */}
                <div className="grid grid-cols-4 gap-3 md:gap-6 mb-12">
                    <CountdownItem value={timeLeft.days} label="Days" />
                    <CountdownItem value={timeLeft.hours} label="Hours" />
                    <CountdownItem value={timeLeft.minutes} label="Mins" />
                    <CountdownItem value={timeLeft.seconds} label="Secs" />
                </div>

                <Link
                    href="/shop"
                    className="group relative inline-flex items-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:bg-brand-primary hover:text-white hover:scale-105 active:scale-95 shadow-2xl"
                >
                    <ShoppingBag size={18} />
                    Check Global Offers
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* Side Labels */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 hidden lg:block">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.8em] vertical-text select-none">DHAMAKA • DHAMAKA • DHAMAKA</p>
            </div>
            <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden lg:block">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.8em] vertical-text select-none">OFFER • OFFER • OFFER</p>
            </div>

            <style jsx>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }
            `}</style>
        </motion.section>
    );
}

function CountdownItem({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl relative group overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <AnimatePresence mode="wait">
                    <motion.span
                        key={value}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-2xl md:text-5xl font-black text-white font-mono tracking-tighter relative z-10"
                    >
                        {value.toString().padStart(2, '0')}
                    </motion.span>
                </AnimatePresence>
            </div>
            <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-4">{label}</span>
        </div>
    );
}
