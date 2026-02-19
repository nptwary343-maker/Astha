'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Ticket, Copy, Check, Zap } from 'lucide-react';

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
        <div
            onClick={handleCopy}
            className="group relative cursor-pointer animate-soft-float"
        >
            {/* Ticket Shape with Dashed Border */}
            <div className="relative bg-black/20 backdrop-blur-md border-2 border-dashed border-yellow-400/50 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-yellow-400 group-active:scale-95">

                {/* Left Side: Icon */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-xl shadow-lg shadow-yellow-500/20">
                    <Ticket className="text-black" size={20} />
                </div>

                {/* Center: Logic */}
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400/80">Best Seller Deal</span>
                    <span className="text-xl font-black text-white tracking-tighter">{code}</span>
                </div>

                {/* Right Side: Copy/Check Icon */}
                <div className="ml-2 pl-4 border-l border-white/10">
                    {copied ? (
                        <Check className="text-green-400 animate-in zoom-in" size={18} />
                    ) : (
                        <Copy className="text-white/40 group-hover:text-yellow-400 transition-colors" size={18} />
                    )}
                </div>

                {/* Toast Message */}
                {copied && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-bold shadow-xl animate-in fade-in slide-in-from-bottom-2">
                        Copied!
                    </div>
                )}
            </div>

            {/* Glowing Accent */}
            <div className="absolute inset-0 bg-yellow-400/10 blur-xl -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

interface HeroBannerProps {
    hasSpecialCoupon?: boolean;
}

const CountdownTimer = ({ endTime }: { endTime: string }) => {
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    if (!timeLeft) return null;

    return (
        <div className="flex gap-2">
            {[
                { v: timeLeft.h, l: 'H' },
                { v: timeLeft.m, l: 'M' },
                { v: timeLeft.s, l: 'S' }
            ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="bg-black/80 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-xl">
                        <span className="text-xl font-black text-white">{unit.v.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] font-bold text-white/50 mt-1">{unit.l}</span>
                </div>
            ))}
        </div>
    );
};

const HeroBanner = ({ hasSpecialCoupon = false }: HeroBannerProps) => {
    const [bannerData, setBannerData] = useState({
        title: 'AstharHat Biggest Sale',
        subtitle: "Up to 30% off on premium electronics and lifestyle gadgets. Don't miss out!",
        gradientFrom: 'orange-600',
        gradientTo: 'purple-900',
        backgroundImage: null as string | null,
        bgOpacity: 0.5,
        showTimer: false,
        timerEndTime: '',
        showQr: false,
        qrValue: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const docRef = doc(db, 'settings', 'hero-banner');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setBannerData(docSnap.data() as any);
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
            <section className="relative w-full px-4 py-6">
                <div className="rounded-2xl bg-gray-100 p-12 h-[300px] animate-pulse flex flex-col items-center justify-center">
                    <div className="h-8 w-2/3 bg-gray-200 rounded mb-4"></div>
                </div>
            </section>
        );
    }

    if ((bannerData as any).isActive === false) return null;

    return (
        <section className="relative w-full px-4 py-6">
            <div
                className={`relative rounded-3xl overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between min-h-[350px] shadow-xl shadow-purple-200 group`}
            >
                {/* Timer Overlay - Top Right */}
                {bannerData.showTimer && bannerData.timerEndTime && (
                    <div className="absolute top-6 right-6 z-20 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="bg-red-600/90 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white/20 shadow-2xl flex flex-col items-center">
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-3 flex items-center gap-1">
                                <Zap size={10} fill="currentColor" /> Flash Sale Ends
                            </span>
                            <CountdownTimer endTime={bannerData.timerEndTime} />
                        </div>
                    </div>
                )}

                {/* Background Image Layer */}
                {bannerData.backgroundImage && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={bannerData.backgroundImage}
                            alt="Banner Background"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div
                            className="absolute inset-0 bg-black"
                            style={{ opacity: bannerData.bgOpacity ?? 0.5 }}
                        ></div>
                    </div>
                )}

                {/* Gradient Fallback Layer (if no image) */}
                {!bannerData.backgroundImage && (
                    <div className={`absolute inset-0 bg-gradient-to-r from-${bannerData.gradientFrom} to-${bannerData.gradientTo} -z-10`} style={{
                        backgroundImage: `linear-gradient(to right, ${getColor(bannerData.gradientFrom)}, ${getColor(bannerData.gradientTo)})`
                    }} />
                )}


                {/* Content Layer */}
                <div className="relative z-10 text-center md:text-left max-w-2xl">
                    <h1 className="text-white text-4xl md:text-7xl font-black mb-6 tracking-tighter drop-shadow-lg leading-none animate-fade-in-up uppercase italic" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                        {bannerData.title}
                    </h1>
                    <p className="text-white/90 text-lg md:text-2xl mb-10 font-medium drop-shadow-md animate-fade-in-up delay-200 max-w-lg">
                        {bannerData.subtitle}
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-6 animate-fade-in-up delay-300">
                        <Link href="/shop" className="inline-block bg-white text-black px-10 py-5 rounded-full font-black text-xl hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl active:scale-95 text-center w-full md:w-auto uppercase tracking-tighter">
                            Shop The Collection
                        </Link>

                        {/* Special Coupon Overlay */}
                        {hasSpecialCoupon && (
                            <div className="md:ml-auto">
                                <CouponCard code="BEST50" />
                            </div>
                        )}
                    </div>
                </div>

                {/* QR Code Section - Dynamic */}
                {bannerData.showQr && bannerData.qrValue && (
                    <div className="relative z-10 mt-8 md:mt-0 hidden lg:block animate-in slide-in-from-right duration-700">
                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-[2.5rem] border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-all cursor-pointer group/qr">
                            <div className="bg-white p-4 rounded-3xl group-hover/qr:scale-105 transition-transform shadow-inner">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(bannerData.qrValue)}`}
                                    alt="Scan for Deal"
                                    className="w-32 h-32 md:w-44 md:h-44"
                                />
                            </div>
                            <p className="text-white text-[10px] font-black text-center mt-4 uppercase tracking-[0.3em]">Scan to Claim</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Optional styling for local classes if needed elsewhere, but using Tailwind mostly */}
            <style jsx>{`
                @keyframes soft-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-soft-float {
                    animation: soft-float 3s ease-in-out infinite;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
            `}</style>
        </section>
    );
};

const getColor = (colorName: string) => {
    const colors: any = {
        'orange-600': '#ea580c',
        'purple-900': '#581c87',
        'blue-600': '#2563eb',
        'red-600': '#dc2626',
        'green-600': '#16a34a',
        'pink-600': '#db2777',
        'indigo-600': '#4f46e5',
    };
    return colors[colorName] || colorName;
}

export default HeroBanner;
