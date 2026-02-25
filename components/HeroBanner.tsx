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
            <section className="w-full bg-gray-200 h-[300px] md:h-[500px] animate-pulse" />
        );
    }

    const currentBanners = Array.isArray(bannerData) ? bannerData : [];
    if (currentBanners.length === 0) return null;

    const currentBanner = currentBanners[activeIndex];

    const nextBanner = () => setActiveIndex((prev) => (prev + 1) % currentBanners.length);
    const prevBanner = () => setActiveIndex((prev) => (prev - 1 + currentBanners.length) % currentBanners.length);

    return (
        <section className="relative w-full overflow-hidden bg-gray-50 group">
            <div className="relative h-[300px] md:h-[550px] w-full max-w-[1600px] mx-auto overflow-hidden shadow-sm">

                {/* Background Image Layer */}
                <div key={activeIndex} className="absolute inset-0 animate-in fade-in zoom-in-95 duration-700">
                    {currentBanner.backgroundImage || currentBanner.imageUrl ? (
                        <div className="absolute inset-0">
                            <img
                                src={currentBanner.backgroundImage || currentBanner.imageUrl}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/20 to-transparent" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-blue-900" />
                    )
                    }

                    {/* Content Layer (Amazon Logic: Text left, Image right/bg) */}
                    <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-20 max-w-4xl">
                        <div className="space-y-4 md:space-y-6">
                            <div className="inline-block px-4 py-1.5 bg-orange-500 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                                Exclusive Offer
                            </div>
                            <h1 className="text-white text-3xl md:text-7xl font-black tracking-tighter drop-shadow-2xl leading-none">
                                {currentBanner.title}
                            </h1>
                            <p className="text-white/90 text-sm md:text-2xl font-bold max-w-xl leading-relaxed drop-shadow-lg">
                                {currentBanner.subtitle}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 pt-4">
                                <Link
                                    href={currentBanner.buttonLink || "/shop"}
                                    className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black text-sm md:text-lg hover:bg-orange-500 hover:text-white shadow-2xl transition-all active:scale-95 uppercase tracking-wide border-2 border-transparent hover:border-white"
                                >
                                    {currentBanner.buttonText || "Shop Now"}
                                </Link>
                                {hasSpecialCoupon && (activeIndex === 0) && <CouponCard code="ASTHAR30" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                {currentBanners.length > 1 && (
                    <>
                        <button
                            onClick={prevBanner}
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={nextBanner}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
                        >
                            <ChevronRight size={32} />
                        </button>

                        {/* Indicators */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                            {currentBanners.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-10 bg-orange-500' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* QR Section (Amazon Style Slide-in) */}
                {currentBanner.showQr && currentBanner.qrValue && (
                    <div className="absolute bottom-12 right-12 hidden lg:block z-20 animate-in slide-in-from-right-10 duration-1000">
                        <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl flex items-center gap-6 border border-white/20 transform hover:scale-105 transition-transform cursor-pointer">
                            <div className="bg-gray-50 p-2 rounded-2xl">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentBanner.qrValue)}`}
                                    alt="QR"
                                    className="w-24 h-24"
                                />
                            </div>
                            <div className="flex flex-col pr-4">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">App Exclusive</span>
                                <span className="text-xl font-black text-blue-900 leading-tight">Scan & Save<br />Flash Deal</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Background Blur Gradient (Fades into content) */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent z-0" />
        </section>
    );
};


export default HeroBanner;
