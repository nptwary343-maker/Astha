'use client';

import { Phone, Truck, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function FloatingActionButtons() {
    const [phone, setPhone] = useState('+8801900000000');
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const savedPhone = localStorage.getItem('store_phone');
        if (savedPhone) {
            setPhone(savedPhone);
        }

        // Show tooltip playfully after a few seconds
        const timer = setTimeout(() => setShowTooltip(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed bottom-24 md:bottom-10 right-6 z-[100] flex flex-col gap-4 items-end">

            {/* Tracking Button */}
            <Link
                href="/tracking"
                className="bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-lg shadow-blue-200 hover:scale-110 transition-transform flex items-center justify-center group relative w-12 h-12 md:h-14 md:w-14"
                title="Track My Order"
            >
                <Truck size={22} fill="none" />
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none border border-gray-700">
                    Track Order
                </span>
            </Link>

            {/* Support / Phone Wrapper */}
            <div
                className="relative flex items-center justify-end"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Initial "Need Help?" Tooltip bubble - Above on mobile, Left on desktop */}
                <div className={`absolute bottom-full mb-3 right-0 md:bottom-auto md:mb-0 md:right-[120%] bg-white border border-gray-100 shadow-2xl rounded-2xl p-3 w-48 transition-all duration-700 pointer-events-none origin-bottom md:origin-right
                    ${(showTooltip && !isHovered) ? 'opacity-100 translate-y-0 md:translate-y-0 md:translate-x-0 scale-100' : 'opacity-0 translate-y-4 md:translate-y-0 md:translate-x-4 scale-95'}
                `}>
                    <div className="flex items-start justify-between mb-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-orange-500">Call Us</span>
                        <X size={12} className="text-gray-400 cursor-pointer pointer-events-auto" onClick={(e) => { e.preventDefault(); setShowTooltip(false); }} />
                    </div>
                    <p className="text-xs font-bold text-gray-700 leading-tight">Need help with an order? Give us a call!</p>
                    {/* Arrow tail - Points down on mobile, Points right on desktop */}
                    <div className="hidden md:block absolute right-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-r border-t border-gray-100 rotate-45 z-[-1]" />
                    <div className="md:hidden absolute bottom-[-6px] right-6 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45 z-[-1]" />
                </div>

                {/* Main Phone Button */}
                <a
                    href={`tel:${phone}`}
                    className="bg-gray-900 text-white p-4 rounded-full shadow-[0_10px_30px_-10px_rgba(31,41,55,0.8)] hover:scale-105 transition-all flex items-center justify-center group h-14 w-14 md:h-16 md:w-16 z-20 overflow-hidden relative"
                >
                    <div className="absolute inset-0 border-4 border-transparent rounded-full group-hover:border-white/20 transition-all duration-300 scale-110 group-hover:scale-100" />
                    <Phone size={28} fill="currentColor" className="group-hover:rotate-12 transition-transform duration-300 relative z-10" />

                    {/* Ping effect behind */}
                    <span className="absolute inset-0 rounded-full bg-gray-600 opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
                </a>
            </div>
        </div>
    );
}

