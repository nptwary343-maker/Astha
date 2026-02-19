'use client';

import Link from 'next/link';
import { ShoppingBag, TrendingUp, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

export default function StatsGrid() {
    const [stats, setStats] = useState({
        totalSales: 0,
        activeOrders: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'orders'));
                const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];

                const totalRevenue = orders.reduce((acc, order) => acc + (order.totals?.total || 0), 0);
                const activeOrders = orders.filter((order) => order.payment?.status !== 'Paid').length;

                setStats({
                    totalSales: orders.length,
                    activeOrders,
                    totalRevenue
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Sales Card */}
            <Link href="/admin/orders" className="block">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[180px] relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
                        <ShoppingBag size={120} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 font-medium mb-1">Total Orders</h3>
                        <div className="bg-green-100 w-fit px-2 py-1 rounded-md text-green-700 text-xs font-bold flex items-center gap-1">
                            <TrendingUp size={12} /> Live
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-4xl font-extrabold text-gray-900">{stats.totalSales}</h2>
                        <p className="text-sm text-gray-400 mt-2">Lifetime Orders</p>
                    </div>
                </div>
            </Link>

            {/* Active Orders Card */}
            <Link href="/admin/orders" className="block">
                <div className="bg-blue-50 p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col justify-between h-[180px] relative overflow-hidden cursor-pointer hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-blue-900/60 font-medium mb-1">Active / Start</h3>
                            <div className="bg-white/60 w-fit px-2 py-0.5 rounded-md text-blue-700 text-xs font-bold flex items-center gap-1">
                                <MoreVertical size={12} /> Pending
                            </div>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <ShoppingBag size={20} className="text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold text-blue-900">{stats.activeOrders}</h2>
                        <p className="text-sm text-blue-900/50 mt-2">Unpaid or In-progress</p>
                    </div>
                </div>
            </Link>

            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-6 rounded-3xl shadow-lg shadow-orange-200 text-white flex flex-col justify-between h-[180px] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-white/80 font-medium mb-1">Revenue</h3>
                    </div>
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                </div>
                <div className="mt-4">
                    <h2 className="text-3xl font-extrabold">৳ {stats.totalRevenue.toLocaleString()}</h2>
                    <p className="text-xs text-white/70 mt-2">Total gross income</p>
                </div>
            </div>
        </div>
    );
}
