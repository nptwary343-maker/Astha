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

import { CATEGORIES } from '@/data/static-content';

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
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
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
                        <span className="text-xl md:text-2xl font-black tracking-tighter text-blue-900 group-hover:text-orange-600 transition-colors">
                            ASTHAR<span className="text-orange-500">HAT</span>
                        </span>
                    </Link>
                </div>

                {/* Deliver To - Responsive Hidden */}
                <div className="hidden lg:flex flex-col items-start leading-tight shrink-0">
                    <span className="text-[11px] text-gray-500 font-medium ml-4">Deliver to</span>
                    <div className="flex items-center gap-1 text-blue-900 font-bold group">
                        <MapPin size={14} className="text-orange-500" />
                        <input
                            type="text"
                            placeholder="Set Address..."
                            className="text-sm bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 font-bold w-32 focus:w-48 transition-all"
                        />
                    </div>
                </div>

                {/* Search Bar - Center (Flexible) */}
                <div className="flex-1 hidden md:block">
                    <div className="flex items-center bg-gray-100 rounded-lg group focus-within:ring-2 focus-within:ring-orange-500 transition-all overflow-hidden border border-transparent focus-within:border-orange-500">
                        <div className="relative shrink-0" ref={searchCategoryRef}>
                            <button
                                onClick={() => setIsSearchCategoryOpen(!isSearchCategoryOpen)}
                                className="bg-gray-200 px-4 h-12 flex items-center gap-2 text-[10px] font-black text-gray-600 hover:bg-gray-300 transition-colors border-r border-gray-300 min-w-[70px] justify-between uppercase"
                            >
                                {selectedCategory} <ChevronDown size={14} className={`transition-transform ${isSearchCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSearchCategoryOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-xl rounded-lg border border-gray-200 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => { setSelectedCategory('All'); setIsSearchCategoryOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-50"
                                    >
                                        All Departments
                                    </button>
                                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.name); setIsSearchCategoryOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
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
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-gray-500 font-medium">Hello, {user.displayName?.split(' ')[0] || 'Member'}</span>
                                    <button onClick={logout} className="text-sm font-bold text-blue-900 hover:text-red-600 flex items-center gap-1">
                                        Account & Lists <ChevronDown size={12} />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="flex flex-col items-start group">
                                    <span className="text-[10px] text-gray-500 font-medium">Hello, sign in</span>
                                    <span className="text-sm font-bold text-blue-900 group-hover:text-orange-600 transition-colors">Account & Lists</span>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Orders/Returns - Amazon Style Placeholder */}
                    <div className="hidden xl:flex flex-col">
                        <span className="text-[10px] text-gray-500 font-medium">Returns</span>
                        <Link href="/account" className="text-sm font-bold text-blue-900 hover:text-orange-600 transition-colors">& Orders</Link>
                    </div>

                    {/* Cart with Counter */}
                    <div
                        className="relative"
                        onMouseEnter={handleCartEnter}
                        onMouseLeave={handleCartLeave}
                    >
                        <Link href="/cart" className={`flex items-end gap-1 p-2 rounded-lg hover:bg-gray-100 transition-all ${isCartAnimating ? 'scale-110' : ''}`}>
                            <div className="relative">
                                <ShoppingCart size={28} className="text-blue-900" />
                                <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            </div>
                            <span className="hidden lg:block text-sm font-bold text-blue-900 mb-0.5">Cart</span>
                        </Link>
                        {isCartOpen && <div className="absolute right-0 top-full pt-2 w-72"><CartPreview onClose={() => setIsCartOpen(false)} /></div>}
                    </div>

                    {/* Theme & Notifications - Compact */}
                    <div className="flex items-center gap-1">
                        <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-blue-900 transition-colors">
                            {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="relative" ref={notificationRef}>
                            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 text-gray-500 hover:text-blue-900 transition-colors relative">
                                <Bell size={20} />
                                <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                            </button>
                            {isNotificationsOpen && <div className="absolute right-0 top-full mt-2 w-[300px]"><NotificationDropdown onClose={() => setIsNotificationsOpen(false)} /></div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Row */}
            <div className="md:hidden px-4 pb-3">
                <SmartSearch selectedCategory={selectedCategory} />
            </div>

            {/* Sub-header Navigation (Pills) */}
            <div className="bg-blue-900 text-white h-10 flex items-center">
                <div className="max-w-[1600px] mx-auto w-full px-4 flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth">
                    <button className="flex items-center gap-1 text-sm font-bold hover:text-orange-400 shrink-0" onClick={onMenuClick}>
                        <Menu size={18} /> All
                    </button>
                    <Link href="/shop" className="text-xs font-semibold hover:text-orange-400 shrink-0">Today's Deals</Link>
                    <Link href="/shop?category=electronics" className="text-xs font-semibold hover:text-orange-400 shrink-0">Electronics</Link>
                    <Link href="/shop?category=grocery" className="text-xs font-semibold hover:text-orange-400 shrink-0">Bazar Daily</Link>
                    <Link href="/shop?category=furniture" className="text-xs font-semibold hover:text-orange-400 shrink-0">Furniture</Link>
                    <Link href="/shop?category=natural" className="text-xs font-semibold hover:text-orange-400 shrink-0">Natural Products</Link>
                    <Link href="/login" className="ml-auto text-xs font-black uppercase tracking-widest text-orange-400 hover:text-white transition-colors shrink-0">
                        Member Deals VIP
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
