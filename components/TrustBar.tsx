'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, Sparkles } from 'lucide-react';

const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        title: '100% Authentic',
        desc: 'Verified Quality Products',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
    },
    {
        icon: Truck,
        title: 'Delivery Discount',
        desc: 'Save on shipping today',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    {
        icon: Award,
        title: 'Digital Cert',
        desc: 'Verified product badges',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
    },
    {
        icon: Sparkles,
        title: 'Expert Verified',
        desc: 'Quality check passed',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
    }
];

export default function TrustBar() {
    return (
        <section className="px-4 md:px-8 max-w-7xl mx-auto py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {TRUST_ITEMS.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 p-4 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-500 group"
                    >
                        <div className={`w-12 h-12 shrink-0 rounded-2xl ${item.bgColor} dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                            <item.icon className={item.color} size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                            <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
