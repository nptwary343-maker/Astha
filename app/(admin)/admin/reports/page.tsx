'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { FileBarChart, Download, Calendar, TrendingUp } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ReportsPage() {
    const [yearlyStats, setYearlyStats] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all'); // 'all', '6m', '30d'
    const [rawOrders, setRawOrders] = useState<any[]>([]);

    // 1. Fetch Orders Once
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
                const snapshot = await getDocs(q);
                const orders = snapshot.docs.map(doc => doc.data());
                setRawOrders(orders);
            } catch (error) {
                console.error("Error fetching report data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // 2. Process Data when Orders or TimeRange changes
    useEffect(() => {
        try {
            if (rawOrders.length === 0) {
                setYearlyStats([]);
                setMonthlyData([]);
                setPredictions([]);
                return;
            }

            // Filter based on Time Range
            const now = new Date();
            let filteredOrders = rawOrders;
            const cutoffDate = new Date();

            switch (timeRange) {
                case '7d':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    cutoffDate.setDate(now.getDate() - 30);
                    break;
                case '3m':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case '6m':
                    cutoffDate.setMonth(now.getMonth() - 6);
                    break;
                case '1y':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
                case '2y':
                    cutoffDate.setFullYear(now.getFullYear() - 2);
                    break;
                default: // 'all'
                    cutoffDate.setFullYear(1970); // Effectively all time
                    break;
            }

            if (timeRange !== 'all') {
                filteredOrders = rawOrders.filter(o => {
                    try {
                        const d = o.date || o.createdAt;
                        if (!d) return false;
                        const orderDate = new Date(d);
                        return !isNaN(orderDate.getTime()) && orderDate >= cutoffDate;
                    } catch (e) {
                        return false;
                    }
                });
            }

            // --- Aggregation Logic ---
            const statsByYear: Record<string, { year: string, revenue: number, orders: number }> = {};
            const statsByTime: Record<string, { label: string, revenue: number }> = {};
            const isDaily = ['7d', '30d'].includes(timeRange);

            filteredOrders.forEach(data => {
                try {
                    const rawDate = data.date || data.createdAt;
                    if (!rawDate) return;

                    const date = new Date(rawDate);
                    if (isNaN(date.getTime())) return;

                    const year = date.getFullYear().toString();

                    if (!statsByYear[year]) statsByYear[year] = { year, revenue: 0, orders: 0 };
                    statsByYear[year].revenue += (data.totals?.total || 0);
                    statsByYear[year].orders += 1;

                    // Chart Data Aggregation
                    let timeKey, timeLabel;
                    if (isDaily) {
                        // Daily Grouping
                        timeKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                        timeLabel = date.getDate().toString(); // Just Day Number
                    } else {
                        // Monthly Grouping
                        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        timeLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                    }

                    if (!statsByTime[timeKey]) statsByTime[timeKey] = { label: timeLabel, revenue: 0 };
                    statsByTime[timeKey].revenue += (data.totals?.total || 0);
                } catch (err) {
                    console.warn("Skipping malformed order data:", data, err);
                }
            });

            // Update Yearly Stats State
            const sortedYearly = Object.values(statsByYear).sort((a, b) => parseInt(b.year) - parseInt(a.year));
            setYearlyStats(sortedYearly);

            // Update Chart Data State
            const sortedChartData = Object.keys(statsByTime).sort().map(key => statsByTime[key]);
            setMonthlyData(sortedChartData);

            // --- Predictions (Only for Monthly view, > 2 points) ---
            if (!isDaily && sortedChartData.length >= 2) {
                const lastMonth = sortedChartData[sortedChartData.length - 1];
                const growthRates = [];
                for (let i = 1; i < sortedChartData.length; i++) {
                    const prev = sortedChartData[i - 1].revenue || 1;
                    const curr = sortedChartData[i].revenue;
                    growthRates.push((curr - prev) / prev);
                }
                const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

                // Predict Next 3 Months
                const future = [];
                let lastRev = lastMonth.revenue;
                for (let i = 1; i <= 3; i++) {
                    lastRev = lastRev * (1 + avgGrowth);
                    future.push({
                        label: `Future +${i}`,
                        revenue: lastRev,
                        isPrediction: true
                    });
                }
                setPredictions(future);
            } else {
                setPredictions([]);
            }
        } catch (error) {
            console.error("Error processing report data:", error);
            // Optionally set error state here if we had one
        }

    }, [rawOrders, timeRange]);


    // Helper for Chart Scaling
    const allChartPoints = [...monthlyData, ...predictions];
    const maxRevenue = Math.max(...allChartPoints.map(d => d.revenue), 1000); // Avoid div/0
    const chartHeight = 300;
    const chartWidth = 1000;
    const padding = 40;

    // Y-Axis Scale
    const getY = (val: number) => chartHeight - padding - ((val / maxRevenue) * (chartHeight - (padding * 2)));
    // X-Axis Scale
    const getX = (idx: number) => padding + (idx * ((chartWidth - (padding * 2)) / (Math.max(allChartPoints.length - 1, 1))));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-500">Deep dive into your store's performance.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="3m">Last 3 Months</option>
                        <option value="6m">Last 6 Months</option>
                        <option value="1y">Last 1 Year</option>
                        <option value="2y">Last 2 Years</option>
                        <option value="all">All Time</option>
                    </select>
                    {/* Placeholder Export */}
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Generating reports...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {yearlyStats.length === 0 ? (
                        <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                            No sales data found to generate reports.
                        </div>
                    ) : (
                        yearlyStats.map((stat) => (
                            <div key={stat.year} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-3 hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileBarChart size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Sales Report {stat.year}</h3>
                                    <p className="text-xs text-gray-500">Generated automatically</p>
                                </div>
                                <div className="w-full pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs font-bold uppercase">Revenue</span>
                                        <span className="font-bold text-gray-900">৳{stat.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs font-bold uppercase">Orders</span>
                                        <span className="font-bold text-gray-900">{stat.orders}</span>
                                    </div>
                                </div>
                                <button className="text-blue-600 font-bold text-sm hover:underline mt-2">View Details</button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Advanced Analytics / Chart Section */}
            {!loading && monthlyData.length > 0 && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mt-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" /> Revenue Growth & Prediction
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Real-time monthly revenue history with AI-simulated future projections (Dashed Line).</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Actual Data</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Predicted</span>
                        </div>
                    </div>

                    <div className="relative w-full overflow-x-auto">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[800px] h-[300px]">
                            {/* Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                                <line
                                    key={t}
                                    x1={padding}
                                    y1={getY(maxRevenue * t)}
                                    x2={chartWidth - padding}
                                    y2={getY(maxRevenue * t)}
                                    stroke="#f3f4f6"
                                    strokeDasharray="4"
                                />
                            ))}

                            {/* Actual Data Line */}
                            <polyline
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3"
                                points={monthlyData.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' ')}
                            />

                            {/* Prediction Line (Connects last actual to predictions) */}
                            {predictions.length > 0 && (
                                <polyline
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="3"
                                    strokeDasharray="8 4"
                                    points={[
                                        // Start from last actual point
                                        [getX(monthlyData.length - 1), getY(monthlyData[monthlyData.length - 1].revenue)],
                                        ...predictions.map((d, i) => [getX(monthlyData.length + i), getY(d.revenue)])
                                    ].map(p => `${p[0]},${p[1]}`).join(' ')}
                                />
                            )}

                            {/* Data Points (Actual) */}
                            {monthlyData.map((d, i) => (
                                <g key={i} className="group">
                                    <circle cx={getX(i)} cy={getY(d.revenue)} r="5" fill="#2563eb" className="group-hover:r-7 transition-all" />
                                    {/* Tooltip on SVG Circle */}
                                    <title>Month: {d.label} &#10;Revenue: ৳{d.revenue.toLocaleString()}</title>
                                </g>
                            ))}

                            {/* Data Points (Prediction) */}
                            {predictions.map((d, i) => (
                                <g key={`pred-${i}`} className="group">
                                    <circle cx={getX(monthlyData.length + i)} cy={getY(d.revenue)} r="5" fill="#f97316" className="group-hover:r-7 transition-all" />
                                    <title>Forecast: {d.label} &#10;Predicted: ৳{Math.round(d.revenue).toLocaleString()}</title>
                                </g>
                            ))}

                            {/* X-Axis Labels */}
                            {allChartPoints.map((d, i) => (
                                <text key={`txt-${i}`} x={getX(i)} y={chartHeight - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.label}</text>
                            ))}
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
