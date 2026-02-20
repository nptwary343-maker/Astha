'use client';
export const runtime = 'edge';;

import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Check, Package, Truck, Home, Clock, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function TrackingContent() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyOrders = async () => {
            if (typeof window === 'undefined') return;

            // Get IDs from Local Storage (Standard User Flow)
            const localIds = JSON.parse(localStorage.getItem('my_orders') || '[]');

            if (localIds.length === 0) {
                setLoading(false);
                return;
            }

            const loadedOrders = [];
            for (const id of localIds) {
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

            // Sort by date (newest first)
            loadedOrders.sort((a: any, b: any) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setOrders(loadedOrders);
            setLoading(false);
        };

        fetchMyOrders();
    }, []);

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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-orange-600 to-pink-600 p-8 text-center text-white">
                        <h1 className="text-3xl font-black mb-2 tracking-tight">My Orders</h1>
                        <p className="text-orange-100 text-sm">Track your purchases & Delivery Status</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Orders Found</h3>
                        <p className="text-gray-500 text-sm mt-2">Your recent orders will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                                            <h3 className="text-2xl font-black font-mono text-gray-900">#{order.id}</h3>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 w-fit ${getStatusColor(order.orderStatus)}`}>
                                            <div className="w-2 h-2 rounded-full bg-current"></div>
                                            {order.orderStatus || 'Pending'}
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-400 font-bold mb-1">Amount</p>
                                            <p className="font-bold text-gray-900">৳{(order.totals?.total || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl col-span-2 md:col-span-3">
                                            <p className="text-xs text-gray-400 font-bold mb-1">Delivery Address</p>
                                            <p className="font-medium text-gray-700 text-sm truncate">{order.customer?.address}</p>
                                        </div>
                                    </div>

                                    {/* Delivery Man Section (Proof for Check) */}
                                    {order.assignedManName ? (
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center gap-4">
                                            <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm">
                                                <Truck size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-blue-500 uppercase mb-0.5">Delivery Partner</p>
                                                <h4 className="font-bold text-gray-900">{order.assignedManName}</h4>
                                                <p className="text-sm text-gray-600 font-mono">{order.assignedManPhone}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 border-dashed">
                                            <Clock size={16} />
                                            <span>Waiting for delivery assignment...</span>
                                        </div>
                                    )}

                                    {/* Action - Show Details / QR */}
                                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                        <div className="bg-gray-900 text-white rounded-xl p-4 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Package size={100} />
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mb-2">Show to Delivery Man</p>
                                            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 inline-block border border-white/10">
                                                <h2 className="text-2xl font-black font-mono tracking-widest text-emerald-400 drop-shadow-sm select-all">
                                                    {order.id}
                                                </h2>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2 font-medium">Security Tracker ID</p>
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

