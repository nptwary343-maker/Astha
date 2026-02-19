'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Clock, ShoppingBag } from 'lucide-react';
import { fetchFlashSaleConfigAction } from '@/actions/public-data';
import Link from 'next/link';

interface FlashSaleConfig {
    title: string;
    targetDate: string;
    isActive: boolean;
}

export default function FlashSaleBanner() {
    const [config, setConfig] = useState<FlashSaleConfig | null>(null);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const loadFlashSale = async () => {
            const data = await fetchFlashSaleConfigAction();
            if (data) {
                setConfig(data as FlashSaleConfig);
            }
        };
        loadFlashSale();
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

    // Visibility Logic: Hide if inactive, no config, or expired
    if (!config || !config.isActive || isExpired) return null;

    return (
        <div className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-[length:200%_auto] animate-gradient shadow-xl border-b border-white/10 transition-all duration-500 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">

                    {/* Title Section */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                            <Zap className="text-white" fill="currentColor" size={18} />
                        </div>
                        <h2 className="text-white font-black italic tracking-tighter uppercase text-lg md:text-xl drop-shadow-md">
                            {config.title || 'FLASH SALE'}
                        </h2>
                    </div>

                    {/* Countdown Section */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-1">
                            <TimeUnit value={timeLeft.days} label="d" />
                            <span className="text-white/50 font-bold">:</span>
                            <TimeUnit value={timeLeft.hours} label="h" />
                            <span className="text-white/50 font-bold">:</span>
                            <TimeUnit value={timeLeft.minutes} label="m" />
                            <span className="text-white/50 font-bold">:</span>
                            <TimeUnit value={timeLeft.seconds} label="s" />
                        </div>

                        <Link
                            href="/shop"
                            className="bg-white text-red-600 px-5 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest shadow-lg hover:bg-red-50 hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <ShoppingBag size={14} />
                            Shop Now
                        </Link>
                    </div>

                </div>
            </div>

            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-black/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-lg border border-white/10 min-w-[32px] md:min-w-[40px] flex items-center justify-center">
                <span className="text-white font-mono text-lg md:text-xl font-black leading-none">
                    {value.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-white/60 font-bold uppercase ml-0.5">{label}</span>
            </div>
        </div>
    );
}
