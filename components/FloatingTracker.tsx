'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import Link from 'next/link';

const FloatingTracker = () => {
    return (
        <div className="fixed bottom-24 right-8 z-[100] group">
            <Link href="/tracking">
                <div className="relative">
                    {/* Outer Glow/Pulse */}
                    <div className="absolute -inset-4 bg-red-600/30 blur-2xl rounded-full animate-pulse group-hover:bg-red-600/50 transition-all" />

                    {/* Rotating Ring */}
                    <div className="absolute -inset-1 rounded-full border border-red-500/30 border-dashed animate-[spin_10s_linear_infinite]" />

                    {/* Main Button */}
                    <div className="relative w-16 h-16 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center shadow-2xl border border-red-500/20 group-hover:border-red-500 transition-all">
                        <Truck size={28} className="text-red-600 group-hover:scale-110 group-hover:animate-bounce transition-transform" />

                        {/* Live Indicator */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white dark:border-zinc-950 animate-ping" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white dark:border-zinc-950" />

                        {/* Hover Tooltip/Label */}
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                            Track Your Order
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default FloatingTracker;
