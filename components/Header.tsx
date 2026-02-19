'use client';

import { Menu, Search, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Package as PackageIcon, Settings as SettingsIcon, Moon, Sun, Bell, ShieldCheck, Volume2, VolumeX, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSound } from '@/context/SoundContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';


import SmartSearch from './SmartSearch';
import NotificationDropdown from './NotificationDropdown';
import { useEffect, useRef } from 'react';
import MarqueeBar from './MarqueeBar';
import FlashSaleBanner from './FlashSaleBanner';
import CartPreview from './CartPreview';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const { user, loading, isAdmin, logout } = useAuth();
    const { isSoundEnabled, toggleSound, playNotification } = useSound();
    const { theme, toggleTheme } = useTheme();
    const { cartCount } = useCart();

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Animate cart when items are added
    useEffect(() => {
        if (cartCount > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsCartAnimating(true);
            const timer = setTimeout(() => setIsCartAnimating(false), 800);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    // Handle hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCartEnter = () => {
        if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
        setIsCartOpen(true);
    };

    const handleCartLeave = () => {
        cartTimeoutRef.current = setTimeout(() => {
            setIsCartOpen(false);
        }, 300);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <MarqueeBar />
            <FlashSaleBanner />
            {/* Main Header Row with spacing to avoid overlap */}
            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm transition-all h-20 md:h-24 flex items-center mt-0">
                <div className="w-full h-full flex items-center justify-between px-4 md:px-8 max-w-[1920px] mx-auto gap-4 lg:gap-8">
                    {/* COLUMN 1: Menu + Logo + Nav (Left) */}
                    <div className="flex items-center gap-4 shrink-0">
                        <button
                            className="p-2 text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all focus:outline-none"
                            onClick={onMenuClick}
                        >
                            <Menu size={24} />
                        </button>

                        <Link href="/" className="group transition-transform shrink-0">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-transparent bg-clip-text bg-300% animate-gradient-x hover:brightness-110 transition-all block">
                                ASTHARHAT
                            </span>
                        </Link>

                        {/* Nav Menus (Pill Buttons) */}
                        <nav className="hidden xl:flex items-center gap-2 ml-4">
                            <Link href="/" className="px-5 py-2 text-sm font-bold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all">
                                Home
                            </Link>
                            <Link href="/shop" className="px-5 py-2 text-sm font-bold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all">
                                Shop
                            </Link>
                        </nav>
                    </div>

                    {/* COLUMN 2: Search (Center - Massive) */}
                    <div className="flex-1 hidden md:block px-4 max-w-2xl">
                        <SmartSearch />
                    </div>

                    {/* COLUMN 3: Actions (Right) */}
                    <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                        {/* Authentication Logic (The "Gatekeeper") */}
                        {!loading && (
                            <>
                                {!user ? (
                                    <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 text-xs font-black text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300"
                                        >
                                            Login
                                        </Link>
                                        <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-1"></div>
                                        <Link
                                            href="/signup"
                                            className="px-4 py-2 text-xs font-black text-orange-600 dark:text-orange-500 hover:scale-105 transition-all duration-300 flex items-center gap-1.5"
                                        >
                                            Sign Up <Zap size={14} className="animate-pulse" />
                                        </Link>
                                    </div>
                                ) : (
                                    <button
                                        onClick={logout}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 group"
                                    >
                                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                        Logout
                                    </button>
                                )}
                            </>
                        )}

                        {/* Cart & Notify Area */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                    title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {mounted && theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                                </button>

                                {/* Notification Toggle */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        <Bell size={22} />
                                        <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></div>
                                    </button>
                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-[300px] z-[70]">
                                            <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />
                                        </div>
                                    )}
                                </div>

                                {/* Cart with Hover Preview */}
                                <div
                                    className="relative"
                                    onMouseEnter={handleCartEnter}
                                    onMouseLeave={handleCartLeave}
                                >
                                    <Link
                                        href="/cart"
                                        className={`
                                        flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all duration-300
                                        ${cartCount > 0 ? 'bg-black dark:bg-zinc-800 text-white shadow-lg' : 'text-gray-500 hover:text-black dark:hover:text-white bg-gray-50 dark:bg-white/5'}
                                        ${isCartAnimating ? 'animate-rubber-band' : ''}
                                    `}
                                    >
                                        <div className="relative">
                                            <ShoppingCart size={22} className={cartCount > 0 ? "fill-current" : ""} />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[10px] font-bold h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-black">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm hidden lg:block">৳ {cartCount > 0 ? 'Cart' : '0'}</span>
                                    </Link>

                                    {isCartOpen && (
                                        <div className="absolute right-0 top-full pt-2 z-[70]">
                                            <CartPreview onClose={() => setIsCartOpen(false)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔥 NEW: Prominent Mobile Search Bar (Always Visible on Mobile) */}
                <div className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-3">
                    <SmartSearch />
                </div>
            </div>
        </header>
    );
};

export default Header;
