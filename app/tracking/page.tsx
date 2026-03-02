'use client';
export const runtime = 'edge';

import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Check, Package, Truck, Home, Clock, Navigation } from 'lucide-react';

function TrackingContent() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const fetchOrders = async (ids: string[]) => {
        const loadedOrders = [];
        for (const id of ids) {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    loadedOrders.push({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching order:", id, err);
            }
        }
        return loadedOrders;
    };

    useEffect(() => {
        const loadInitialOrders = async () => {
            if (typeof window === 'undefined') return;
            const localIds = JSON.parse(localStorage.getItem('my_orders') || '[]');
            if (localIds.length > 0) {
                const loaded = await fetchOrders(localIds);
                loaded.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setOrders(loaded);
            }
            setLoading(false);
        };
        loadInitialOrders();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        setSearching(true);
        setSearchError('');
        try {
            const docRef = doc(db, 'orders', searchId.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const newOrder = { id: docSnap.id, ...docSnap.data() };
                setOrders(prev => {
                    if (prev.find(o => o.id === newOrder.id)) return prev;
                    return [newOrder, ...prev];
                });
                setSearchId('');

                const localIds = JSON.parse(localStorage.getItem('my_orders') || '[]');
                if (!localIds.includes(newOrder.id)) {
                    localStorage.setItem('my_orders', JSON.stringify([newOrder.id, ...localIds]));
                }
            } else {
                setSearchError('Order not found. Please check the ID.');
            }
        } catch (err) {
            setSearchError('Error searching for order.');
        } finally {
            setSearching(false);
        }
    };

    const getStatusStep = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 1;
            case 'processing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            default: return 1;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 pb-32">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header Card */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-orange-100/50 overflow-hidden border border-orange-50">
                    <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-pink-600 p-10 text-center text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h1 className="text-4xl font-black mb-1 tracking-tighter uppercase italic flex items-center justify-center gap-3">
                            Track My Order
                        </h1>
                        <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.3em]">Real-time Status Updates</p>
                    </div>

                    <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="Order ID (e.g. AH-123456789)"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 bg-white"
                                />
                                {searchError && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-widest">{searchError}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={searching || !searchId}
                                className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[170px] uppercase text-xs tracking-widest"
                            >
                                {searching ? 'Searching...' : 'Track Now'}
                            </button>
                        </form>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Syncing Feed...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <Package size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Active Signals</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto">Enter an Order ID to initiate sequence</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Recent Tracking</h2>
                        {orders.map((order) => {
                            const currentStep = getStatusStep(order.orderStatus);
                            return (
                                <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-100/30 transition-all duration-700 group">
                                    <div className="p-8 md:p-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-950 flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                                                    <Package className="text-orange-500" size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Transit Label</p>
                                                    <h3 className="text-4xl font-black font-mono text-slate-900 tracking-tighter italic">#{order.id.slice(-8).toUpperCase()}</h3>
                                                </div>
                                            </div>
                                            <div className={`px-8 py-4 rounded-2xl border-2 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 w-fit shadow-xl ${getStatusColor(order.orderStatus)}`}>
                                                <div className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
                                                </div>
                                                {order.orderStatus || 'Pending'}
                                            </div>
                                        </div>

                                        {/* Modern Step Indicator */}
                                        <div className="mb-12 relative px-4">
                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                                    style={{ width: `${(currentStep - 1) * 33.33}%` }}
                                                />
                                            </div>
                                            <div className="relative z-10 flex justify-between">
                                                {[
                                                    { icon: Clock, label: 'Placed' },
                                                    { icon: Package, label: 'Packing' },
                                                    { icon: Truck, label: 'Shipped' },
                                                    { icon: Check, label: 'Arrived' }
                                                ].map((step, idx) => {
                                                    const stepNum = idx + 1;
                                                    const isActive = stepNum <= currentStep;
                                                    const Comp = step.icon;
                                                    return (
                                                        <div key={idx} className="flex flex-col items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl transition-all duration-500 flex items-center justify-center shadow-lg border-4 ${isActive ? 'bg-slate-950 text-orange-500 border-white rotate-12 scale-110' : 'bg-white text-slate-300 border-slate-50'}`}>
                                                                <Comp size={20} />
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Bottom Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 group/item transition-colors hover:bg-white hover:border-orange-200">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2 italic"><Home size={14} className="text-orange-500" /> Destination Protocol</p>
                                                <p className="font-bold text-slate-950 text-sm leading-relaxed">{order.customer?.address}</p>
                                            </div>
                                            <div className="bg-slate-950 text-white rounded-3xl p-6 relative overflow-hidden group/pay shadow-xl flex items-center justify-between">
                                                <div className="relative z-10">
                                                    <p className="text-[9px] text-orange-400 uppercase font-black tracking-[0.3em] mb-1">Financial Clearance</p>
                                                    <p className="text-3xl font-black italic tracking-tighter">৳{(order.totals?.total || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover/pay:rotate-12 transition-transform">
                                                    <Package className="text-orange-500" size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-20 animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Tracking Engine...</div>}>
            <TrackingContent />
        </Suspense>
    );
}

