'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, MapPin, Zap, ChevronRight, Bell } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileMinimalistHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    const { cartCount } = useCart();
    const { selectedLocationId } = useLocation();
    const { user } = useAuth();

    return (
        <div className="md:hidden flex flex-col bg-slate-950 text-white sticky top-0 z-[100] shadow-2xl border-b border-white/5">
            {/* Unified Bar: Menu, Logo, Search Trigger, Cart */}
            <div className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="p-1 text-brand-primary">
                        <Menu size={24} strokeWidth={2.5} />
                    </button>
                    <Link href="/" className="shrink-0">
                        <h1 className="text-lg font-black tracking-tighter italic uppercase leading-none">
                            Asthar <span className="text-brand-primary">Hat</span>
                        </h1>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/shop" className="p-1 text-slate-400 hover:text-white transition-colors">
                        <Search size={20} />
                    </Link>
                    <Link href="/account" className="p-1 text-slate-400 hover:text-white transition-colors">
                        <User size={20} />
                    </Link>
                    <Link href="/cart" className="relative p-1 text-brand-primary">
                        <ShoppingCart size={22} strokeWidth={2.5} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-blue-900 text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-slate-950">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Quick Location / Search Bar Semi-collapsed */}
            <div className="px-4 pb-3 flex items-center gap-2">
                <Link href="/shop" className="flex-1">
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
                        <Search size={14} className="text-slate-500" />
                        <span className="text-xs text-slate-500 font-medium">Search products...</span>
                    </div>
                </Link>
                <div className="flex items-center gap-1.5 bg-brand-primary/10 px-3 py-2 rounded-xl border border-brand-primary/20 max-w-[100px]">
                    <MapPin size={12} className="text-brand-primary shrink-0" />
                    <span className="text-[9px] font-black truncate text-brand-primary uppercase">
                        {selectedLocationId === 'all' ? 'Global' : selectedLocationId}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function MobileMinimalistCategories({ categories }: { categories: any[] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="md:hidden bg-white py-5 overflow-hidden border-b border-slate-100">
            <div className="flex overflow-x-auto gap-6 px-5 no-scrollbar">
                {categories.map((cat, idx) => (
                    <Link
                        key={cat.id || idx}
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        className="flex flex-col items-center gap-2 shrink-0 active:scale-90 transition-transform group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 relative group-hover:border-brand-primary transition-all shadow-sm">
                            {cat.image ? (
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-contain transition-transform group-hover:scale-110"
                                />
                            ) : (
                                <span className="text-lg font-black text-slate-300">{cat.name.charAt(0)}</span>
                            )}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter text-center w-14 truncate leading-tight group-hover:text-brand-primary">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
