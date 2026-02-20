'use client';
export const runtime = 'edge';;

import { User, MapPin, Package, CreditCard, Settings, LogOut, ChevronRight, Plus, Trash2, Edit2, Shield, Bell, Sparkles, Layers, Database } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ProtectedRoute } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Copy } from 'lucide-react';
import { useEffect } from 'react';

export default function AccountPage() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const router = useRouter();

    const [bkashQr, setBkashQr] = useState('');
    const [bkashNumber, setBkashNumber] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBkashQr(data.bkashQr || '');
                    setBkashNumber(data.bkashNumber || '01XXXXXXX');
                }
            } catch (e) {
                console.error("Settings error", e);
            }
        };
        fetchSettings();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('isMasterAdmin');
                sessionStorage.removeItem('adminUserEmail');
            }
            router.push('/login');
        } catch (error) {
            console.error(error);
        }
    };

    const tabs = [
        { id: 'personal', name: 'Identity', icon: User },
        { id: 'orders', name: 'Order History', icon: Package },
        { id: 'addresses', name: 'Logistics', icon: MapPin },
        { id: 'payments', name: 'Vault', icon: CreditCard },
        { id: 'settings', name: 'Preferences', icon: Settings },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-4 py-12 md:py-20">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-maroon dark:text-white tracking-tighter mb-2">Member Portal</h1>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Management & Insights</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl">
                            <div className="w-12 h-12 rounded-xl bg-maroon flex items-center justify-center text-gold font-black text-xl">
                                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                            </div>
                            <div className="pr-4">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-gray-900 dark:text-white text-sm">{user?.displayName || 'Premium User'}</p>
                                    <span className="flex items-center gap-1 bg-gold/10 text-gold px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border border-gold/20">
                                        <Shield size={10} /> Premium Buyer
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Navigation Sidebar */}
                        <div className="lg:w-1/4">
                            <nav className="bg-white dark:bg-zinc-900 rounded-3xl p-3 border border-gray-50 dark:border-zinc-800 shadow-2xl space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                                            ${activeTab === tab.id
                                                ? 'bg-maroon text-gold shadow-lg shadow-maroon/20 translate-x-2'
                                                : 'text-gray-400 hover:text-maroon dark:hover:text-gold hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                                    >
                                        <tab.icon size={18} className={activeTab === tab.id ? 'text-gold' : ''} />
                                        {tab.name}
                                    </button>
                                ))}
                                <div className="h-px bg-gray-50 dark:bg-zinc-800 my-4" />
                                {isAdmin && (
                                    <button
                                        onClick={() => router.push('/admin')}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all"
                                    >
                                        <Shield size={18} /> Admin Panel
                                    </button>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={18} /> Exit Portal
                                </button>
                            </nav>
                        </div>

                        {/* Content Grid */}
                        <div className="lg:w-3/4">
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-50 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8">
                                            <div className="relative">
                                                <div className="absolute -inset-4 bg-gold/20 blur-2xl rounded-full animate-pulse" />
                                                <User size={64} className="text-gray-50 dark:text-zinc-800 group-hover:text-gold/20 transition-colors relative z-10" />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-black text-maroon dark:text-white mb-8 tracking-tighter">Identity Profile</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            {[
                                                { label: 'Registered Name', value: user?.displayName || 'Not Set' },
                                                { label: 'Contact Email', value: user?.email },
                                                { label: 'Account Rank', value: 'Premium Member' },
                                                { label: 'Security Level', value: 'Verified' },
                                            ].map((f) => (
                                                <div key={f.label}>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{f.label}</p>
                                                    <p className="font-bold text-gray-900 dark:text-zinc-100">{f.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 🧬 Integrated Style DNA Section */}
                                    <div className="bg-maroon rounded-3xl p-8 text-white shadow-2xl border border-gold/20 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-700" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                                                    <Sparkles className="text-gold" size={20} />
                                                </div>
                                                <h3 className="text-gold font-black text-xs uppercase tracking-[0.3em]">Style DNA</h3>
                                            </div>
                                            <p className="text-xl font-black leading-tight tracking-tight mb-4">
                                                {typeof window !== 'undefined' && localStorage.getItem('fashion_persona')
                                                    ? `Your DNA: ${localStorage.getItem('fashion_persona')?.toUpperCase()}`
                                                    : 'Persona Analysis Pending'}
                                            </p>
                                            <p className="text-gold/60 text-xs font-bold leading-relaxed mb-6">
                                                Our AI is currently syncing your shopping patterns to build your custom fashion profile.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push('/shop?persona=analyze')}
                                            className="relative z-10 bg-gold text-maroon w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                                        >
                                            Refine Persona
                                        </button>
                                    </div>

                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-50 dark:border-zinc-800 shadow-2xl flex flex-col justify-between min-h-[260px]">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                    <Layers className="text-blue-500" size={20} />
                                                </div>
                                                <h3 className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]">Loyalty Points</h3>
                                            </div>
                                            <p className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">2,450 <span className="text-base font-bold text-gray-400">PTS</span></p>
                                            <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest">350 PTS to next rank</p>
                                        </div>
                                        <button className="border border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-white w-fit px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">Redeem Rewards</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {[
                                        { id: 'ASTHA-13345', date: 'Oct 24, 2024', total: '৳13,900', status: 'In Transit' },
                                        { id: 'ASTHA-12009', date: 'Sep 10, 2024', total: '৳2,500', status: 'Delivered' },
                                    ].map((order) => (
                                        <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-50 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-maroon dark:text-gold">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 dark:text-white tracking-tight">{order.id}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs font-black text-maroon dark:text-gold">{order.total}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{order.status}</p>
                                                </div>
                                                <ChevronRight className="text-gray-300 group-hover:text-gold transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden h-64 flex flex-col justify-between border border-white/5">
                                        <div className="absolute -right-10 -bottom-10 opacity-10">
                                            <CreditCard size={200} />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <Database className="text-gold" size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Secure Vault</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold opacity-50 mb-1">Saved Secondary Method</p>
                                            <p className="text-lg font-black tracking-widest">**** **** **** 4242</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#D12053] rounded-3xl p-8 text-white h-64 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-8 right-8 w-16 h-16 bg-white/20 blur-2xl rounded-full" />
                                        <h3 className="font-black text-xl tracking-tight">bKash Active</h3>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Linked Wallet</p>
                                            <p className="text-2xl font-black tracking-tighter">{bkashNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fallback for other tabs */}
                            {['addresses', 'settings'].includes(activeTab) && (
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-20 border border-dashed border-gray-200 dark:border-zinc-800 text-center animate-in fade-in">
                                    <Settings className="mx-auto text-gray-200 mb-4 animate-spin-slow" size={48} />
                                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Synchronizing Module...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

