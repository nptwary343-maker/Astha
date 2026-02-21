'use client';
export const runtime = 'edge';


import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logActivity } from '@/lib/logger';
import { MapPin, Phone, Package, Clock, CheckCircle } from 'lucide-react';
import { syncOrderAction } from '@/actions/mongo-actions';
import { verifyPaymentAction } from '@/actions/admin-actions';

interface Order {
    id: string;
    customer: {
        name: string;
        phone: string;
        address: string;
    };
    totals: {
        total: number;
    };
    payment: {
        method: string;
        status: string;
    };
    orderStatus: string;
    createdAt: any;
    items: any[];
}

export default function DeliveryDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignedOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch orders assigned to this delivery man (using UID or Email)
            // Note: Since 'deliveryManId' might not exist on all orders, this query might return empty initially.
            // We are querying by 'deliveryManId' which matches the User UID.
            const q = query(
                collection(db, 'orders'),
                where('deliveryManId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            // Fallback for demo: if index missing or error, just show empty
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedOrders();
    }, [user]);

    const updateStatus = async (orderId: string, status: string) => {
        if (!confirm(`Mark this order as ${status}?`)) return;
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                orderStatus: status,
                deliveredAt: status === 'Delivered' ? new Date() : null
            });

            // 🚀 SYNC TO MONGO (AI Cache)
            const targetOrder = orders.find(o => o.id === orderId);
            if (targetOrder) {
                syncOrderAction({
                    orderId,
                    total: targetOrder.totals?.total || 0,
                    status: status,
                    createdAt: targetOrder.createdAt?.seconds ? new Date(targetOrder.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
                    customer: targetOrder.customer ? {
                        name: targetOrder.customer.name,
                        phone: targetOrder.customer.phone,
                        address: targetOrder.customer.address
                    } : undefined
                }).catch(e => console.error("Mongo Sync Error:", e));
            }
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleCollectCash = async (orderId: string, amount: number) => {
        if (!confirm(`Confirm collection of ৳${amount}?`)) return;

        try {
            // 🛡️ ZERO TRUST HARDENING: Call SECURE Server Action (Not a public API)
            const result = await verifyPaymentAction({
                orderId,
                actionBy: user?.displayName || 'Delivery Man',
                actionByRole: 'delivery_man',
                actionByPhone: user?.email || undefined,
                method: 'Cash On Delivery'
            });

            if (!result.success) {
                throw new Error(result.error || 'Verification Failed');
            }

            alert(`Success: ${result.message || 'Payment Verified & Customer Notified'}`);

            // 🚀 SYNC TO MONGO (AI Cache)
            const targetOrder = orders.find(o => o.id === orderId);
            if (targetOrder) {
                syncOrderAction({
                    orderId,
                    total: targetOrder.totals?.total || 0,
                    status: 'Delivered', // Payment verification by DM usually ends the order
                    createdAt: targetOrder.createdAt?.seconds ? new Date(targetOrder.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
                    customer: targetOrder.customer ? {
                        name: targetOrder.customer.name,
                        phone: targetOrder.customer.phone,
                        address: targetOrder.customer.address
                    } : undefined
                }).catch(e => console.error("Mongo Sync Error:", e));
            }

            // Update local state
            setOrders(orders.map(o => o.id === orderId ? {
                ...o,
                payment: { ...o.payment, status: 'Paid' },
                orderStatus: 'Delivered'
            } : o));

        } catch (error) {
            console.error("Error collecting cash:", error);
            alert("Failed to verify payment via API.");
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Loading your orders...</div>;

    return (
        <div className="space-y-4">
            <h2 className="font-bold text-lg text-gray-800">Assigned Deliveries ({orders.length})</h2>

            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 mt-4">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4">
                        <Package size={32} />
                    </div>
                    <h3 className="font-bold text-gray-900">No Orders Assigned</h3>
                    <p className="text-gray-500 text-sm mt-2">You have no pending deliveries at the moment.</p>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-100">
                            <span className="font-mono font-bold text-gray-600 text-xs">#{order.id.slice(0, 8)}</span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.orderStatus || 'Pending'}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{order.customer?.name}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{order.customer?.address}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-gray-400 shrink-0" />
                                <a href={`tel:${order.customer?.phone}`} className="text-blue-600 font-bold text-sm hover:underline">
                                    {order.customer?.phone}
                                </a>
                            </div>

                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm">
                                <div>
                                    <span className="text-gray-500 text-xs block">Amount to Collect</span>
                                    <span className={`font-bold ${order.payment?.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                        {order.payment?.status === 'Paid' ? 'Paid (৳0 Due)' : `৳${order.totals?.total}`}
                                    </span>
                                </div>
                                {order.payment?.status === 'Paid' && (
                                    <span className="bg-green-50 text-green-600 text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <CheckCircle size={10} /> Paid
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {order.orderStatus !== 'Delivered' && (
                            <div className="p-3 bg-gray-50 grid grid-cols-2 gap-2">
                                {order.payment?.status !== 'Paid' ? (
                                    <button
                                        onClick={() => handleCollectCash(order.id, order.totals?.total)}
                                        className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[10px] font-normal opacity-80">Collect Cash</span>
                                            <span>৳{order.totals?.total}</span>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="bg-gray-200 text-gray-500 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                        Payment Verified
                                    </div>
                                )}

                                <button
                                    onClick={() => updateStatus(order.id, 'Delivered')}
                                    className="bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Deliver Only
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
