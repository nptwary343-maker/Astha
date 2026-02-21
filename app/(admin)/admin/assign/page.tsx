'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, MapPin, Package, Plus, Search, Truck, CheckCircle, Smartphone, Trash2, FilePlus } from 'lucide-react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, DeliveryMan } from '@/types';

export default function AssignDeliveryPage() {
    const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newManName, setNewManName] = useState('');
    const [newManPhone, setNewManPhone] = useState('');
    const [isAddMode, setIsAddMode] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Delivery Men
    useEffect(() => {
        const q = query(collection(db, 'delivery_men'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const men = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DeliveryMan[];
            setDeliveryMen(men);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Orders
    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(ordersData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Assign Delivery Man (Update Order)
    const handleAssign = async (orderId: string, manId: string) => {
        if (!manId) return;
        const selectedMan = deliveryMen.find(m => m.id === manId);
        if (!selectedMan) return;

        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                assignedTo: manId,
                assignedManName: selectedMan.name,
                assignedManPhone: selectedMan.phone,
                status: 'Assigned'
            });

            // Optional: Update delivery man's active count
        } catch (error) {
            console.error("Error assigning order:", error);
            alert("Failed to assign order.");
        }
    };

    const handleAddDeliveryMan = async () => {
        if (!newManName || !newManPhone) return;

        try {
            await addDoc(collection(db, 'delivery_men'), {
                name: newManName,
                phone: newManPhone,
                status: 'Available',
                activeOrders: 0,
                createdAt: new Date().toISOString()
            });
            setNewManName('');
            setNewManPhone('');
            setIsAddMode(false);
        } catch (error) {
            console.error("Error adding delivery man:", error);
            alert("Failed to add delivery man.");
        }
    };

    const handleDeleteDeliveryMan = async (id: string) => {
        if (confirm('Are you sure you want to delete this delivery man?')) {
            try {
                await deleteDoc(doc(db, 'delivery_men', id));
            } catch (error) {
                console.error("Error deleting delivery man:", error);
                alert("Failed to delete delivery man.");
            }
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (confirm('Are you sure you want to delete this order?')) {
            try {
                await deleteDoc(doc(db, 'orders', id));
            } catch (error) {
                console.error("Error deleting order:", error);
                alert("Failed to delete order.");
            }
        }
    };

    // Filter orders based on search
    const filteredOrders = orders.filter(order =>
        (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                    <p className="text-gray-500">Manage delivery team and assign home deliveries.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/manual-orders">
                        <button className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
                            <FilePlus size={18} /> New Manual Order
                        </button>
                    </Link>
                    <button
                        onClick={() => setIsAddMode(!isAddMode)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
                    >
                        <Plus size={18} /> Add Delivery Man
                    </button>
                </div>
            </div>

            {/* Add Delivery Man Form */}
            {isAddMode && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={newManName}
                            onChange={(e) => setNewManName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Rahim Khan"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={newManPhone}
                            onChange={(e) => setNewManPhone(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 017..."
                        />
                    </div>
                    <button
                        onClick={handleAddDeliveryMan}
                        className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold"
                    >
                        Save
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Delivery Men List */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Truck size={18} className="text-blue-500" /> Delivery Team
                            </h2>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold">
                                {deliveryMen.length} Active
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-400 text-sm">Loading team...</div>
                            ) : deliveryMen.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">No delivery men found.</div>
                            ) : (
                                deliveryMen.map((man, index) => (
                                    <div key={man.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{man.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Smartphone size={10} /> {man.phone}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                ${man.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {man.status}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteDeliveryMan(man.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                title="Delete Delivery Man"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Assignment List */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={18} className="text-orange-500" /> All Orders
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search Customer or Area..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Customer & Items</th>
                                        <th className="px-6 py-4">Delivery Area</th>
                                        <th className="px-6 py-4">Assign Man</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredOrders.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-8 text-gray-400">No orders found.</td></tr>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const assignedMan = deliveryMen.find(m => m.id === order.assignedTo);
                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                                        #{order.id}
                                                    </td>
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
                                                    <td className="px-6 py-4">
                                                        {order.assignedTo ? (
                                                            <span className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md w-fit">
                                                                <CheckCircle size={12} /> Assigned
                                                            </span>
                                                        ) : (
                                                            <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded-md w-fit">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-900">{order.customer?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                            {order.items?.length} Items | ৳{order.totals?.total}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-1 text-gray-600">
                                                            <MapPin size={14} className="mt-0.5 text-red-500 shrink-0" />
                                                            <span className="font-medium max-w-[120px] truncate" title={order.customer?.address}>
                                                                {order.customer?.address || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                className={`w-full max-w-[140px] px-2 py-1.5 rounded border border-gray-200 font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none
                                                                    ${order.assignedTo ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white'}`}
                                                                onChange={(e) => handleAssign(order.id, e.target.value)}
                                                                value={order.assignedTo || ""}
                                                            >
                                                                <option value="" disabled>Select Man</option>
                                                                {deliveryMen.map(man => (
                                                                    <option key={man.id} value={man.id}>
                                                                        {man.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteOrder(order.id)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
