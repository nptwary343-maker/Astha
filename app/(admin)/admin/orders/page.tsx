'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, MoreHorizontal, Filter, Search, Download, DollarSign, Package, CheckCircle, Clock, PlusCircle, XCircle, Trash2, AlertTriangle, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { syncOrderAction, adminUpdateOrderStatusAction } from '@/actions/mongo-actions';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
    const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
    const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
    const { isSuperAdmin } = useAuth(); // Strict Security

    useEffect(() => {
        const fetchDeliveryMen = async () => {
            try {
                const q = query(collection(db, 'admin_users'), where('role', '==', 'delivery'));
                const snap = await getDocs(q);
                setDeliveryMen(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (e) { console.error("Error fetching delivery men:", e); }
        };
        fetchDeliveryMen();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Strict: Limit to last 100 orders to prevent crash
                const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Order[];
                setOrders(ordersData);

                const totalRev = ordersData.reduce((acc, order) => acc + (order.totals?.total || 0), 0);
                setStats({
                    totalOrders: ordersData.length,
                    totalRevenue: totalRev
                });

            } catch (error: any) {
                console.error("Error fetching orders:", error);
                if (error.code === 'resource-exhausted' || error.message?.includes('quota')) {
                    setIsQuotaExceeded(true);

                    // 🛡️ AUTO-RETRIEVE FROM BACKUP POOL
                    console.log("📡 [FAILOVER] Fetching orders from MongoDB Backup Pool...");
                    try {
                        const response = await fetch('/api/admin/orders/failover');
                        if (response.ok) {
                            const backupData = await response.json();
                            setOrders(backupData);

                            const totalRev = backupData.reduce((acc: any, order: any) => acc + (order.totals?.total || 0), 0);
                            setStats({
                                totalOrders: backupData.length,
                                totalRevenue: totalRev
                            });
                        }
                    } catch (fetchErr) {
                        console.error("Critical: Backup Fetch Failed:", fetchErr);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleVerifyPayment = async (orderId: string, newStatus: string) => {
        const isVerified = newStatus === 'Paid';
        // We don't need a cycle logic anymore, we set directly what was clicked
        // if (confirm(`Mark order as ${newStatus}?`)) { // Optional: remove confirm for faster workflow if buttons are distinct
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                'payment.status': newStatus,
                'payment.isVerified': isVerified
            });

            // Update local state
            const targetOrder = orders.find(o => o.id === orderId);
            if (targetOrder) {
                syncOrderAction({
                    orderId,
                    total: targetOrder.totals?.total || 0,
                    status: newStatus,
                    createdAt: targetOrder.createdAt?.seconds ? new Date(targetOrder.createdAt.seconds * 1000).toISOString() : new Date().toISOString()
                }).catch(e => console.error("Mongo Order Sync Error:", e));
            }

            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, payment: { ...o.payment!, status: newStatus as any } } : o
            ));
        } catch (error) {
            console.error("Error updating payment:", error);
            alert("Failed to update payment status.");
        }
        // }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                orderStatus: newStatus
            });

            // Update local state
            const targetOrder = orders.find(o => o.id === orderId);
            if (targetOrder) {
                // 📡 Modern Approach: Update Analytics & Trigger Email via Server Action
                adminUpdateOrderStatusAction({
                    orderId,
                    customerName: targetOrder.customer?.name || 'Customer',
                    totalPrice: targetOrder.totals?.total || 0,
                    address: targetOrder.customer?.address || 'N/A',
                    userEmail: targetOrder.userEmail || '', // Now saved in order
                    status: newStatus
                }).catch(e => console.error("Admin Status Update Action Error:", e));
            }

            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, orderStatus: newStatus } : o
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    const handleAssignDelivery = async (orderId: string, deliveryManId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { deliveryManId });
            setOrders(orders.map(o => o.id === orderId ? { ...o, deliveryManId } : o));
            // alert("Order assigned to Delivery Man!");
        } catch (error) {
            console.error("Error assigning delivery:", error);
            alert("Failed to assign delivery.");
        }
    };

    const handleManualEmail = async (order: Order) => {
        if (!order.userEmail) {
            alert("No email address found for this order.");
            return;
        }

        if (confirm(`Send status email (${order.orderStatus || 'Pending'}) to ${order.userEmail}?`)) {
            try {
                await adminUpdateOrderStatusAction({
                    orderId: order.id,
                    customerName: order.customer?.name || 'Customer',
                    totalPrice: order.totals?.total || 0,
                    address: order.customer?.address || 'N/A',
                    userEmail: order.userEmail,
                    status: order.orderStatus || 'Pending'
                });
                alert("Email sent successfully!");
            } catch (error) {
                console.error("Manual Email Error:", error);
                alert("Failed to send email.");
            }
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        // STRICT RULE: Only Super Admin can delete
        if (!isSuperAdmin) {
            alert("Restricted: Only Super Admins can delete orders.");
            return;
        }

        if (confirm("Are you sure you want to DELETE this order? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'orders', orderId));
                setOrders(orders.filter(o => o.id !== orderId));
                setStats(prev => ({ ...prev, totalOrders: prev.totalOrders - 1 })); // simple stats update
            } catch (error) {
                console.error("Error deleting order:", error);
                alert("Failed to delete order.");
            }
        }
    };

    const addMockOrder = async () => {
        try {
            const mockOrder = {
                items: [
                    { id: 1, name: 'Premium Wireless Headphones', price: 15000, quantity: 1 }
                ],
                customer: { name: 'Rahim Uddin', phone: '01712345678', address: '123 Fake St, Dhaka' },
                payment: {
                    method: 'bkash',
                    trxId: 'TRX' + Math.floor(Math.random() * 1000000),
                    status: 'Pending',
                    isVerified: false
                },
                totals: {
                    subtotal: 15000,
                    shipping: 120,
                    tax: 750,
                    total: 15870
                },
                orderStatus: 'Pending',
                createdAt: serverTimestamp(),
                invoiceNumber: 'INV-' + Math.floor(Math.random() * 10000)
            };

            await addDoc(collection(db, 'orders'), mockOrder);
            alert("Mock order added! Refresh to see.");
            // Optional: trigger re-fetch or manual append
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase();
        return (
            (order.customer?.name || '').toLowerCase().includes(term) ||
            (order.invoiceNumber || order.id || '').toLowerCase().includes(term) ||
            (order.customer?.phone || '').toLowerCase().includes(term)
        );
    });

    const OrderDetailsModal = ({ order, onClose }: { order: Order, onClose: () => void }) => {
        if (!order) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                            <p className="text-xs text-gray-500 font-mono">#{order.invoiceNumber || order.id}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <XCircle size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Customer</p>
                                <p className="font-bold text-gray-900">{order.customer?.name}</p>
                                <p className="text-gray-600">{order.customer?.phone}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email Address</p>
                                <p className="text-gray-900">{order.userEmail || <span className="text-gray-400 italic">Not provided</span>}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Delivery Address</p>
                                <p className="text-gray-600 leading-relaxed">{order.customer?.address}</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Items Purchased</p>
                            <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {/* Placeholder for item image if available, else icon */}
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package size={20} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ৳{item.price || item.unitPrice}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">৳{((item.price || item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Info</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-bold capitalize">{order.payment?.method}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.payment?.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                        order.payment?.status === 'Unpaid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.payment?.status}
                                    </span>
                                </div>
                                {order.payment?.trxId && <p className="text-xs text-gray-500 font-mono mt-1">Trx: {order.payment.trxId}</p>}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Order Status</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {order.orderStatus || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Summary */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>৳{Number(order.totals?.subtotal ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee</span>
                                <span>৳{Number(order.totals?.shipping ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <span>Discount</span>
                                <span>-৳{Number(order.totals?.discount ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (VAT)</span>
                                <span>৳{Number(order.totals?.tax ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-black text-lg text-gray-900">
                                <span>Total</span>
                                <span>৳{Number(order.totals?.total ?? 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h1>
                    <p className="text-gray-500 text-sm">Monitor sales and update delivery status.</p>
                </div>
            </div>

            {isQuotaExceeded && (
                <div className="mb-8 p-6 bg-red-600 rounded-3xl text-white shadow-2xl shadow-red-500/40 animate-pulse border-4 border-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase">⚠️ Firebase Quota Exceeded!</h2>
                            <p className="font-bold opacity-90">Orders are now being redirected to the MongoDB backup pool. Switch to 'Backup View' to see new orders.</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-auto bg-white text-red-600 px-6 py-2 rounded-xl font-black hover:bg-gray-100 transition-all uppercase tracking-widest text-sm"
                        >
                            Retry Sync
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={addMockOrder}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold border border-blue-600 flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <PlusCircle size={18} /> Add Mock Order
                </button>
                <button className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <Download size={18} /> Export
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">Total Orders</p>
                            <p className="text-2xl font-black text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">Total Revenue</p>
                            <p className="text-2xl font-black text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
                <button className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <Filter size={18} /> Filter Status
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-4 md:px-6 py-4 hidden md:table-cell">Invoice #</th>
                                <th className="px-4 md:px-6 py-4 hidden lg:table-cell">Type</th>
                                <th className="px-4 md:px-6 py-4 hidden lg:table-cell">Date</th>
                                <th className="px-4 md:px-6 py-4">Customer</th>
                                <th className="px-4 md:px-6 py-4">Total</th>
                                <th className="px-4 md:px-6 py-4">Payment</th>
                                <th className="px-4 md:px-6 py-4 hidden md:table-cell">Status</th>
                                <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-400 font-medium">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    if (order.is_flagged_bot) {
                                        return (
                                            <tr key={order.id} className="bg-red-50 border-l-4 border-red-500">
                                                <td className="px-4 md:px-6 py-4 font-mono font-bold text-red-600">
                                                    #{order.invoiceNumber || order.id.slice(0, 6)}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">
                                                        BOT / SPAM
                                                    </span>
                                                </td>
                                                <td colSpan={2} className="px-4 md:px-6 py-4 text-red-600 font-medium">
                                                    ⚠️ Fake Bot Order Detected
                                                </td>
                                                <td className="px-4 md:px-6 py-4 font-bold text-gray-400">
                                                    ৳{order.totals?.total?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="text-xs font-bold text-red-400">FAKE PAYMENT</span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="flex items-center gap-1 font-bold text-xs text-red-600">
                                                        <AlertTriangle size={14} />
                                                        FLAGGED
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1 ml-auto"
                                                    >
                                                        <Trash2 size={14} /> DELETE FAKE
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 md:px-6 py-6 font-mono font-black text-blue-600 hidden md:table-cell text-base">#{order.invoiceNumber || order.id.slice(0, 8)}</td>
                                            <td className="px-4 md:px-6 py-6 hidden lg:table-cell">
                                                {order.source === 'manual' ? (
                                                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200">
                                                        Manual
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                                                        Online
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 md:px-6 py-6 text-gray-500 hidden lg:table-cell font-medium">
                                                {order.date ? new Date(order.date).toLocaleDateString() : (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A')}
                                            </td>
                                            <td className="px-4 md:px-6 py-6">
                                                <p className="font-black text-gray-900 text-base line-clamp-1">{order.customer?.name || 'Walk-in Customer'}</p>
                                                <p className="text-xs font-bold text-gray-500 line-clamp-1">{order.customer?.phone}</p>
                                            </td>
                                            <td className="px-4 md:px-6 py-6 font-black text-lg text-gray-900">৳{order.totals?.total?.toLocaleString() || 0}</td>
                                            <td className="px-4 md:px-6 py-6">
                                                <div className={`border-2 rounded-xl p-3 bg-white shadow-sm min-w-[180px] transition-all ${order.payment?.status === 'Paid' ? 'border-green-200 bg-green-50/20' :
                                                    order.payment?.status === 'Unpaid' ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
                                                    }`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${order.payment?.method === 'bkash' ? 'text-pink-600' : 'text-gray-900'
                                                            }`}>
                                                            {order.payment?.method || 'Cash'}
                                                        </span>
                                                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                                            <button
                                                                onClick={() => order.payment?.status !== 'Pending' && handleVerifyPayment(order.id, 'Pending')}
                                                                className={`p-1.5 rounded-md transition-all ${(order.payment?.status || 'Pending') === 'Pending'
                                                                    ? 'bg-orange-500 text-white shadow-md scale-110'
                                                                    : 'text-gray-400 hover:bg-gray-200'
                                                                    }`}
                                                                title="Set as Pending"
                                                            >
                                                                <Clock size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => order.payment?.status !== 'Paid' && handleVerifyPayment(order.id, 'Paid')}
                                                                className={`p-1.5 rounded-md transition-all ${order.payment?.status === 'Paid'
                                                                    ? 'bg-green-600 text-white shadow-md scale-110'
                                                                    : 'text-gray-400 hover:bg-gray-200'
                                                                    }`}
                                                                title="Set as Paid"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => order.payment?.status !== 'Unpaid' && handleVerifyPayment(order.id, 'Unpaid')}
                                                                className={`p-1.5 rounded-md transition-all ${order.payment?.status === 'Unpaid'
                                                                    ? 'bg-red-600 text-white shadow-md scale-110'
                                                                    : 'text-gray-400 hover:bg-gray-200'
                                                                    }`}
                                                                title="Set as Unpaid"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {order.payment?.trxId ? (
                                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 mt-1">
                                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Trx ID</p>
                                                            <p className="text-xs font-mono font-black text-gray-800 select-all truncate">{order.payment.trxId}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-gray-400 italic mt-1 font-bold">No Transaction ID</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-6 hidden md:table-cell">
                                                <div className="space-y-4">
                                                    <select
                                                        value={order.orderStatus || 'Pending'}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                        className={`w-full text-sm font-black px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 cursor-pointer outline-none transition-all shadow-md
                                                            ${(order.orderStatus === 'Pending' || !order.orderStatus) ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : ''}
                                                            ${order.orderStatus === 'Processing' ? 'bg-blue-100 border-blue-300 text-blue-800' : ''}
                                                            ${order.orderStatus === 'Shipped' ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : ''}
                                                            ${order.orderStatus === 'Delivered' ? 'bg-green-100 border-green-300 text-green-800' : ''}
                                                            ${order.orderStatus === 'Cancelled' ? 'bg-red-100 border-red-300 text-red-800' : ''}
                                                        `}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {order.userEmail && (
                                                        <button
                                                            onClick={() => handleManualEmail(order)}
                                                            className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                                                            title="Send Email"
                                                        >
                                                            <Mail size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-1"
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
}
