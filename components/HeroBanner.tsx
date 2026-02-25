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
}

const HeroBanner = ({ hasSpecialCoupon = false }: HeroBannerProps) => {
    const [bannerData, setBannerData] = useState({
        title: 'AstharHat Biggest Sale',
        subtitle: "Up to 30% off on premium electronics and lifestyle gadgets. Don't miss out!",
        backgroundImage: null as string | null,
        bgOpacity: 0.5,
        showTimer: false,
        timerEndTime: '',
        showQr: false,
        qrValue: '',
        gradientFrom: 'blue-900',
        gradientTo: 'blue-800'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const docRef = doc(db, 'settings', 'hero-banner');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setBannerData(prev => ({ ...prev, ...(docSnap.data() as any) }));
                }
            } catch (error) {
                console.error("Error loading banner:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanner();
    }, []);

    if (loading) {
        return (
            <section className="w-full bg-gray-200 h-[300px] md:h-[500px] animate-pulse" />
        );
    }

    if ((bannerData as any).isActive === false) return null;

    return (
        <section className="relative w-full overflow-hidden bg-gray-50 group">
            <div className="relative h-[250px] md:h-[500px] w-full max-w-[1600px] mx-auto overflow-hidden shadow-sm">

                {/* Background Image Layer */}
                {bannerData.backgroundImage ? (
                    <div className="absolute inset-0">
                        <img
                            src={bannerData.backgroundImage}
                            alt="Banner"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-transparent to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-blue-900" />
                )
                }

                {/* Content Layer (Amazon Logic: Text left, Image right/bg) */}
                <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl">
                    <h1 className="text-white text-3xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-md leading-tight">
                        {bannerData.title}
                    </h1>
                    <p className="text-white/90 text-sm md:text-xl mb-8 font-medium max-w-lg">
                        {bannerData.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/shop" className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold text-sm md:text-base hover:bg-orange-600 shadow-xl transition-all active:scale-95 uppercase tracking-wide">
                            Shop Now
                        </Link>
                        {hasSpecialCoupon && <CouponCard code="ASTHAR30" />}
                    </div>
                </div>

                {/* Navigation Controls (Mock) */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft size={24} />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight size={24} />
                </button>

                {/* QR Section (Amazon Style Slide-in) */}
                {bannerData.showQr && bannerData.qrValue && (
                    <div className="absolute bottom-6 right-6 hidden lg:block">
                        <div className="bg-white p-3 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-100">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(bannerData.qrValue)}`}
                                alt="QR"
                                className="w-20 h-20"
                            />
                            <div className="flex flex-col pr-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase">App Exclusive</span>
                                <span className="text-sm font-bold text-blue-900">Scan for Deals</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Background Blur Gradient (Fades into content) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>
    );
};

export default HeroBanner;
