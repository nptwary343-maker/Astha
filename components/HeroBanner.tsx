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
            <section className="w-full bg-ui-bg h-[300px] md:h-[500px] animate-pulse rounded-[3rem]" />
        );
    }

    const currentBanners = Array.isArray(bannerData) ? bannerData : [];
    if (currentBanners.length === 0) return null;

    const currentBanner = currentBanners[activeIndex];

    const nextBanner = () => setActiveIndex((prev) => (prev + 1) % currentBanners.length);
    const prevBanner = () => setActiveIndex((prev) => (prev - 1 + currentBanners.length) % currentBanners.length);

    return (
        <section className="relative w-full overflow-hidden bg-slate-50 py-4 px-4">
            <div className="relative h-[400px] md:h-[550px] w-full max-w-[1600px] mx-auto overflow-hidden shadow-2xl rounded-[3rem] border border-white/20">

                <AnimatePresence mode="wait">
                    <m.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {currentBanner.backgroundImage || currentBanner.imageUrl ? (
                            <div className="absolute inset-0">
                                <m.img
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    src={currentBanner.backgroundImage || currentBanner.imageUrl}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-text-main/80 via-text-main/40 to-transparent" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-text-main" />
                        )}

                        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-20 max-w-3xl">
                            <m.div
                                initial={{ x: -40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.7 }}
                                className="space-y-6"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 w-fit">
                                    Limited Edition 2024
                                </span>
                                <h1 className="text-white text-4xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic">
                                    {currentBanner.title}
                                </h1>
                                <p className="text-white/70 text-sm md:text-xl font-medium max-w-lg leading-relaxed uppercase tracking-wide">
                                    {currentBanner.subtitle}
                                </p>
                                <div className="pt-8 flex flex-wrap items-center gap-6">
                                    <Magnet distance={25}>
                                        <Link
                                            href={currentBanner.buttonLink || "/shop"}
                                            className="bg-brand-primary text-white px-10 py-5 rounded-full font-black text-xs md:text-sm hover:bg-indigo-600 transition-all shadow-2xl shadow-brand-primary/30 active:scale-95 inline-block uppercase tracking-[0.2em] border border-white/10"
                                        >
                                            {currentBanner.buttonText || "Begin Exploration"}
                                        </Link>
                                    </Magnet>
                                    {hasSpecialCoupon && <CouponCard code="ASTHAR70" />}
                                </div>
                            </m.div>
                        </div>
                    </m.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                {currentBanners.length > 1 && (
                    <>
                        <button
                            onClick={prevBanner}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all z-20 border border-white/20 group"
                        >
                            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={nextBanner}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all z-20 border border-white/20 group"
                        >
                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="absolute bottom-10 left-20 flex gap-3 z-20">
                            {currentBanners.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-12 bg-brand-primary' : 'w-4 bg-white/30 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};


export default HeroBanner;
