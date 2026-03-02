'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Bell, Menu, Zap, LayoutGrid, Award, TrendingUp } from 'lucide-react';
import { m } from 'framer-motion';

const CATEGORY_ICONS = [
    { name: 'Grocery', icon: '🥕', color: 'bg-orange-100' },
    { name: 'Electronics', icon: '⚡', color: 'bg-blue-100' },
    { name: 'Fashion', icon: '👕', color: 'bg-pink-100' },
    { name: 'Health', icon: '💊', color: 'bg-emerald-100' },
    { name: 'Home', icon: '🏠', color: 'bg-amber-100' },
];

export default function MobileMinimalistHeader() {
    return (
        <div className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-[60] border-b border-slate-100 transition-all">
            <div className="px-5 py-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] leading-none mb-1 italic">Welcome to</span>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Asthar <span className="text-brand-primary">Hat</span></h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 relative overflow-hidden active:scale-95 transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </div>

                {/* Minimalist Search Bar */}
                <Link href="/shop" className="block w-full">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        </div>
                        <div className="w-full bg-slate-100/80 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-400 flex items-center gap-2">
                            Search premium artifacts...
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
                            <Search size={14} className="text-brand-primary" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export function MobileMinimalistCategories({ categories }: { categories: any[] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="md:hidden py-6 overflow-hidden">
            <div className="px-5 flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Categories</h3>
                <Link href="/shop" className="text-[10px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-primary/20 pb-0.5">View All</Link>
            </div>

            <div className="flex overflow-x-auto gap-5 px-5 no-scrollbar pb-2">
                {categories.map((cat, idx) => (
                    <Link key={cat.id || idx} href={`/shop?category=${cat.id}`} className="flex flex-col items-center gap-3 shrink-0 active:scale-95 transition-transform">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center p-3 relative overflow-hidden group">
                            {/* Gradient glow on hover/active */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain relative z-10 drop-shadow-sm" />
                            ) : (
                                <span className="text-xl relative z-10">{cat.name.charAt(0)}</span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter w-16 text-center truncate">{cat.name}</span>
                    </Link>
                ))}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
