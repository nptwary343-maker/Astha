'use client';

import { Home, Search, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Shop', href: '/shop', icon: Search },
        { name: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
        { name: 'Account', href: '/account', icon: User },
    ];

    // Hide on specific routes if needed (e.g., checkout/admin) but usually good to have
    if (pathname.startsWith('/admin')) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-black' : 'text-gray-400'}`}
                        >
                            <div className="relative">
                                <item.icon size={24} className={isActive ? 'fill-current' : ''} strokeWidth={isActive ? 2.5 : 2} />
                                {item.badge ? (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
