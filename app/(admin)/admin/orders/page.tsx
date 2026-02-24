'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Eye, Filter, Search, Download, DollarSign, Package, CheckCircle, Clock, PlusCircle, XCircle, Trash2, AlertTriangle, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

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
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
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

export default function OrdersPage() {
    const [mounted, setMounted] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { isSuperAdmin } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!mounted) return;
            try {
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
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [mounted]);

    if (!mounted) return null;

    const handleVerifyPayment = async (orderId: string, newStatus: string) => {
        const isVerified = newStatus === 'Paid';
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                'payment.status': newStatus,
                'payment.isVerified': isVerified
            });

            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, payment: { ...o.payment!, status: newStatus as any } } : o
            ));
        } catch (error) {
            console.error("Error updating payment:", error);
            alert("Failed to update payment status.");
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { orderStatus: newStatus });

            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, orderStatus: newStatus } : o
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!isSuperAdmin) {
            alert("Restricted: Only Super Admins can delete orders.");
            return;
        }

        if (confirm("Are you sure you want to DELETE this order? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'orders', orderId));
                setOrders(orders.filter(o => o.id !== orderId));
                setStats(prev => ({ ...prev, totalOrders: prev.totalOrders - 1 }));
            } catch (error) {
                console.error("Error deleting order:", error);
                alert("Failed to delete order.");
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase();
        return (
            (order.customer?.name || '').toLowerCase().includes(term) ||
            (order.invoiceNumber || order.id || '').toLowerCase().includes(term) ||
            (order.customer?.phone || '').toLowerCase().includes(term)
        );
    });

    if (loading) return <div className="p-8 text-center text-gray-500 font-mono text-xs animate-pulse uppercase tracking-[0.2em]">Synchronizing Records Cluster...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h1>
                    <p className="text-gray-500 text-sm">Monitor sales and update delivery status.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Filter size={18} /> Filter
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-4 md:px-6 py-4 hidden md:table-cell">Invoice #</th>
                                <th className="px-4 md:px-6 py-4">Customer</th>
                                <th className="px-4 md:px-6 py-4">Total</th>
                                <th className="px-4 md:px-6 py-4">Payment</th>
                                <th className="px-4 md:px-6 py-4 hidden md:table-cell">Status</th>
                                <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-400 font-medium">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 md:px-6 py-6 font-mono font-black text-blue-600 hidden md:table-cell text-base">#{order.invoiceNumber || order.id.slice(0, 8)}</td>
                                        <td className="px-4 md:px-6 py-6">
                                            <p className="font-black text-gray-900 text-base line-clamp-1">{order.customer?.name || 'Customer'}</p>
                                            <p className="text-xs font-bold text-gray-500">{order.customer?.phone}</p>
                                        </td>
                                        <td className="px-4 md:px-6 py-6 font-black text-lg text-gray-900">৳{order.totals?.total?.toLocaleString() || 0}</td>
                                        <td className="px-4 md:px-6 py-6">
                                            <div className={`border-2 rounded-xl p-3 bg-white shadow-sm min-w-[180px] transition-all ${order.payment?.status === 'Paid' ? 'border-green-200 bg-green-50/20' :
                                                order.payment?.status === 'Unpaid' ? 'border-red-200 bg-red-50/20' : 'border-gray-200'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
                                                        {order.payment?.method || 'Method'}
                                                    </span>
                                                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                                        <button
                                                            onClick={() => handleVerifyPayment(order.id, 'Pending')}
                                                            className={`p-1.5 rounded-md transition-all ${order.payment?.status === 'Pending' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
                                                            title="Pending"
                                                        ><Clock size={14} /></button>
                                                        <button
                                                            onClick={() => handleVerifyPayment(order.id, 'Paid')}
                                                            className={`p-1.5 rounded-md transition-all ${order.payment?.status === 'Paid' ? 'bg-green-600 text-white' : 'text-gray-400'}`}
                                                            title="Paid"
                                                        ><CheckCircle size={14} /></button>
                                                        <button
                                                            onClick={() => handleVerifyPayment(order.id, 'Unpaid')}
                                                            className={`p-1.5 rounded-md transition-all ${order.payment?.status === 'Unpaid' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
                                                            title="Unpaid"
                                                        ><XCircle size={14} /></button>
                                                    </div>
                                                </div>
                                                {order.payment?.trxId && (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 mt-1">
                                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Trx ID</p>
                                                        <p className="text-xs font-mono font-black text-gray-800 truncate">{order.payment.trxId}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-6 hidden md:table-cell">
                                            <select
                                                value={order.orderStatus || 'Pending'}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className={`w-full text-sm font-black px-4 py-3 rounded-xl border-2 outline-none transition-all
                                                    ${order.orderStatus === 'Pending' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : ''}
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
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"
                                                    title="View"
                                                ><Eye size={16} /></button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                ><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
