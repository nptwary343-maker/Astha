'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

export default function SalesAnalyticsTable() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Order[];
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 text-center text-gray-400">Loading analytics...</div>;

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Recent Sales Analytics</h3>
                <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4 rounded-l-xl">Order ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 rounded-r-xl">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-4 text-gray-400">No data available</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600">#{order.invoiceNumber || order.id.slice(0, 6)}</td>
                                    <td className="px-6 py-4">
                                        {order.source === 'manual' ? (
                                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-bold border border-purple-100">
                                                Manual
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100">
                                                Online
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{order.customer?.name}</span>
                                            <span className="text-[10px] text-gray-400">{order.customer?.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">৳{order.totals?.total?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${order.payment?.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            order.payment?.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                order.payment?.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-50 text-red-600'
                                            }`}>
                                            {order.payment?.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
