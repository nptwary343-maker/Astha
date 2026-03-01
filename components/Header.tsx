'use client';

import { Menu, ShoppingCart, User as UserIcon, LogOut, MapPin, Bell, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import SmartSearch from './SmartSearch';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';
import CartPreview from './CartPreview';
import confetti from 'canvas-confetti';

import { CATEGORIES } from '@/data/static-content';
import { Magnet } from './motion/MotionGraphics';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const { user, loading, logout } = useAuth();
    const { notifications, unreadCount } = useNotifications();
    const { cartCount } = useCart();

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    const [isSearchCategoryOpen, setIsSearchCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const notificationRef = useRef<HTMLDivElement>(null);
    const searchCategoryRef = useRef<HTMLDivElement>(null);
    const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (cartCount > 0) {
            setIsCartAnimating(true);
            const timer = setTimeout(() => setIsCartAnimating(false), 800);

            // PREMIUM MOTION: Confetti burst from cart position
            const rect = document.getElementById('cart-icon-container')?.getBoundingClientRect();
            if (rect) {
                confetti({
                    particleCount: 40,
                    spread: 70,
                    origin: {
                        x: (rect.left + rect.width / 2) / window.innerWidth,
                        y: (rect.top + rect.height / 2) / window.innerHeight
                    },
                    colors: ['#f57224', '#2ebaee', '#ffffff'],
                    ticks: 200,
                    gravity: 1.2,
                    scalar: 0.7,
                    zIndex: 1000,
                });
            }

            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (searchCategoryRef.current && !searchCategoryRef.current.contains(event.target as Node)) {
                setIsSearchCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCartEnter = () => {
        if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
        setIsCartOpen(true);
    };

    const handleCartLeave = () => {
        cartTimeoutRef.current = setTimeout(() => setIsCartOpen(false), 300);
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-border-light shadow-sm transition-all duration-300">
            {/* Top Minimal Bar (Optional/Subtle) */}
            <div className="bg-ui-bg border-b border-border-light hidden sm:block">
                <div className="max-w-[1600px] mx-auto flex justify-end gap-6 px-4 py-1.5 font-medium text-[10px] text-text-muted uppercase tracking-wider">
                    <Link href="/tracking" className="hover:text-brand-primary transition-colors">Track Order</Link>

                    <Link href="/help" className="hover:text-brand-primary transition-colors">Help Center</Link>
                    <Link href="/contact" className="hover:text-brand-primary transition-colors">Contact Us</Link>
                </div>
            </div>

            {/* Main Navigation Row */}
            <div className="max-w-[1600px] mx-auto flex items-center h-16 md:h-20 px-4 gap-6 md:gap-10">

                {/* Logo Section */}
                <div className="flex items-center gap-4 shrink-0">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-text-main hover:bg-slate-100 rounded-xl transition-colors md:hidden"
                    >
                        <Menu size={22} />
                    </button>
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl md:text-2xl font-black tracking-tight text-text-main group-hover:text-brand-primary transition-colors uppercase">
                            ASTHAR<span className="text-brand-primary">HAT</span>
                        </span>
                    </Link>
                </div>

                {/* Delivery Context (Simplified) */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-ui-bg rounded-2xl border border-border-light hover:border-brand-primary/30 transition-all cursor-pointer group">
                    <MapPin size={18} className="text-brand-primary" />
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-text-muted leading-tight tracking-widest">Deliver to</span>
                        <input
                            type="text"
                            placeholder="Set Address..."
                            className="text-xs bg-transparent border-none outline-none focus:ring-0 p-0 font-bold text-text-main placeholder:text-text-muted/60 w-24 focus:w-32 transition-all"
                        />
                    </div>
                </div>

                {/* Advanced Search Architecture */}
                <div className="flex-1 hidden md:block">
                    <div className="flex items-center bg-ui-bg rounded-2xl group focus-within:ring-2 focus-within:ring-brand-primary/10 focus-within:bg-white transition-all border border-border-light hover:border-slate-300">
                        <div className="relative shrink-0 border-r border-border-light" ref={searchCategoryRef}>
                            <button
                                onClick={() => setIsSearchCategoryOpen(!isSearchCategoryOpen)}
                                className="px-5 h-12 flex items-center gap-3 text-[10px] font-black text-text-main hover:bg-slate-50 transition-colors justify-between uppercase tracking-widest min-w-[110px]"
                            >
                                {selectedCategory} <ChevronDown size={14} className={`transition-transform text-slate-400 ${isSearchCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSearchCategoryOpen && (
                                <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-2xl rounded-2xl border border-border-light py-3 z-[60] animate-in fade-in slide-in-from-top-4 duration-300 ring-4 ring-black/5">
                                    <button
                                        onClick={() => { setSelectedCategory('All'); setIsSearchCategoryOpen(false); }}
                                        className="w-full text-left px-5 py-2.5 text-xs font-bold text-text-main hover:bg-brand-primary hover:text-white transition-all flex items-center justify-between group"
                                    >
                                        All Categories
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                    <div className="h-[1px] bg-border-light my-2" />
                                    <div className="max-h-[350px] overflow-y-auto no-scrollbar px-1">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.name); setIsSearchCategoryOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-text-muted hover:bg-slate-50 hover:text-brand-primary rounded-xl transition-all"
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 px-4">
                            <SmartSearch selectedCategory={selectedCategory} />
                        </div>
                    </div>
                </div>

                {/* Right Action Architecture */}
                <div className="flex items-center gap-3 md:gap-4 ml-auto">

                    {/* Account Section - Refined */}
                    {!loading && (
                        <div className="hidden sm:block">
                            {user ? (
                                <div className="flex items-center gap-3 pl-4 border-l border-border-light">
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">My Account</span>
                                        <button onClick={logout} className="text-[13px] font-black text-text-main hover:text-brand-primary transition-colors flex items-center gap-1">
                                            {user.displayName?.split(' ')[0] || 'User'} <ChevronDown size={14} />
                                        </button>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-primary font-black text-sm border-2 border-white shadow-sm">
                                        {user.displayName?.charAt(0) || <UserIcon size={18} />}
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login" className="flex items-center gap-3 px-5 py-2.5 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all">
                                    <UserIcon size={18} />
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-3 text-text-muted hover:text-brand-primary hover:bg-slate-50 rounded-2xl transition-all relative">
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 min-w-[16px] h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-bounce-slow">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {isNotificationsOpen && <div className="absolute right-0 top-full mt-4 w-80 z-[110]"><NotificationDropdown onClose={() => setIsNotificationsOpen(false)} /></div>}
                    </div>

                    {/* Premium Cart Interaction */}
                    <div
                        className="relative"
                        onMouseEnter={handleCartEnter}
                        onMouseLeave={handleCartLeave}
                    >
                        <Magnet distance={15}>
                            <Link href="/cart" id="cart-icon-container" className={`bg-ui-bg p-3 rounded-2xl border border-border-light flex items-center gap-3 hover:border-brand-primary/30 transition-all ${isCartAnimating ? 'animate-rubber-band bg-brand-primary/5' : ''}`}>
                                <div className="relative">
                                    <ShoppingCart size={22} className="text-text-main" />
                                    <span className="absolute -top-3 -right-3 bg-brand-accent text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 py-0.5 rounded-full flex items-center justify-center shadow-lg shadow-brand-accent/30 border-2 border-white">
                                        {cartCount}
                                    </span>
                                </div>
                                <span className="hidden lg:block text-xs font-black text-text-main tracking-tight">৳0.00</span>
                            </Link>
                        </Magnet>
                        {isCartOpen && <div className="absolute right-0 top-full pt-4 w-80 z-[100] drop-shadow-2xl"><CartPreview onClose={() => setIsCartOpen(false)} /></div>}
                    </div>
                </div>
            </div>

            {/* Mobile Search - Clean */}
            <div className="md:hidden px-4 pb-4">
                <div className="bg-ui-bg rounded-xl border border-border-light px-4 py-1">
                    <SmartSearch selectedCategory={selectedCategory} />
                </div>
            </div>

            {/* Premium Category Ribbon */}
            <div className="bg-white border-t border-border-light h-12 flex items-center overflow-x-auto no-scrollbar px-4 scroll-smooth">
                <div className="max-w-[1600px] mx-auto w-full flex items-center gap-10">
                    <button className="flex items-center gap-2 text-[11px] font-black text-text-main hover:text-brand-primary transition-all uppercase tracking-widest shrink-0" onClick={onMenuClick}>
                        <Menu size={16} /> All Browse
                    </button>
                    <div className="w-[1px] h-4 bg-border-light shrink-0" />

                    {[
                        { label: "Today's Deals", href: "/shop?sort=discount" },
                        { label: "Electronics", href: "/shop?category=electronics" },
                        { label: "Bazar Daily", href: "/shop?category=grocery" },
                        { label: "Furniture", href: "/shop?category=furniture" },
                        { label: "Health & Beauty", href: "/shop?category=beauty" },
                        { label: "Smart Gadgets", href: "/shop?category=gadgets" }
                    ].map(link => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-[11px] font-bold text-text-muted hover:text-brand-primary transition-all uppercase tracking-tight shrink-0 whitespace-nowrap"
                        >
                            {link.label}
                        </Link>
                    ))}


                </div>
            </div>
        </header>
    );
};

export default Header;
