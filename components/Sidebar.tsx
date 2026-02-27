'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU_ITEMS } from './navigation-config';
import { X, LogOut, User, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

// --- Recursive Sidebar Item Component ---
const SidebarItem = ({ item, pathname, closeSidebar }: { item: any, pathname: string, closeSidebar: () => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = pathname === item.href || (item.href !== '/shop' && pathname.startsWith(item.href));

    // Auto-expand if child is active
    /* useEffect(() => { if (isActive) setIsExpanded(true); }, [isActive]); */

    const handleParentClick = (e: React.MouseEvent) => {
        if (hasSubItems) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        } else {
            closeSidebar();
        }
    };

    return (
        <div className="flex flex-col">
            <Link
                href={item.href}
                onClick={handleParentClick}
                className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 font-bold tracking-wide group overflow-hidden cursor-pointer ${isActive || isExpanded
                    ? 'bg-black text-white shadow-lg shadow-black/20 translate-x-1'
                    : 'text-gray-600 hover:text-white hover:bg-black hover:pl-6'
                    }`}
            >
                <div className="flex items-center gap-3 relative z-10">
                    <item.icon size={22} className={`transition-colors duration-300 ${isActive || isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    <span>{item.name}</span>
                </div>
                {hasSubItems && (
                    <div className="relative z-10">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                )}
            </Link>

            {/* Sub Items - Accordion */}
            {hasSubItems && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out pl-10 space-y-1 ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    {item.subItems.map((sub: any) => (
                        <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={closeSidebar}
                            className="block py-2 text-sm text-gray-500 hover:text-black font-medium transition-colors"
                        >
                            {sub.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const pathname = usePathname();
    const { user, loading, logout, isAdmin } = useAuth();

    return (
        <>
            {/* Mobile Overlay - Now Global Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 overflow-y-auto z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Auth Section - Stabilized with Loading check to prevent 'disappearing' flicker */}
                    <div className="mb-6 border-b border-gray-100 pb-6">
                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                                <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                            </div>
                        ) : user ? (
                            <div className="space-y-3">
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all group shadow-lg shadow-blue-500/20"
                                    >
                                        <ShieldCheck size={20} className="text-blue-100" />
                                        <span>Admin Dashboard</span>
                                    </Link>
                                )}
                                <Link
                                    href="/account"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-800 font-bold rounded-xl hover:bg-black hover:text-white transition-all group"
                                >
                                    <User size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                                    <span>My Account</span>
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-red-500 font-medium hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="relative overflow-hidden group block px-4 py-3 text-gray-800 font-bold hover:text-white rounded-xl transition-all border border-gray-100 hover:border-black shadow-sm"
                                >
                                    <span className="relative z-10 flex items-center justify-between">
                                        Login
                                        <span className="text-gray-400 group-hover:text-white transition-colors">→</span>
                                    </span>
                                    {/* Strict Rule: Black BG / White Text Hover Effect */}
                                    <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out origin-left" />
                                </Link>

                                <Link
                                    href="/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="relative block px-4 py-3 bg-black text-white font-bold rounded-xl shadow-lg shadow-black/10 overflow-hidden group hover:scale-[1.02] transition-transform active:scale-[0.98] text-center"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Sign Up Free
                                    </span>
                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Categories - Now first */}
                    <div className="mb-8 border-b border-gray-100 pb-6">
                        <h2 className="text-lg font-bold mb-4 px-2 text-gray-800">Categories</h2>
                        <nav className="space-y-1.5">
                            {MENU_ITEMS.map((item) => <SidebarItem key={item.name} item={item} pathname={pathname ?? '/'} closeSidebar={() => setIsOpen(false)} />)}
                        </nav>
                    </div>

                    {/* Main Nav Items - Now second */}
                    <h2 className="text-lg font-bold mb-4 px-2 text-gray-800">Explore</h2>
                    <div className="space-y-1.5">
                        {['Home', 'About', 'Billing History', 'Tracking'].filter(name => {
                            if (!user && (name === 'Billing History' || name === 'Tracking')) return false;
                            return true;
                        }).map((name) => (
                            <Link
                                key={name}
                                href={name === 'Home' ? '/' : `/${name.toLowerCase().replace(' ', '-')}`}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-3 text-gray-600 font-bold hover:text-white hover:bg-black rounded-xl transition-all"
                            >
                                {name}
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
