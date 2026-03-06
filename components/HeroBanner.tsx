'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Ticket, Copy, Check, Zap, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Magnet } from './motion/MotionGraphics';
import { motion, AnimatePresence } from 'framer-motion';


interface HeroBannerProps {
    customBanners?: any[];
}

const HeroBanner = ({ customBanners = [] }: HeroBannerProps) => {
    const [globalSettings, setGlobalSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bannerData, setBannerData] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setLoading(true);
        // 1. Listen for Global Settings (Carousel Height, etc.)
        const globalUnsub = onSnapshot(doc(db, 'settings', 'hero-banner'), (docSnap) => {
            if (docSnap.exists()) {
                const globalData = docSnap.data();
                setGlobalSettings(globalData);

                // If no custom banners provided via props, use the global single banner
                if (customBanners.length === 0) {
                    setBannerData([globalData]);
                }
            }
            setLoading(false);
        }, (error) => {
            console.error("HeroBanner Settings Sync Error:", error);
            setLoading(false);
        });

        // 2. Handle Custom Banners (if provided from props)
        if (customBanners.length > 0) {
            setBannerData(customBanners);
            setLoading(false);
        }

        return () => globalUnsub();
    }, [customBanners]);



    if (loading) {
        return (
            <section className="w-full h-[400px] md:h-[600px] bg-slate-100 animate-pulse rounded-[2.5rem] mt-4" />
        );
    }

    const currentBanners = Array.isArray(bannerData) ? bannerData : [];
    if (currentBanners.length === 0) return null;

    const currentBanner = currentBanners[activeIndex];

    // CSS-Native Responsive Height Calculation (Prevents CLS)
    const mH = currentBanner?.mobileBannerHeight || globalSettings?.mobileBannerHeight || 220;
    const dH = currentBanner?.bannerHeight || globalSettings?.bannerHeight || 650;

    const nextBanner = () => setActiveIndex((prev) => (prev + 1) % currentBanners.length);
    const prevBanner = () => setActiveIndex((prev) => (prev - 1 + currentBanners.length) % currentBanners.length);

    return (
        <section className="relative w-full py-4 px-4 md:px-8">
            <div
                className={`relative w-full max-w-[1600px] mx-auto overflow-hidden shadow-sm border border-slate-200 bg-white group h-[var(--mobile-height)] md:h-[var(--desktop-height)] ${currentBanner.shape === 'square' ? 'rounded-none' : currentBanner.shape === 'pill' ? 'rounded-full' : 'rounded-[2rem] md:rounded-[2.5rem]'}`}
                style={{
                    '--mobile-height': `${mH}px`,
                    '--desktop-height': `${dH}px`
                } as React.CSSProperties}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                    >
                        {/* Background with Parallel Effect */}
                        <motion.div
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0"
                        >
                            {currentBanner.videoUrl ? (
                                <video
                                    src={currentBanner.videoUrl}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className={`w-full h-full object-cover ${currentBanner.videoPosition || 'object-center'}`}
                                />
                            ) : (
                                <picture className="w-full h-full">
                                    <source
                                        media="(max-width: 768px)"
                                        srcSet={currentBanner.mobileImageUrl || currentBanner.backgroundImage || currentBanner.imageUrl}
                                    />
                                    <img
                                        src={currentBanner.backgroundImage || currentBanner.imageUrl}
                                        alt={currentBanner.title}
                                        className={`w-full h-full object-cover transition-transform duration-[20s] linear ${currentBanner.videoPosition || 'object-center'}`}
                                    />
                                </picture>
                            )}

                            {/* 🌈 NEW: Premium Colorful Blobs (Desktop & Mobile) */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
                                <motion.div
                                    animate={{
                                        x: [0, 40, -20, 0],
                                        y: [0, -30, 20, 0],
                                        scale: [1, 1.2, 0.9, 1],
                                        rotate: [0, 45, -45, 0],
                                    }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] bg-sky-500/30 blur-[100px] rounded-full mix-blend-screen"
                                />
                                <motion.div
                                    animate={{
                                        x: [0, -40, 30, 0],
                                        y: [0, 50, -30, 0],
                                        scale: [1, 0.8, 1.1, 1],
                                        rotate: [0, -90, 90, 0],
                                    }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-emerald-500/30 blur-[120px] rounded-full mix-blend-screen"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-1/2 left-1/4 w-[40%] h-[40%] bg-rose-500/20 blur-[150px] rounded-full mix-blend-overlay"
                                />
                            </div>

                            {/* 🌓 Enhanced Dynamic Overlay for Contrast */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-white/95 md:via-white/60 md:to-transparent/20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-none" />
                        </motion.div>

                        {/* Content Area */}
                        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-8 md:px-24 py-12">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="max-w-2xl space-y-4 md:space-y-8"
                            >
                                <motion.div
                                    animate={{
                                        y: [0, -8, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="inline-flex items-center gap-2 bg-white/10 dark:bg-black/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-2xl"
                                >
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-ping" />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white md:text-brand-primary">Premium Selection</span>
                                </motion.div>

                                <div className="space-y-2 md:space-y-4">
                                    <motion.h1
                                        initial={{ filter: 'blur(10px)', opacity: 0 }}
                                        animate={{ filter: 'blur(0px)', opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="text-white md:text-slate-950 text-3xl sm:text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter drop-shadow-2xl md:drop-shadow-none italic uppercase"
                                    >
                                        {currentBanner.title}
                                    </motion.h1>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-white/95 md:text-slate-700 text-sm md:text-2xl font-bold max-w-xl leading-relaxed border-l-4 md:border-l-[6px] border-brand-primary pl-4 md:pl-8 py-1"
                                    >
                                        {currentBanner.subtitle}
                                    </motion.p>
                                </div>

                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="pt-6 sm:pt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Link
                                            href={currentBanner.buttonLink || "/shop"}
                                            className="relative group/btn overflow-hidden block"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-indigo-600 transition-transform duration-500 group-hover/btn:scale-105" />
                                            <div className="relative bg-brand-primary text-white px-8 md:px-14 py-4 md:py-6 rounded-2xl font-black text-xs md:text-lg hover:bg-slate-900 transition-all shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] flex items-center gap-3 uppercase tracking-widest active:scale-95" style={{ background: 'var(--brand-primary)' }}>
                                                {currentBanner.buttonText || "Get Started"}
                                                <ChevronRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                </motion.div>

                                {/* Trust Signal Badges */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1, duration: 1 }}
                                    className="pt-8 md:pt-16 flex flex-wrap gap-6 md:gap-12"
                                >
                                    <div className="flex items-center gap-3 md:gap-5 text-white md:text-slate-600 group/item">
                                        <div className="p-2 md:p-3 bg-white/10 md:bg-brand-primary/5 rounded-2xl border border-white/20 md:border-brand-primary/20 transition-all group-hover/item:scale-110 group-hover/item:rotate-12 shadow-xl">
                                            <ShieldCheck size={20} className="text-brand-primary md:text-brand-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-sm font-black text-white md:text-slate-900 uppercase tracking-tighter">100% Secure</span>
                                            <span className="text-[8px] md:text-xs font-bold text-white/70 md:text-slate-500 uppercase tracking-widest hidden sm:block">Verified Quality</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-5 text-white md:text-slate-600 group/item">
                                        <div className="p-2 md:p-3 bg-white/10 md:bg-orange-500/5 rounded-2xl border border-white/20 md:border-orange-500/20 transition-all group-hover/item:scale-110 group-hover/item:rotate-12 shadow-xl">
                                            <Zap size={20} className="text-orange-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-sm font-black text-white md:text-slate-900 uppercase tracking-tighter">Fast Dispatch</span>
                                            <span className="text-[8px] md:text-xs font-bold text-white/70 md:text-slate-500 uppercase tracking-widest hidden sm:block">24h Ready</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Modern Navigation */}
                {currentBanners.length > 1 && (
                    <div className="absolute right-6 sm:right-12 bottom-6 sm:bottom-12 flex items-center gap-4 sm:gap-6 z-20">
                        <div className="flex gap-2">
                            {currentBanners.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-700 ${activeIndex === i ? 'w-16 bg-indigo-600' : 'w-4 bg-slate-300'}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={prevBanner} className="w-12 h-12 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextBanner} className="w-12 h-12 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroBanner;
