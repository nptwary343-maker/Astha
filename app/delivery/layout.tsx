'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Truck, Package } from 'lucide-react';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isDelivery } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!isDelivery) {
                // If logged in but not delivery, redirect (middleware should catch this too)
                router.push('/account');
            }
        }
    }, [user, loading, isDelivery, router]);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    if (!isDelivery) return null; // Prevent flash

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Mobile Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Truck size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-none">AstharHat</h1>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Delivery Partner</p>
                    </div>
                </div>
                <button
                    onClick={() => auth.signOut()}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                    <LogOut size={20} />
                </button>
            </header>

            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-3 z-40 pb-safe">
                <Link href="/delivery" className="flex flex-col items-center gap-1 text-blue-600">
                    <Package size={20} />
                    <span className="text-[10px] font-bold">My Orders</span>
                </Link>
                {/* Future: Profile link */}
            </nav>
        </div>
    );
}
