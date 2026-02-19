'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingUp, PieChart, BarChart3 } from 'lucide-react';

export default function ChartsSection() {
    const [salesData, setSalesData] = useState<number[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                // Fetch last ~100 orders for healthy sample size
                const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
                const snapshot = await getDocs(q);
                const orders = snapshot.docs.map(doc => doc.data());

                // 1. Process Weekly Sales (Last 7 Days)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().split('T')[0];
                });

                const salesMap: Record<string, number> = {};
                last7Days.forEach(date => salesMap[date] = 0);

                orders.forEach(order => {
                    if (order.createdAt?.seconds) {
                        const date = new Date(order.createdAt.seconds * 1000).toISOString().split('T')[0];
                        if (salesMap[date] !== undefined) {
                            salesMap[date] += order.totals?.total || 0;
                        }
                    }
                });

                setSalesData(Object.values(salesMap));

                // 2. Process Order Status Distribution
                const statusCounts: Record<string, number> = {
                    'Delivered': 0,
                    'Processing': 0,
                    'Pending': 0,
                    'Cancelled': 0
                };

                orders.forEach(order => {
                    const status = order.orderStatus || 'Pending';
                    if (statusCounts[status] !== undefined) {
                        statusCounts[status]++;
                    } else {
                        // Group others into Pending or ignore? Let's just count
                        statusCounts['Pending']++;
                    }
                });

                const totalOrders = orders.length || 1;
                const formattedStatusData = [
                    { label: 'Delivered', count: statusCounts['Delivered'], color: '#10b981', percent: Math.round((statusCounts['Delivered'] / totalOrders) * 100) },
                    { label: 'Processing', count: statusCounts['Processing'], color: '#3b82f6', percent: Math.round((statusCounts['Processing'] / totalOrders) * 100) },
                    { label: 'Pending', count: statusCounts['Pending'], color: '#f59e0b', percent: Math.round((statusCounts['Pending'] / totalOrders) * 100) },
                    { label: 'Cancelled', count: statusCounts['Cancelled'], color: '#ef4444', percent: Math.round((statusCounts['Cancelled'] / totalOrders) * 100) },
                ];

                setStatusData(formattedStatusData);

            } catch (error) {
                console.error("Error fetching chart data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    if (loading) return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="bg-gray-100 h-64 rounded-3xl"></div>
            <div className="lg:col-span-2 bg-gray-100 h-64 rounded-3xl"></div>
        </div>
    );

    // Dynamic Conic Gradient for Pie Chart
    const pieGradient = `conic-gradient(
        ${statusData[0].color} 0% ${statusData[0].percent}%, 
        ${statusData[1].color} ${statusData[0].percent}% ${statusData[0].percent + statusData[1].percent}%, 
        ${statusData[2].color} ${statusData[0].percent + statusData[1].percent}% ${statusData[0].percent + statusData[1].percent + statusData[2].percent}%, 
        ${statusData[3].color} ${statusData[0].percent + statusData[1].percent + statusData[2].percent}% 100%
    )`;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Rotate days to match the last 7 days window (simple approximation: just show last 7 days labels)
    const today = new Date().getDay(); // 0-6
    const rotatedDays = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const maxSales = Math.max(...salesData, 1000);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status Pie Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
                <div className="absolute top-6 left-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <PieChart size={18} className="text-gray-400" /> Order Status
                    </h3>
                </div>
                <div className="mt-8 relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000"
                    style={{ background: pieGradient }}>
                    <div className="w-32 h-32 bg-white rounded-full shadow-inner flex items-center justify-center flex-col">
                        <span className="text-gray-900 font-black text-2xl">{statusData.reduce((a, b) => a + b.count, 0)}</span>
                        <span className="text-gray-400 font-bold text-[10px] uppercase">Total Orders</span>
                    </div>
                </div>
                <div className="w-full mt-6 grid grid-cols-2 gap-4 text-xs font-medium text-gray-500">
                    {statusData.map((status, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                            {status.label} ({status.percent}%)
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Sales Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 size={18} className="text-gray-400" /> Weekly Sales Breakdown
                    </h3>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Revenue (৳)</span>
                    </div>
                </div>

                <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2 h-[200px]">
                    {salesData.map((h, i) => {
                        const heightPercent = Math.max((h / maxSales) * 100, 5); // Min height 5%
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 w-full group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-8 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    ৳ {h.toLocaleString()}
                                </div>
                                <div className="w-full max-w-[40px] bg-gray-50 rounded-lg relative h-[200px] overflow-hidden">
                                    <div
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-lg transition-all duration-1000 group-hover:bg-blue-600"
                                        style={{ height: `${heightPercent}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-400">
                                    {rotatedDays[i]}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
