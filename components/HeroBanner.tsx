'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Ticket, Copy, Check, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

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
            <div className="bg-white/90 backdrop-blur-sm border-2 border-dashed border-orange-500 rounded-xl p-3 flex items-center gap-3 transition-all hover:bg-white shadow-lg">
                <Ticket className="text-orange-600" size={18} />
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">Coupon Code</span>
                    <span className="text-lg font-black text-blue-900 leading-tight">{code}</span>
                </div>
                <div className="ml-2 pl-3 border-l border-gray-200">
                    {copied ? <Check className="text-green-500" size={18} /> : <Copy className="text-gray-400 group-hover:text-orange-500" size={18} />}
                </div>
            </div>
        </div>
    );
};

import { m, AnimatePresence } from 'framer-motion';

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
            <section className="w-full bg-[#eff0f5] h-[300px] md:h-[500px] animate-pulse rounded-sm" />
        );
    }

    const currentBanners = Array.isArray(bannerData) ? bannerData : [];
    if (currentBanners.length === 0) return null;

    const currentBanner = currentBanners[activeIndex];

    const nextBanner = () => setActiveIndex((prev) => (prev + 1) % currentBanners.length);
    const prevBanner = () => setActiveIndex((prev) => (prev - 1 + currentBanners.length) % currentBanners.length);

    return (
        <section className="relative w-full overflow-hidden bg-white mb-6">
            <div className="relative h-[320px] md:h-[450px] w-full max-w-[1188px] mx-auto overflow-hidden shadow-sm rounded-sm">

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
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    src={currentBanner.backgroundImage || currentBanner.imageUrl}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-[#212121]" />
                        )}

                        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 max-w-2xl">
                            <m.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="space-y-3 md:space-y-4"
                            >
                                <h1 className="text-white text-3xl md:text-5xl font-normal leading-tight">
                                    {currentBanner.title}
                                </h1>
                                <p className="text-white/90 text-sm md:text-lg font-light max-w-lg leading-relaxed">
                                    {currentBanner.subtitle}
                                </p>
                                <div className="pt-4">
                                    <Link
                                        href={currentBanner.buttonLink || "/shop"}
                                        className="bg-[#f57224] text-white px-8 py-3 rounded-none font-medium text-sm md:text-base hover:bg-[#d0611e] transition-colors shadow-lg active:scale-95 inline-block"
                                    >
                                        {currentBanner.buttonText || "SHOP NOW"}
                                    </Link>
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/10 hover:bg-black/30 text-white rounded-full transition-all z-20"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextBanner}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/10 hover:bg-black/30 text-white rounded-full transition-all z-20"
                        >
                            <ChevronRight size={24} />
                        </button>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {currentBanners.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 bg-[#f57224]' : 'w-2 bg-white/50 hover:bg-white'}`}
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
