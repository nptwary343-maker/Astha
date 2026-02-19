"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Wallet,
    Leaf,
    ShieldCheck,
    FileText,
    Clock,
    ArrowUpRight,
    Download,
    Eye,
    Settings as SettingsIcon,
    ChevronRight,
    Globe,
    Upload
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Mock Data for Investor
const performanceData = [
    { name: 'Mon', profit: 400 },
    { name: 'Tue', profit: 600 },
    { name: 'Wed', profit: 500 },
    { name: 'Thu', profit: 900 },
    { name: 'Fri', profit: 1100 },
    { name: 'Sat', profit: 1500 },
    { name: 'Sun', profit: 1800 },
];

interface Deed {
    id: string;
    date: string;
    type: string;
}

export default function InvestorDashboard() {
    const [activeTab, setActiveTab] = useState('Overview');
    const [selectedDeed, setSelectedDeed] = useState<Deed | null>(null);

    useEffect(() => {
        document.title = 'Investor Dashboard | E-Farming Partnership';
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
            {/* Sidebar - Mobile Friendly Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:w-20 bg-black/50 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/5 z-50 flex md:flex-col items-center justify-around md:justify-center p-4 gap-8">
                {[
                    { icon: TrendingUp, label: 'Overview' },
                    { icon: Wallet, label: 'Invest' },
                    { icon: FileText, label: 'Deeds' },
                    { icon: Leaf, label: 'Impact' },
                    { icon: SettingsIcon, label: 'Settings' }
                ].map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setActiveTab(item.label)}
                        className={`flex flex-col items-center gap-1 group transition-all ${activeTab === item.label ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        <item.icon size={24} className={`${activeTab === item.label ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                        <span className="text-[10px] font-black uppercase tracking-widest md:hidden">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Main Content */}
            <main className="md:ml-20 p-6 md:p-12 pb-32">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Welcome Back, Rahman</h1>
                        <p className="text-gray-400 mt-2 font-medium">Your investments are powering 12 local farms.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">ID Status</p>
                            <p className="font-bold text-sm">Verified Investor</p>
                        </div>
                    </div>
                </header>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-black shadow-2xl shadow-emerald-500/20">
                        <p className="text-sm font-black uppercase tracking-widest opacity-70">Total Portfolio</p>
                        <h2 className="text-4xl font-black mt-2">৳ 125,400</h2>
                        <div className="mt-6 flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full w-fit">
                            <TrendingUp size={16} />
                            <span className="text-xs font-black">+14.2% Earned</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Next Payout</p>
                        <h2 className="text-4xl font-black mt-2">৳ 8,240</h2>
                        <p className="text-xs text-emerald-400 font-bold mt-4 flex items-center gap-2">
                            <Clock size={14} /> Scheduled for June 15
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-sm font-black uppercase tracking-widest text-gray-400">Impact Score</p>
                            <h2 className="text-4xl font-black mt-2">A+</h2>
                            <p className="text-xs text-gray-500 font-medium mt-4">Top 5% Eco-Investor this month</p>
                        </div>
                        <Leaf size={100} className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invest Tab Content */}
                    {activeTab === 'Invest' && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-black tracking-tight mb-8">Add Investment</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Methods */}
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                        <h3 className="font-bold mb-4 flex items-center gap-2"><Wallet size={18} className="text-emerald-400" /> Local (BD Citizen)</h3>
                                        <p className="text-xs text-gray-400 mb-4">Send money to our official numbers and provide TRXID.</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>bKash (Merchant):</span> <span className="font-bold">017XXXXXXXX</span></div>
                                            <div className="flex justify-between"><span>Nagad (Personal):</span> <span className="font-bold">019XXXXXXXX</span></div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                                        <h3 className="font-bold mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-400" /> International (Offshore Account)</h3>
                                        <p className="text-xs text-gray-400 mb-4">Foreign investors: Send USD/EUR directly to our offshore account via Wise or Bank Wire.</p>
                                        <div className="space-y-4 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                                <p className="text-blue-400 mb-1">Global Bank Transfer (USD/EUR)</p>
                                                <p>Payoneer/Wise Recipient: E-Farming Partnership</p>
                                                <p>A/C (IBAN): XXXXXXXXXXXXXXXXXXXX</p>
                                                <p>BIC/SWIFT: XXXXXXXX</p>
                                            </div>
                                            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                                <p className="text-blue-400 mb-1">Direct Transfer (Wise App)</p>
                                                <p>Recipient: payments@efarming.com</p>
                                                <p>Note: Include your Investor ID in the reference.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Form */}
                                <div className="bg-black/40 p-8 rounded-3xl border border-white/5 h-fit">
                                    <h3 className="font-bold mb-6">Submit Proof of Payment</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Amount (BDT Equivalent)</label>
                                            <input type="number" placeholder="e.g. 50000" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Transaction ID / Reference No.</label>
                                            <input type="text" placeholder="TRXID or Wire Ref" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Upload Voucher/Screenshot (Optional)</label>
                                            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer group">
                                                <Upload className="mx-auto text-gray-500 group-hover:text-emerald-400 mb-2" size={20} />
                                                <span className="text-[10px] font-black text-gray-500">Pick File</span>
                                            </div>
                                        </div>
                                        <button className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                                            Submit for Verification
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Overview' && (
                        <>
                            <h2 className="text-xl font-black tracking-tight mb-6">Earnings Overview</h2>
                            {/* Existing performance chart logic would go here if encapsulated */}
                        </>
                    )}

                    {/* Legal Vault Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md border-t-emerald-500/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-emerald-400" /> Deed Vault
                                </h2>
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                    3
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Your legally binding 300 TK judicial stamp certificates are stored here.</p>

                            <div className="space-y-3">
                                {[
                                    { id: "SEC-7721-AH", date: "Feb 12", type: "Agricultural" },
                                    { id: "SEC-8890-AH", date: "Jan 05", type: "Dairy" },
                                    { id: "SEC-4412-AH", date: "Dec 20", type: "Carbon" }
                                ].map((deed, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedDeed(deed)}
                                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-mono text-emerald-400">{deed.id}</span>
                                            <Download size={14} className="text-gray-600 group-hover:text-emerald-400" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs">{deed.type}</span>
                                            <span className="text-[10px] text-gray-500">{deed.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all">
                                Request Physical Copy
                            </button>
                        </div>

                        {/* Project Updates (Impact Feed) */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <h2 className="text-xl font-black tracking-tight mb-6">Live Feed</h2>
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l border-white/10 pb-6">
                                    <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-emerald-400"></div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Today, 10:24 AM</p>
                                    <h4 className="text-xs font-bold mt-1">Vaccination Complete</h4>
                                    <p className="text-[10px] text-gray-400 mt-1">Savar Dairy Unit #B has completed its monthly health check.</p>
                                </div>
                                <div className="relative pl-6 border-l border-white/10">
                                    <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-blue-400"></div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Yesterday</p>
                                    <h4 className="text-xs font-bold mt-1">New Saplings Planted</h4>
                                    <p className="text-[10px] text-gray-400 mt-1">1,200 mangrove trees planted in Sundarbans project.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Deed Modal (Preview) */}
            {selectedDeed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedDeed(null)}></div>
                    <div className="relative bg-[#111] border border-white/10 rounded-[2rem] max-w-lg w-full p-8 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Legal Deed Preview</h2>
                            <button onClick={() => setSelectedDeed(null)} className="text-gray-500 hover:text-white">
                                <Eye size={24} />
                            </button>
                        </div>

                        <div className="aspect-[3/4] bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center p-12 relative">
                            <ShieldCheck size={80} className="text-emerald-500/20 mb-6" />
                            <p className="text-lg font-bold text-gray-300">Digital Copy of 300 TK Judicial Stamp</p>
                            <p className="text-xs text-gray-500 mt-2">Serial: {selectedDeed.id}</p>
                            <p className="text-[10px] font-mono text-emerald-500 mt-8 break-all opacity-40">HASH: 8f2a7b1c9d0e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a</p>
                            <div className="absolute bottom-8 left-8 right-8 py-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Government Linked</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Verified</span>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button className="flex-1 bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all">
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
