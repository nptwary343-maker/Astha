'use client';

import { Menu, ShoppingCart, User as UserIcon, LogOut, MapPin, Bell, Sun, Moon, Zap, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import SmartSearch from './SmartSearch';
import NotificationDropdown from './NotificationDropdown';
import CartPreview from './CartPreview';
import confetti from 'canvas-confetti';

import { CATEGORIES } from '@/data/static-content';
import { Magnet } from './motion/MotionGraphics';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const { user, loading, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            {/* Main Header Container */}
            <div className="max-w-[1600px] mx-auto flex items-center h-16 md:h-20 px-4 gap-4 md:gap-8">

                {/* Logo & Sidebar Trigger */}
                <div className="flex items-center gap-4 shrink-0">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-blue-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <Link href="/" className="flex items-center gap-1 group">
                        <span className="text-xl md:text-2xl font-black tracking-tighter text-blue-900 dark:text-white group-hover:text-orange-600 transition-colors">
                            ASTHAR<span className="text-orange-500">HAT</span>
                        </span>
                    </Link>
                </div>

                {/* Deliver To - Responsive Hidden */}
                <div className="hidden lg:flex flex-col items-start leading-tight shrink-0">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium ml-4">Deliver to</span>
                    <div className="flex items-center gap-1 text-blue-900 dark:text-gray-300 font-bold group">
                        <MapPin size={14} className="text-orange-500" />
                        <input
                            type="text"
                            placeholder="Set Address..."
                            className="text-sm bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold w-32 focus:w-48 transition-all dark:text-white"
                        />
                    </div>
                </div>

                {/* Search Bar - Center (Flexible) */}
                <div className="flex-1 hidden md:block">
                    <div className="flex items-center bg-[#eff0f5] dark:bg-slate-900 rounded-lg group focus-within:ring-1 focus-within:ring-orange-500 transition-all overflow-hidden border border-transparent">
                        <div className="relative shrink-0" ref={searchCategoryRef}>
                            <button
                                onClick={() => setIsSearchCategoryOpen(!isSearchCategoryOpen)}
                                className="bg-transparent px-4 h-11 flex items-center gap-2 text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors border-r border-gray-300 dark:border-slate-700 min-w-[70px] justify-between uppercase"
                            >
                                {selectedCategory} <ChevronDown size={14} className={`transition-transform ${isSearchCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSearchCategoryOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-900 shadow-xl rounded-lg border border-gray-200 dark:border-slate-800 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => { setSelectedCategory('All'); setIsSearchCategoryOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 transition-colors border-b border-gray-50 dark:border-slate-800"
                                    >
                                        All Departments
                                    </button>
                                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.name); setIsSearchCategoryOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 transition-colors"
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <SmartSearch selectedCategory={selectedCategory} />
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-6 shrink-0 ml-auto">

                    {/* Account Links */}
                    {!loading && (
                        <div className="hidden sm:flex flex-col">
                            {user ? (
                                <div className="flex flex-col items-start lg:min-w-[120px]">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Hello, {user.displayName?.split(' ')[0] || 'Member'}</span>
                                    <button onClick={logout} className="text-sm font-bold text-blue-900 dark:text-orange-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                                        Account & Lists <ChevronDown size={12} />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="flex flex-col items-start group lg:min-w-[100px]">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Hello, sign in</span>
                                    <span className="text-sm font-bold text-blue-900 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-white transition-colors">Account & Lists</span>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Orders/Returns */}
                    <div className="hidden xl:flex flex-col">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Returns</span>
                        <Link href="/account" className="text-sm font-bold text-blue-900 dark:text-orange-400 hover:text-orange-600 dark:hover:text-white transition-colors">& Orders</Link>
                    </div>

                    {/* Cart with Counter */}
                    <div
                        className="relative"
                        onMouseEnter={handleCartEnter}
                        onMouseLeave={handleCartLeave}
                    >
                        <Magnet distance={20}>
                            <Link href="/cart" id="cart-icon-container" className={`flex items-end gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all ${isCartAnimating ? 'scale-110' : ''}`}>
                                <div className="relative">
                                    <ShoppingCart size={28} className="text-blue-900 dark:text-white" />
                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                                        {cartCount}
                                    </span>
                                </div>
                                <span className="hidden lg:block text-sm font-bold text-blue-900 dark:text-white mb-0.5">Cart</span>
                            </Link>
                        </Magnet>
                        {isCartOpen && <div className="absolute right-0 top-full pt-2 w-72 h-auto z-[100]"><CartPreview onClose={() => setIsCartOpen(false)} /></div>}
                    </div>

                    {/* Theme Toggle & Premium Icons */}
                    <div className="flex items-center gap-1">
                        {/* PREMIUM THEME TOGGLE: 180° Rotate + Scale */}
                        <Magnet distance={15}>
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-500 hover:text-blue-900 dark:hover:text-orange-400 transition-all duration-500 relative group active:scale-95"
                                title="Toggle Theme"
                            >
                                <div className={`transition-all duration-700 transform ${theme === 'dark' ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                                    {mounted && theme === 'dark' ? (
                                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-yellow-400 stroke-2 fill-yellow-100/20">
                                            <circle cx="12" cy="12" r="5" className="animate-pulse" />
                                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-slate-700 stroke-2 fill-slate-100">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                            </button>
                        </Magnet>

                        {/* PREMIUM TRENDING FLAME (Animated pulse) */}
                        <div className="hidden md:block">
                            <Link href="/shop?filter=trending" className="p-2 text-red-500 hover:scale-110 transition-transform relative group">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-red-500 animate-bounce">
                                    <path d="M12 21c-3.14 0-5.46-2.11-6.16-4.8-.12-.46.33-.87.77-.7l.86.33c1.01.39 2.1-.14 2.44-1.18.27-.85-.15-1.77-.96-2.15l-1.1-.53c-.45-.22-.61-.77-.35-1.19.79-1.23 2.05-2.22 3.6-2.82C10.6 6.37 10 4.67 10 3c1.01-.39 2.1.14 2.44 1.18.27.85-.15 1.77-.96 2.15l-1.1.53c.12-.46.33-.87.77-.7l.86.33C14.1 7.23 16 9.4 16 12c0 4.97-4.03 9-9 9l5-1.5L12 21z" />
                                </svg>
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            </Link>
                        </div>

                        {/* PREMIUM BEST SELLER CROWN (Gold Leaf) */}
                        <div className="hidden lg:block">
                            <Link href="/best-sellers" className="p-2 text-yellow-500 hover:scale-110 transition-transform">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                                </svg>
                            </Link>
                        </div>

                        <div className="relative" ref={notificationRef}>
                            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 text-gray-500 hover:text-blue-900 dark:hover:text-white transition-colors relative active:scale-95">
                                <Bell size={22} className="dark:text-white" />
                                <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></div>
                            </button>
                            {isNotificationsOpen && <div className="absolute right-0 top-full mt-2 w-[300px] z-[110]"><NotificationDropdown onClose={() => setIsNotificationsOpen(false)} /></div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Row */}
            <div className="md:hidden px-4 pb-3">
                <SmartSearch selectedCategory={selectedCategory} />
            </div>

            {/* Sub-header Navigation (Pills) */}
            <div className="bg-[#f5f5f5] dark:bg-slate-900 h-9 flex items-center border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-[1600px] mx-auto w-full px-4 flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth">
                    <button className="flex items-center gap-1 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-orange-500 shrink-0 uppercase tracking-tight" onClick={onMenuClick}>
                        <Menu size={16} /> Categories
                    </button>
                    <Link href="/shop" className="text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-orange-500 shrink-0 uppercase tracking-tight">Today's Deals</Link>
                    <Link href="/shop?category=electronics" className="text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-orange-500 shrink-0 uppercase tracking-tight">Electronics</Link>
                    <Link href="/shop?category=grocery" className="text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-orange-500 shrink-0 uppercase tracking-tight">Bazar Daily</Link>
                    <Link href="/shop?category=furniture" className="text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-orange-500 shrink-0 uppercase tracking-tight">Furniture</Link>
                    <Link href="/shop?category=natural" className="text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-orange-500 shrink-0 uppercase tracking-tight">Natural Products</Link>

                    <div className="ml-auto hidden md:flex items-center gap-2">
                        <span className="text-[10px] font-bold text-orange-500 animate-pulse">FLASH SALE ENDS IN: 04:12:05</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
