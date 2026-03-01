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
            <div
                className={`relative w-full max-w-[1600px] mx-auto overflow-hidden shadow-sm border border-slate-200 bg-white group min-h-[350px] md:min-h-[450px] ${currentBanner.shape === 'square' ? 'rounded-none' : currentBanner.shape === 'pill' ? 'rounded-full' : 'rounded-[2.5rem]'}`}
                style={currentBanner.bannerHeight ? { height: `${currentBanner.bannerHeight}px` } : { height: 'auto' }}
            >

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
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
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
                                <div
                                    className={`absolute inset-0 bg-cover ${currentBanner.videoPosition || 'object-center'}`}
                                    style={{ backgroundImage: `url(${currentBanner.backgroundImage || currentBanner.imageUrl})` }}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
                        </m.div>

                        {/* Content Area */}
                        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-24">
                            <m.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="max-w-2xl space-y-6"
                            >
                                <div className="inline-flex items-center gap-2 bg-indigo-50 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-100">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Premium Collection</span>
                                </div>

                                <h1 className="text-slate-900 text-3xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-sm">
                                    {currentBanner.title}
                                </h1>

                                <p className="text-slate-600 text-sm md:text-lg font-medium max-w-xl leading-relaxed border-l-4 border-indigo-600 pl-4 md:pl-6">
                                    {currentBanner.subtitle}
                                </p>

                                <div className="pt-8 flex flex-wrap items-center gap-6">
                                    <Link
                                        href={currentBanner.buttonLink || "/shop"}
                                        className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 group/btn"
                                    >
                                        {currentBanner.buttonText || "Shop Now"}
                                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>

                                    {hasSpecialCoupon && <CouponCard code="ASTHAR70" />}
                                </div>

                                {/* Trust Signal Badges */}
                                <m.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 1 }}
                                    className="pt-10 flex flex-wrap gap-8"
                                >
                                    <div className="flex items-center gap-3 text-slate-500 group/item">
                                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 group-hover/item:border-indigo-200 group-hover/item:bg-indigo-50 transition-all">
                                            <ShieldCheck size={20} className="text-indigo-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-800">100% Secure</span>
                                            <span className="text-[10px] font-medium text-slate-500">Satisfaction Guaranteed</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 group/item">
                                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 group-hover/item:border-indigo-200 group-hover/item:bg-indigo-50 transition-all">
                                            <Zap size={20} className="text-amber-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-800">Fast Dispatch</span>
                                            <span className="text-[10px] font-medium text-slate-500">Ready to Ship</span>
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
