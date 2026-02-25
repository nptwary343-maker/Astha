'use client';

import { Home, LayoutGrid, Search, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Categories', href: '/shop', icon: LayoutGrid },
        { name: 'Search', href: '/shop?focus=search', icon: Search },
        { name: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
        { name: 'Account', href: '/account', icon: User },
    ];

    // Hide on admin routes
    if (pathname?.startsWith('/admin')) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-safe md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around h-[64px]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.name === 'Search' && pathname === '/shop' && pathname.includes('focus=search'));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 group transition-all duration-300 ${isActive ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}
                        >
                            <div className="relative">
                                <item.icon
                                    size={22}
                                    className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {item.badge ? (
                                    <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-black h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-white dark:border-slate-900 animate-in zoom-in">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-bold tracking-tight">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
