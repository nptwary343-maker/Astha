"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, getCountFromServer, orderBy, limit } from 'firebase/firestore';
import {
    TrendingUp,
    Users,
    Leaf,
    FileText,
    Settings,
    Plus,
    Search,
    ChevronRight,
    PieChart as PieChartIcon,
    Activity
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

// Mock Data for the "Stock Market" style charts
const investmentData = [
    { name: 'Jan', value: 4000, carbon: 200 },
    { name: 'Feb', value: 3000, carbon: 400 },
    { name: 'Mar', value: 2000, carbon: 300 },
    { name: 'Apr', value: 2780, carbon: 600 },
    { name: 'May', value: 1890, carbon: 800 },
    { name: 'Jun', value: 2390, carbon: 1000 },
    { name: 'Jul', value: 3490, carbon: 1200 },
];

interface Project {
    title: string;
    amount: string;
    progress: number;
    status: string;
    category: string;
}

export default function AmraFundAdmin() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [stats, setStats] = useState({
        totalRaised: 0,
        activeInvestors: 0,
        astharOrders: 0, // Integration Stat
        pendingDeeds: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. AmraFund Stats
                const investSnap = await getDocs(collection(db, 'amrafund_investments'));
                const total = investSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);

                // 2. Asthar Hat Integration (Cross-Project Data)
                const ordersCountSnap = await getCountFromServer(collection(db, 'orders'));

                // 3. Unique Investors
                const uniqueInvestors = new Set(investSnap.docs.map(doc => doc.data().investorId)).size || investSnap.docs.length;

                setStats({
                    totalRaised: total,
                    activeInvestors: uniqueInvestors,
                    astharOrders: ordersCountSnap.data().count,
                    pendingDeeds: investSnap.docs.filter(d => d.data().status === 'Pending Verification').length
                });
            } catch (e) {
                console.error("Stats fetch error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
            {/* Top Navigation */}
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            AF
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-emerald-400">E-Farming Partnership</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <Search size={20} className="text-gray-400" />
                        </button>
                        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
                            <Plus size={18} />
                            New Project
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Fund Raised', value: `৳ ${(stats.totalRaised / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-emerald-400' },
                        { label: 'Active Investors', value: stats.activeInvestors.toLocaleString(), icon: Users, color: 'text-blue-400' },
                        { label: 'Asthar Hat Orders', value: stats.astharOrders.toLocaleString(), icon: Activity, color: 'text-purple-400' }, // Integration Point
                        { label: 'Pending Deeds', value: stats.pendingDeeds.toString(), icon: FileText, color: 'text-orange-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
                                    <Activity size={12} /> +12%
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">Investment Growth</h2>
                                    <p className="text-sm text-gray-400">Monthly overview of total capital raised</p>
                                </div>
                                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer">
                                    <option>Last 7 Months</option>
                                    <option>Yearly</option>
                                </select>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={investmentData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#ffffff30"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#ffffff30"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pending KYC Approval Section */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black tracking-tight">Manual KYC Approval</h2>
                                <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-md font-black">2 PENDING</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: 'Rahman Khan', id: '1234567890', type: 'BD Citizen', status: 'NID' },
                                    { name: 'John Doe', id: 'GL-987654321', type: 'Foreigner', status: 'Global ID' },
                                ].map((user, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${user.type === 'Foreigner' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold">{user.name}</h4>
                                                <p className="text-[10px] text-gray-500">{user.type} | {user.status}: {user.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-400/10 px-3 py-1.5 rounded-lg transition-all">Approve</button>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all">Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Project List */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black tracking-tight">Active Projects</h2>
                                <button className="text-sm font-bold text-emerald-400 hover:underline">View All</button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { title: 'Project Green Cow', amount: '৳ 500k', progress: 75, status: 'Active', category: 'Agri' },
                                    { title: 'Mangrove Carbon', amount: '৳ 1.2M', progress: 40, status: 'Open', category: 'Carbon' },
                                    { title: 'Choto Khamar Setup', amount: '৳ 300k', progress: 95, status: 'Active', category: 'SME' },
                                ].map((project, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedProject(project)}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-gray-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                                {project.category[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm tracking-tight">{project.title}</h4>
                                                <p className="text-xs text-gray-500 uppercase font-black mt-0.5">{project.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{project.amount}</p>
                                            <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Investors & Market */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <h2 className="text-xl font-black tracking-tight mb-6">Market Trends</h2>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={investmentData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                        <XAxis dataKey="name" hide />
                                        <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                                        <Bar dataKey="carbon" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-400">Current Carbon Price</span>
                                    <span className="font-bold text-emerald-400">$24.50</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Est. Annual Growth</span>
                                    <span className="font-bold text-blue-400">+14.2%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-8 text-black shadow-2xl shadow-emerald-500/20">
                            <Activity size={32} className="mb-4" />
                            <h2 className="text-2xl font-black tracking-tight">Asthar Hat Sync</h2>
                            <p className="text-sm font-medium opacity-80 mt-2">
                                Shared Intelligence: {stats.astharOrders} orders processed in the main store.
                            </p>
                            <div className="mt-6 flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl border border-black/5 w-fit">
                                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-widest">Bridged Mode</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <Settings size={32} className="mb-4 text-emerald-400" />
                            <h2 className="text-2xl font-black tracking-tight">System Status</h2>
                            <p className="text-sm font-medium opacity-80 mt-2">All nodes are operational. Legal vault is synced.</p>
                            <div className="mt-6 flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl border border-black/5 w-fit">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Security</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Sidebar (Drawer) */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProject(null)}></div>
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full p-8 shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Project Details</h2>
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Project Name</label>
                                <input
                                    type="text"
                                    defaultValue={selectedProject.title}
                                    className="w-full bg-transparent text-lg font-bold focus:outline-none focus:text-emerald-400 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Target</label>
                                    <p className="text-xl font-black">{selectedProject.amount}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Status</label>
                                    <span className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-md uppercase">
                                        {selectedProject.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <FileText size={16} /> Deed Records
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                                        <span className="text-gray-400">Stamp Serial</span>
                                        <span className="font-mono text-emerald-400">AH-ST-7721</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-2">
                                        <span className="text-gray-400">Status</span>
                                        <span className="text-emerald-500 font-bold">Verified</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all transform active:scale-95 mt-8">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
