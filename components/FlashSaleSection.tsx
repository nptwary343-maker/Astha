'use client';

import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function FlashSaleSection() {
    const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: 59, s: 59, h: prev.m === 0 ? prev.h - 1 : prev.h };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }: { value: number, label: string }) => (
        <div className="flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl w-12 h-12 flex items-center justify-center border border-white/20">
                <span className="text-xl font-black text-white">{value.toString().padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase mt-1 tracking-widest">{label}</span>
        </div>
    );

    return (
        <section className="px-4 md:px-8 max-w-7xl mx-auto py-8">
            <div className="relative bg-gradient-to-br from-red-600 via-rose-600 to-orange-600 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-red-500/20">
                {/* Decorative BG Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black text-white uppercase tracking-widest border border-white/30 backdrop-blur-sm mb-4 animate-bounce">
                            <Zap size={14} fill="currentColor" /> Limited Time Offer
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
                            FLASH <span className="text-transparent border-t-2 border-b-2 border-white inline-block">SALE</span>
                        </h2>
                        <p className="text-white/80 text-lg font-bold mt-4 max-w-md">Grab premium electronics with up to 70% off. Sale ends soon!</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="flex gap-4">
                            <TimeUnit value={timeLeft.h} label="Hours" />
                            <TimeUnit value={timeLeft.m} label="Mins" />
                            <TimeUnit value={timeLeft.s} label="Secs" />
                        </div>

                        <Link
                            href="/shop?sale=flash"
                            className="group bg-white text-red-600 px-10 py-4 rounded-full font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            VIEW ALL DEALS <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
