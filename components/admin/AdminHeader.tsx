'use client';

import { Search, Bell, Menu, Terminal, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

interface AdminHeaderProps {
    onMenuClick?: () => void;
    title?: string;
}

export default function AdminHeader({ onMenuClick = () => { }, title }: AdminHeaderProps) {
    const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <header className="h-20 bg-white/80 border-b border-gray-100 w-full md:ml-64 md:w-[calc(100%-16rem)]" />;

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Perform a tiny check read
                const q = query(collection(db, 'settings'), limit(1));
                await getDocs(q);
            } catch (error: any) {
                if (error.code === 'resource-exhausted' || error.message?.includes('quota')) {
                    setIsQuotaExceeded(true);
                }
            }
        };
        checkHealth();
    }, []);

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 w-full md:ml-64 md:w-[calc(100%-16rem)] transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="relative hidden sm:block w-64 md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                </div>
                {title && (
                    <h1 className="hidden lg:block text-lg font-black text-gray-900 ml-4 border-l-2 border-gray-100 pl-4">
                        {title}
                    </h1>
                )}
                {/* Mobile Search Icon Only */}
                <button className="sm:hidden p-2 text-gray-600">
                    <Search size={24} />
                </button>
            </div>

            <div className="flex items-center gap-6">
                {isQuotaExceeded && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 animate-pulse">
                        <AlertTriangle size={16} />
                        <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Firebase Quota Reached</span>
                        <span className="text-[10px] font-bold sm:hidden">QUOTA HIT</span>
                    </div>
                )}

                <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-0.5 cursor-pointer">
                        <div className="w-full h-full bg-white rounded-full p-0.5">
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                AU
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
