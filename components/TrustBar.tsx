'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, Sparkles } from 'lucide-react';

const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        title: '100% Authentic',
        desc: 'Verified Quality Products',
        color: 'text-emerald-600',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        desc: 'Quick & Reliable Shipping',
        color: 'text-blue-600',
    },
    {
        icon: Award,
        title: 'Expert Verified',
        desc: '100% Satisfaction Guarantee',
        color: 'text-orange-600',
    },
    {
        icon: Sparkles,
        title: 'Premium Quality',
        desc: 'Top-tier curated items',
        color: 'text-purple-600',
    }
];

export default function TrustBar() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-4 p-5 bg-white shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 group"
                >
                    <div className={`${item.color} group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon size={32} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight leading-none mb-1">
                            {item.title}
                        </h4>
                        <p className="text-[11px] font-medium text-gray-500 leading-none">
                            {item.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
