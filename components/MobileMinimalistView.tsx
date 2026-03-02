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
        <div className="md:hidden flex flex-col bg-[#232f3e] text-white sticky top-0 z-[100] shadow-md">
            {/* Top Bar: Logo, Account, Cart */}
            <div className="flex items-center justify-between px-4 py-2 gap-4">
                <div className="flex items-center gap-3">
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <Menu size={24} strokeWidth={2.5} />
                    </button>
                    <Link href="/" className="flex flex-col">
                        <h1 className="text-xl font-black tracking-tighter italic uppercase leading-none">
                            Asthar <span className="text-[#febd69]">Hat</span>
                        </h1>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/account" className="flex items-center gap-1 hover:text-[#febd69] transition-colors relative">
                        <span className="text-[10px] font-bold uppercase tracking-tight hidden sm:inline">Sign In</span>
                        <User size={22} />
                    </Link>
                    <Link href="/cart" className="flex items-center relative hover:text-[#febd69] transition-colors">
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-[#febd69] text-[#232f3e] text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-[#232f3e]">
                                {cartCount}
                            </span>
                        )}
                        <span className="ml-1 text-[10px] font-black uppercase mt-1">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Search Bar Row */}
            <div className="px-3 pb-3">
                <Link href="/shop" className="block w-full">
                    <div className="relative group">
                        <input
                            readOnly
                            placeholder="Search Asthar Hat..."
                            className="w-full bg-white text-slate-900 rounded-lg py-3 pl-4 pr-12 text-sm font-medium focus:outline-none"
                        />
                        <div className="absolute right-0 top-0 h-full w-12 bg-[#febd69] rounded-r-lg flex items-center justify-center">
                            <Search size={22} className="text-slate-800" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Location Bar Row */}
            <div className="bg-[#37475a] px-4 py-2.5 flex items-center gap-2 text-[11px] font-medium border-t border-white/5">
                <MapPin size={14} className="text-white" />
                <span className="flex-1 truncate opacity-90">
                    Deliver to <span className="font-bold text-white uppercase tracking-wider">{selectedLocationId === 'all' ? 'Everywhere' : selectedLocationId}</span>
                </span>
                <ChevronRight size={12} className="opacity-50" />
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
