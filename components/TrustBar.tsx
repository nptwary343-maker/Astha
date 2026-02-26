'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, Sparkles } from 'lucide-react';

const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        title: 'Authenticity Guaranteed',
        desc: '100% Genuine Products',
        accent: 'bg-brand-primary/10 text-brand-primary',
    },
    {
        icon: Truck,
        title: 'Express Logistics',
        desc: 'Rapid & Secure Delivery',
        accent: 'bg-indigo-50 text-indigo-600',
    },
    {
        icon: Award,
        title: 'Bazaar Certified',
        desc: 'Verified Quality Control',
        accent: 'bg-brand-accent/10 text-brand-accent',
    },
    {
        icon: Sparkles,
        title: 'Curated Premium',
        desc: 'Elite Product Selection',
        accent: 'bg-slate-100 text-slate-600',
    }
];

export default function TrustBar() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-5 p-6 bg-white shadow-sm hover:shadow-xl border border-border-light rounded-[2rem] transition-all duration-500 group relative overflow-hidden active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-ui-bg rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-primary/5 transition-colors" />

                    <div className={`${item.accent} p-4 rounded-[1.25rem] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10`}>
                        <item.icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col relative z-10">
                        <h4 className="text-[11px] font-black text-text-main uppercase tracking-[.15em] mb-1 leading-none">
                            {item.title}
                        </h4>
                        <p className="text-[10px] font-bold text-text-muted leading-tight uppercase opacity-60">
                            {item.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
