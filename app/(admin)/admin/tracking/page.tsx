'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Search, Package, MapPin, Calendar, Clock, CheckCircle, Truck, AlertCircle, Trash2, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/admin/LeafletMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">Loading Map...</div>
});

export default function AdminTrackingPage() {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const docRef = doc(db, 'orders', orderId.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
            } else {
                setError('Order not found. Please check the Order ID.');
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to fetch order details.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!order) return;
        setUpdating(true);
        try {
            const docRef = doc(db, 'orders', order.id);
            await updateDoc(docRef, { orderStatus: newStatus });
            setOrder({ ...order, orderStatus: newStatus });
            alert(`Order status updated to: ${newStatus}`);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Search className="text-blue-600" /> Track & Manage Order
            </h1>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Order ID (e.g., 8H7G6F...)"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? 'Searching...' : <><Search size={18} /> Search</>}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>

            {/* Order Details */}
            {order && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Order ID</p>
                            <p className="font-mono font-bold text-gray-900 text-lg">#{order.id}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border uppercase tracking-wide ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus || 'Unknown'}
                        </div>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-8">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400" /> Customer Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500 w-24 inline-block">Name:</span> <span className="font-medium text-gray-900">{order.customer?.name || order.customer_name}</span></p>
                                <p><span className="text-gray-500 w-24 inline-block">Phone:</span> <span className="font-medium text-gray-900">{order.customer?.phone || order.customer_phone}</span></p>
                                <p><span className="text-gray-500 w-24 inline-block">Address:</span> <span className="font-medium text-gray-900">{order.customer?.address || order.delivery_address}</span></p>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <Package size={18} className="text-gray-400" /> Order Info
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500 w-24 inline-block">Total:</span> <span className="font-bold text-green-600">৳{(order.totals?.total || 0).toLocaleString()}</span></p>
                                <p><span className="text-gray-500 w-24 inline-block">Date:</span> <span className="text-gray-900">
                                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() :
                                        order.created_at?.toDate ? order.created_at.toDate().toLocaleDateString() : 'N/A'}
                                </span></p>
                                <p><span className="text-gray-500 w-24 inline-block">Payment:</span> <span className="uppercase font-semibold text-gray-700">{order.payment?.method || 'CASH'}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* 📍 Location Verification Section (Leaflet Map) */}
                    {(order.security_meta?.ip_lat || order.security_meta?.gps_verification?.lat) && (
                        <div className="px-6 pb-6">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                                <Truck size={18} className="text-blue-600" /> Location Verification (Admin Only)
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left: What they claimed */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">User Declared Address</p>
                                    <p className="text-sm font-medium text-gray-800 italic">
                                        "{order.customer?.address || order.delivery_address}"
                                    </p>
                                </div>

                                {/* Right: What we detected (Map) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detected Network Location (IP)</p>
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                            {order.security_meta?.ip_derived_address || "Unknown Region"}
                                        </span>
                                    </div>

                                    {/* Map Container */}
                                    <div className="h-[250px] w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative z-0">
                                        <LeafletMap
                                            lat={order.security_meta?.ip_lat || order.security_meta?.gps_verification?.lat || 23.8103}
                                            lng={order.security_meta?.ip_lng || order.security_meta?.gps_verification?.lng || 90.4125}
                                            popupText={`Detected: ${order.security_meta?.ip_derived_address || "Unknown"}`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center">
                                        * Note: IP Location is approximate (City Level). GPS is precise.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions (Update Status) */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Order Status</p>
                        <div className="flex flex-wrap gap-2">
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => updateStatus(status)}
                                    disabled={updating || order.orderStatus === status}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${order.orderStatus === status
                                        ? 'bg-gray-800 text-white cursor-default'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================================
                🆕 LIVE FEED SECTION: Real-Time Orders
               ===================================================================================== */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                📡 Live Orders Feed
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500">Real-time incoming orders and status updates.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Refresh Data"
                    >
                        <Clock size={18} />
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <RecentOrdersFeed onSelectOrder={(order) => {
                        setOrderId(order.id);
                        setOrder(order);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} />
                </div>
            </div>
        </div>
    );
}

// Sub-component for the recent orders list
function RecentOrdersFeed({ onSelectOrder }: { onSelectOrder: (order: any) => void }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(20));
                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(fetched);
            } catch (err) {
                console.error("Error loading feed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Loading live feed...</div>;
    if (orders.length === 0) return <div className="p-8 text-center text-gray-400">No recent orders found.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 border-b border-gray-100">Customer & Location</th>
                        <th className="px-6 py-4 border-b border-gray-100">Order Ref</th>
                        <th className="px-6 py-4 border-b border-gray-100">Amount</th>
                        <th className="px-6 py-4 border-b border-gray-100">Status</th>
                        <th className="px-6 py-4 border-b border-gray-100 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 text-gray-500 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all mt-1">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{order.customer?.name || order.customer_name || 'Guest'}</p>
                                        <p className="text-xs text-gray-500 max-w-[200px] truncate">
                                            {order.customer?.address || order.delivery_address || 'No address provided'}
                                        </p>
                                        {/* IP/GPS Indicator */}
                                        {(order.security_meta?.ip_lat || order.security_meta?.gps_verification) && (
                                            <div className="mt-1 flex items-center gap-1">
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                                                    Location Verified
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-mono text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    #{order.invoiceNumber || order.id.substring(0, 8)}
                                </span>
                                <div className="text-[10px] text-gray-400 mt-1">
                                    {order.createdAt?.seconds
                                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                                        : 'Just now'}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-bold text-gray-900">৳{(order.totals?.total || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                                            order.orderStatus === 'Shipped' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    }`}>
                                    {order.orderStatus || 'Pending'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onSelectOrder(order)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline"
                                >
                                    View Full Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
