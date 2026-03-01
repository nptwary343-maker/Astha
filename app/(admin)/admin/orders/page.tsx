'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Eye, Filter, Search, Download, DollarSign, Package, CheckCircle, Clock, PlusCircle, XCircle, Trash2, AlertTriangle, Mail, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { updateOrderStatusAction } from '@/actions/order-management';


const OrderDetailsModal = ({ order, onStatusUpdate, onPaymentUpdate, onClose }: {
    order: Order,
    onStatusUpdate: (id: string, s: string) => void,
    onPaymentUpdate: (id: string, s: string) => void,
    onClose: () => void
}) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in transition-all">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Package className="text-blue-600" size={22} /> Order Summary
                        </h3>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">#{order.invoiceNumber || order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all group">
                        <XCircle size={22} className="text-gray-400 group-hover:text-red-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">

                    {/* Status Management Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div className="flex-1 w-full">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Change Delivery Status</p>
                            <select
                                value={order.orderStatus || 'Pending'}
                                onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                                className={`w-full text-sm font-black px-4 py-3 rounded-xl border-2 outline-none transition-all cursor-pointer shadow-sm
                                    ${order.orderStatus === 'Pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : ''}
                                    ${order.orderStatus === 'Processing' ? 'bg-blue-600 border-blue-600 text-white' : ''}
                                    ${order.orderStatus === 'Shipped' ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                                    ${order.orderStatus === 'Delivered' ? 'bg-emerald-600 border-emerald-600 text-white' : ''}
                                    ${order.orderStatus === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-600' : ''}
                                `}
                            >
                                <option value="Pending">🕒 Pending Review</option>
                                <option value="Processing">📦 Processing / Packing</option>
                                <option value="Shipped">🚚 Handed to Courier</option>
                                <option value="Delivered">✅ Delivered Successfully</option>
                                <option value="Cancelled">❌ Order Cancelled</option>
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Change Payment Status</p>
                            <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-emerald-100">
                                {['Pending', 'Paid', 'Unpaid'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => onPaymentUpdate(order.id, s)}
                                        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all
                                            ${order.payment?.status === s
                                                ? (s === 'Paid' ? 'bg-emerald-600 text-white shadow-lg' : s === 'Unpaid' ? 'bg-red-600 text-white shadow-lg' : 'bg-orange-500 text-white shadow-lg')
                                                : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        {s === 'Pending' ? <Clock size={14} className="mb-0.5" /> : s === 'Paid' ? <CheckCircle size={14} className="mb-0.5" /> : <XCircle size={14} className="mb-0.5" />}
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Details</p>
                            <p className="font-black text-gray-900 text-base">{order.customer?.name}</p>
                            <p className="text-blue-600 font-bold text-sm mt-1">{order.customer?.phone}</p>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-gray-600 text-xs truncate">{order.userEmail || "anonymous@guest.com"}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Location</p>
                            <div className="flex gap-3">
                                <MapPin size={20} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-gray-700 text-sm leading-relaxed font-medium">{order.customer?.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Internal Manifest</p>
                        <div className="space-y-4">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-5 p-3 rounded-2xl border border-dashed border-gray-200 hover:border-blue-300 transition-colors bg-white/50">
                                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-50">
                                        <Package size={24} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900 text-sm">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase tracking-widest">Qty: {item.quantity}</span>
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md uppercase tracking-widest">৳{(item.price || item.unitPrice).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-base tracking-tighter">৳{((item.price || item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Trx Visualization (if exists) */}
                    {order.payment?.trxId && (
                        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border-2 border-emerald-100 shadow-sm animate-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">Payment Transaction ID</p>
                                        <p className="text-lg font-black text-gray-900 tracking-tight font-mono">{order.payment.trxId}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                    {order.payment.method || 'Online'}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 italic">Please cross-verify this ID with your merchant panel (bKash/Nagad) before shipping.</p>
                        </div>
                    )}
                </div>

                {/* Footer Summary - Aggressive Design */}
                <div className="bg-slate-900 px-8 py-6 text-white">
                    <div className="grid grid-cols-2 gap-y-2 text-xs font-bold text-slate-400">
                        <span>Base Subtotal</span>
                        <span className="text-right text-white">৳{Number(order.totals?.subtotal ?? 0).toLocaleString()}</span>

                        <span>Delivery & Logistics</span>
                        <span className="text-right text-emerald-400">+৳{Number(order.totals?.shipping ?? 0).toLocaleString()}</span>

                        <span>Rewards & Coupons</span>
                        <span className="text-right text-rose-400">-৳{Number(order.totals?.discount ?? (order.totals?.couponDiscount || 0)).toLocaleString()}</span>

                        <div className="col-span-2 my-2 h-[1px] bg-slate-800" />

                        <span className="text-base text-white uppercase tracking-widest">Payable Total</span>
                        <span className="text-right text-2xl text-emerald-400 font-extrabold tracking-tighter">৳{Number(order.totals?.total ?? 0).toLocaleString()}</span>
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
                o.id === orderId ? { ...o, payment: { ...o.payment!, status: newStatus as any, isVerified } } : o
            ));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, payment: { ...prev.payment!, status: newStatus as any, isVerified } } : null);
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            alert("Failed to update payment status.");
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            // Update via Server Action (Handles both 'status' and 'orderStatus' fields)
            const result = await updateOrderStatusAction(orderId, newStatus);

            if (!result.success) {
                throw new Error("Action failed");
            }

            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, orderStatus: newStatus, status: newStatus } : o
            ));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus, status: newStatus } : null);
            }
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
                <OrderDetailsModal
                    order={selectedOrder}
                    onStatusUpdate={handleUpdateStatus}
                    onPaymentUpdate={handleVerifyPayment}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
