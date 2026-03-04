'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, Sparkles } from 'lucide-react';

const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        title: '১০০% অরিজিনাল পণ্য',
        small: 'Authenticity Guaranteed',
        desc: 'সরাসরি ব্র্যান্ড থেকে সংগৃহীত',
        accent: 'bg-emerald-50 text-emerald-600',
        borderColor: 'group-hover:border-emerald-200'
    },
    {
        icon: Truck,
        title: 'দ্রুত হোম ডেলিভারি',
        small: 'Express Logistics',
        desc: 'সারা বাংলাদেশে নিরাপদ শিপিং',
        accent: 'bg-blue-50 text-blue-600',
        borderColor: 'group-hover:border-blue-200'
    },
    {
        icon: Award,
        title: 'কোয়ালিটি গ্যারান্টি',
        small: 'Bazaar Certified',
        desc: 'যাচাইকৃত মানসম্পন্ন প্রোডাক্ট',
        accent: 'bg-amber-50 text-amber-600',
        borderColor: 'group-hover:border-amber-200'
    },
    {
        icon: Sparkles,
        title: 'প্রিমিয়াম কালেকশন',
        small: 'Elite Selection',
        desc: 'সেরা মানের সেরা পণ্য',
        accent: 'bg-indigo-50 text-indigo-600',
        borderColor: 'group-hover:border-indigo-200'
    }
];

export default function TrustBar() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {TRUST_ITEMS.map((item, idx) => (
                <div
                    key={idx}
                    className={`flex items-center gap-5 p-6 bg-white shadow-sm hover:shadow-2xl border border-slate-100 rounded-[2rem] transition-all duration-500 group relative overflow-hidden active:scale-[0.98] ${item.borderColor}`}
                >
                    {/* Abstract background highlight */}
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-white/10 transition-colors duration-700" />

                    <div className={`${item.accent} p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 shadow-sm`}>
                        <item.icon size={26} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col relative z-10">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            {item.small}
                        </span>
                        <h4 className="text-sm font-black text-slate-800 leading-tight mb-1">
                            {item.title}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 leading-tight">
                            {item.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
