'use client';
export const runtime = 'edge';


import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Check, Package, Truck, Home, Clock, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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
                // Add to list if not already there
                setOrders(prev => {
                    if (prev.find(o => o.id === newOrder.id)) return prev;
                    return [newOrder, ...prev];
                });
                setSearchId('');

                // Save to local storage too
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
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header Card */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-orange-100/50 overflow-hidden border border-orange-50">
                    <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-pink-600 p-10 text-center text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">Track My Order</h1>
                        <p className="text-orange-100 text-sm font-medium tracking-wide">Real-time status of your premium purchases</p>
                    </div>

                    {/* Search Bar */}
                    <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="Enter Order ID (e.g. AH-123456789)"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 bg-white shadow-sm"
                                />
                                {searchError && <p className="text-red-500 text-xs mt-2 ml-2 font-bold">{searchError}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={searching || !searchId}
                                className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px] uppercase text-xs tracking-widest"
                            >
                                {searching ? 'Searching...' : 'Track Now'}
                            </button>
                        </form>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Syncing Orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <Package size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Orders Yet</h3>
                        <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">Use the search bar above or check your local orders to see status.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Recent Tracking History</h2>
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-orange-100/20 transition-all duration-500 group">
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-50">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Security ID</p>
                                            <h3 className="text-3xl font-black font-mono text-slate-900 tracking-tighter decoration-orange-500/30 underline-offset-8">#{order.id}</h3>
                                        </div>
                                        <div className={`px-6 py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest flex items-center gap-3 w-fit shadow-sm ${getStatusColor(order.orderStatus)}`}>
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                                            </span>
                                            {order.orderStatus || 'Pending'}
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><Clock size={12} /> Order Date</p>
                                            <p className="font-bold text-slate-800 text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><Home size={12} /> Shipping Address</p>
                                            <p className="font-bold text-slate-800 text-sm truncate">{order.customer?.address}</p>
                                        </div>
                                    </div>

                                    {/* Action - Security Block */}
                                    <div className="bg-slate-950 text-white rounded-[1.5rem] p-8 relative overflow-hidden group/card shadow-2xl">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:opacity-10 transition-opacity transform group-hover/card:scale-110 duration-700">
                                            <Package size={120} />
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-8 justify-between relative z-10">
                                            <div className="space-y-4 text-center md:text-left">
                                                <div>
                                                    <p className="text-[10px] text-orange-400 uppercase font-black tracking-[0.3em] mb-1">Total Payable</p>
                                                    <p className="text-4xl font-black italic tracking-tighter">৳{(order.totals?.total || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                    <Check className="text-orange-500" size={14} /> Verified Order
                                                </div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center min-w-[200px]">
                                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mb-3">Courier Scan ID</p>
                                                <h2 className="text-2xl font-black font-mono tracking-[0.2em] text-orange-400 drop-shadow-2xl select-all">
                                                    {order.id}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <TrackingContent />
        </Suspense>
    );
}

