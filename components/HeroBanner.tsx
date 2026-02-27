'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Ticket, Copy, Check, Zap, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Magnet } from './motion/MotionGraphics';

const CouponCard = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div onClick={handleCopy} className="relative cursor-pointer group">
            <div className="bg-white/95 backdrop-blur-md border-2 border-dashed border-brand-primary/30 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-white shadow-xl hover:border-brand-primary/50">
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                        <Ticket className="text-brand-primary" size={20} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] leading-none mb-1">
                        Locked Asset
                    </span>
                    <span className="text-xl font-black text-text-main leading-tight tracking-tighter uppercase italic">
                        {code.slice(0, 3)}****
                    </span>
                </div>
                <div className="ml-auto pl-4 border-l border-border-light">
                    {copied ? (
                        <Check className="text-emerald-500" size={20} />
                    ) : (
                        <div className="w-10 h-10 rounded-xl hover:bg-ui-bg flex items-center justify-center transition-colors">
                            <Copy className="text-text-muted group-hover:text-brand-primary" size={18} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import { m, AnimatePresence } from 'framer-motion';

interface HeroBannerProps {
    hasSpecialCoupon?: boolean;
    customBanners?: any[];
}

const HeroBanner = ({ hasSpecialCoupon = false, customBanners = [] }: HeroBannerProps) => {
    const [bannerData, setBannerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchBanner = async () => {
            if (customBanners.length > 0) {
                setBannerData(customBanners);
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, 'settings', 'hero-banner');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setBannerData([docSnap.data()]);
                }
            } catch (error) {
                console.error("Error loading banner:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanner();
    }, [customBanners]);

    if (loading) {
        return (
            <section className="w-full h-[400px] md:h-[600px] bg-slate-100 animate-pulse rounded-[2.5rem] mt-4" />
        );
    }

    const currentBanners = Array.isArray(bannerData) ? bannerData : [];
    if (currentBanners.length === 0) return null;

    const currentBanner = currentBanners[activeIndex];

    const nextBanner = () => setActiveIndex((prev) => (prev + 1) % currentBanners.length);
    const prevBanner = () => setActiveIndex((prev) => (prev - 1 + currentBanners.length) % currentBanners.length);

    return (
        <section className="relative w-full py-4 px-4 md:px-8">
            <div className="relative h-[450px] md:h-[650px] w-full max-w-[1600px] mx-auto overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] border border-white/40 bg-slate-900 group">

                <AnimatePresence mode="wait">
                    <m.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                    >
                        {/* Background with Parallel Effect */}
                        <m.div
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${currentBanner.backgroundImage || currentBanner.imageUrl})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                        </m.div>

                        {/* Content Area */}
                        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-24">
                            <m.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="max-w-3xl space-y-6"
                            >
                                <div className="inline-flex items-center gap-2 bg-indigo-600/20 backdrop-blur-xl px-4 py-2 rounded-full border border-indigo-400/30">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100">Premium Collection</span>
                                </div>

                                <h1 className="text-white text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase italic drop-shadow-2xl">
                                    {currentBanner.title}
                                </h1>

                                <p className="text-slate-300 text-sm md:text-lg font-bold max-w-xl leading-relaxed uppercase tracking-wide opacity-80 border-l-4 border-indigo-600 pl-6">
                                    {currentBanner.subtitle}
                                </p>

                                <div className="pt-8 flex flex-wrap items-center gap-6">
                                    <Link
                                        href={currentBanner.buttonLink || "/shop"}
                                        className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-xs md:text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3 uppercase tracking-widest group/btn"
                                    >
                                        {currentBanner.buttonText || "এখনই কিনুন"}
                                        <Zap size={18} className="fill-current group-hover:scale-125 transition-transform" />
                                    </Link>

                                    {hasSpecialCoupon && <CouponCard code="ASTHAR70" />}
                                </div>

                                {/* Trust Signal Badges */}
                                <m.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1, duration: 1 }}
                                    className="pt-10 flex flex-wrap gap-8"
                                >
                                    <div className="flex items-center gap-3 text-white/50 group/item">
                                        <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover/item:bg-indigo-600/20 group-hover/item:border-indigo-500/50 transition-all">
                                            <ShieldCheck size={20} className="text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">১০০% ক্যাশ ব্যাক</span>
                                            <span className="text-[8px] font-bold text-white/30 uppercase">সন্তুষ্টি নিশ্চিত</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/50 group/item">
                                        <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover/item:bg-indigo-600/20 group-hover/item:border-indigo-500/50 transition-all">
                                            <Zap size={20} className="text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">দ্রুত ডেলিভারি</span>
                                            <span className="text-[8px] font-bold text-white/30 uppercase">৫-৭ দিনের মধ্যে</span>
                                        </div>
                                    </div>
                                </m.div>
                            </m.div>
                        </div>
                    </m.div>
                </AnimatePresence>

                {/* Modern Navigation */}
                {currentBanners.length > 1 && (
                    <div className="absolute right-12 bottom-12 flex items-center gap-6 z-20">
                        <div className="flex gap-2">
                            {currentBanners.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-700 ${activeIndex === i ? 'w-16 bg-white' : 'w-4 bg-white/20'}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={prevBanner} className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextBanner} className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90">
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
