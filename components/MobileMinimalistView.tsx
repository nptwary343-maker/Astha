'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, MapPin, Zap, ChevronRight, Bell } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileMinimalistHeader() {
    const { cartCount } = useCart();
    const { selectedLocationId } = useLocation();
    const { user } = useAuth();

    return (
        <div className="md:hidden flex flex-col bg-slate-900 text-white sticky top-0 z-[100] shadow-xl">
            {/* Bar 1: Logo, Location, Account, Cart */}
            <div className="flex items-center justify-between px-4 py-3 gap-3 border-b border-white/5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button className="p-1.5 hover:bg-white/10 rounded-xl transition-colors shrink-0">
                        <Menu size={20} strokeWidth={2.5} className="text-brand-primary" />
                    </button>
                    <Link href="/" className="shrink-0">
                        <h1 className="text-lg font-black tracking-tighter italic uppercase leading-none">
                            Asthar <span className="text-brand-primary">Hat</span>
                        </h1>
                    </Link>
                    <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1 overflow-hidden">
                        <MapPin size={12} className="text-brand-accent shrink-0" />
                        <span className="text-[10px] font-bold truncate opacity-80 uppercase tracking-tighter">
                            {selectedLocationId === 'all' ? 'Everywhere' : selectedLocationId}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/account" className="hover:text-brand-primary transition-colors">
                        <User size={20} />
                    </Link>
                    <Link href="/cart" className="relative hover:text-brand-primary transition-colors">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-brand-primary text-white text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-slate-900">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Bar 2: Search + Quick Location for mobile */}
            <div className="px-3 py-2 flex items-center gap-2 bg-slate-800/50 backdrop-blur-md">
                <Link href="/shop" className="flex-1">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search size={16} />
                        </div>
                        <input
                            readOnly
                            placeholder="Search Asthar Hat..."
                            className="w-full bg-white/10 border border-white/5 text-white rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:outline-none placeholder:text-slate-500"
                        />
                    </div>
                </Link>
                <div className="flex sm:hidden items-center gap-1 bg-white/5 px-2 py-2 rounded-xl border border-white/5 max-w-[80px]">
                    <MapPin size={14} className="text-brand-accent shrink-0" />
                    <span className="text-[9px] font-black truncate opacity-90 uppercase">{selectedLocationId === 'all' ? 'Global' : selectedLocationId}</span>
                </div>
            </div>
        </div>
    );
}

export function MobileMinimalistCategories({ categories }: { categories: any[] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="md:hidden bg-white py-4 overflow-hidden shadow-sm">
            <div className="flex overflow-x-auto gap-6 px-4 no-scrollbar">
                {categories.map((cat, idx) => (
                    <Link key={cat.id || idx} href={`/shop?category=${cat.id}`} className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform group">
                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 relative group-hover:border-brand-primary transition-colors overflow-hidden">
                            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {cat.image ? (
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-110"
                                />
                            ) : (
                                <span className="text-xl relative z-10 font-bold text-slate-400">{cat.name.charAt(0)}</span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 tracking-tight text-center w-16 truncate leading-tight group-hover:text-brand-primary">
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
