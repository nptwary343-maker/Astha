'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Ticket, Users, TrendingUp, ChevronRight } from 'lucide-react';

const ACTIONS = [
    {
        label: 'Exclusive Coupons',
        icon: Ticket,
        href: '/coupons',
        desc: 'Claim Member Rewards',
        accent: 'text-brand-primary bg-brand-primary/5'
    },
    {
        label: 'Top Trending',
        icon: TrendingUp,
        href: '/shop?sort=trending',
        desc: 'Most Popular Choices',
        accent: 'text-slate-600 bg-slate-100'
    },
    {
        label: 'Refer & Earn',
        icon: Users,
        href: '/account/referral',
        desc: 'Invite your Network',
        accent: 'text-brand-accent bg-brand-accent/10'
    },
    {
        label: 'Certified Quality',
        icon: Award,
        href: '/shop?sort=best-seller',
        desc: 'Bazaar Choice 2024',
        accent: 'text-indigo-600 bg-indigo-50'
    }
];

export default function HomepageActionBar() {
    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ACTIONS.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="group flex items-center gap-6 p-6 bg-white border border-border-light rounded-[2.5rem] hover:ring-4 hover:ring-brand-primary/5 hover:border-brand-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden active:scale-95"
                    >
                        {/* Interactive Background Element */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-ui-bg rounded-full opacity-50 group-hover:scale-150 group-hover:bg-brand-primary/5 transition-all duration-700" />

                        <div className={`${item.accent} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-500 relative z-10 shadow-sm`}>
                            <item.icon size={24} strokeWidth={2.5} />
                        </div>

                        <div className="flex flex-col relative z-10">
                            <h3 className="text-xs font-black text-text-main uppercase tracking-widest leading-none mb-1 group-hover:text-brand-primary transition-colors italic">
                                {item.label}
                            </h3>
                            <p className="text-[10px] font-bold text-text-muted opacity-60 uppercase">
                                {item.desc}
                            </p>
                        </div>

                        <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-primary">
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
