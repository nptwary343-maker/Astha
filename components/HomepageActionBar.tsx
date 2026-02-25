'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Ticket, Users, TrendingUp } from 'lucide-react';

const ACTION_BUTTONS = [
    {
        label: 'Best Seller',
        icon: Award,
        href: '/shop?sort=best-seller',
        color: 'bg-orange-500',
        textColor: 'text-orange-500'
    },
    {
        label: 'Coupons',
        icon: Ticket,
        href: '/coupons',
        color: 'bg-blue-500',
        textColor: 'text-blue-500'
    },
    {
        label: 'Referral',
        icon: Users,
        href: '/account/referral',
        color: 'bg-purple-500',
        textColor: 'text-purple-500'
    },
    {
        label: 'Weekly Trending',
        icon: TrendingUp,
        href: '/shop?sort=trending',
        color: 'bg-green-500',
        textColor: 'text-green-500'
    }
];

export default function HomepageActionBar() {
    return (
        <div className="px-4 md:px-8 max-w-7xl mx-auto py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* 🎟️ Premium Coupon Bar (Enjoy People Design) */}
                <Link
                    href="/coupons"
                    className="md:col-span-2 group relative flex flex-col items-center justify-center p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-95"
                >
                    {/* Animated background element */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full animate-gradient-x bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Ticket className="text-white" size={40} strokeWidth={2.5} />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2 group-hover:translate-x-1 transition-transform">Coupons & Rewards</h3>
                            <p className="text-white/80 text-xs font-bold tracking-widest uppercase">Click to view & claim exclusive member rewards</p>
                        </div>
                    </div>
                </Link>

                {/* Best Seller */}
                <Link
                    href="/shop?sort=best-seller"
                    className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2"
                >
                    <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Award className="text-orange-500" size={32} />
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Best Seller</span>
                </Link>

                {/* Trending */}
                <Link
                    href="/shop?sort=trending"
                    className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl hover:border-green-400 dark:hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2"
                >
                    <div className="w-16 h-16 rounded-3xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                        <TrendingUp className="text-green-500" size={32} />
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Trending</span>
                </Link>
            </div>
        </div>
    );
}
