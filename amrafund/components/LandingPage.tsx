"use client";

import React from 'react';
import {
    ArrowRight,
    ShieldCheck,
    Eye,
    TrendingUp,
    Leaf,
    Users,
    ArrowUpRight,
    ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import InvestmentModal from './InvestmentModal';

export default function AmraFundLanding() {
    const [selectedProject, setSelectedProject] = React.useState<any>(null);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Abstract Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center font-black text-black">
                            AF
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">AmraFund</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Projects', 'Security', 'Impact', 'About'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/amrafund/admin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Admin Login</Link>
                        <button className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm hover:bg-emerald-400 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                            Start Investing
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Legal & Secure Platform</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
                            E-FARMING <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">PARTNERSHIP</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-lg leading-relaxed mb-10">
                            Invest in high-impact agricultural and carbon projects in Bangladesh.
                            Protected by 300 TK Judicial Stamps. 100% Transparent.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 group">
                                Browse Projects
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="border border-white/20 hover:border-white px-8 py-4 rounded-2xl font-black text-lg backdrop-blur-sm transition-all">
                                How it Works
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 flex items-center gap-8 grayscale opacity-50">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Compliant with</span>
                                <span className="font-bold text-sm">Contract Act 1872</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Powered by</span>
                                <span className="font-bold text-sm">Asthar Hat</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                            <Image
                                src="/amrafund_hero_bg.png"
                                alt="E-Farming Partnership Agriculture"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                            {/* Floating Cards */}
                            <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-black text-sm">Project Green Cow #22</h4>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Rajshahi Farm</p>
                                    </div>
                                    <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-black">
                                        85% Funded
                                    </div>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%]"></div>
                                </div>
                            </div>

                            <div className="absolute top-8 right-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Expectd Returns</p>
                                    <p className="font-bold text-lg leading-tight">+18% Yearly</p>
                                </div>
                            </div>
                        </div>

                        {/* Abstract glow */}
                        <div className="absolute -z-10 bg-emerald-500/40 w-full h-full blur-[100px] rounded-full top-0 scale-75"></div>
                    </div>
                </div>
            </section>

            {/* Why AmraFund? (Legal & Impact) */}
            <section id="security" className="py-24 px-6 border-y border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Why Trust E-Farming Partnership?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We've replaced uncertainty with legal frameworks and real-time data.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Legal Security",
                                desc: "Every investment is backed by a 300 TK Judicial Stamp agreement, enforceable by Bangladesh law.",
                                icon: ShieldCheck,
                                color: "emerald"
                            },
                            {
                                title: "Zero MLM",
                                desc: "We don't do referrals or hidden chains. It's direct project partnership based on real assets.",
                                icon: Eye,
                                color: "blue"
                            },
                            {
                                title: "Farm to Dashboard",
                                desc: "See your cows, crops, or trees growing through live updates, photos, and satellite data.",
                                icon: TrendingUp,
                                color: "teal"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-black/40 border border-white/5 rounded-[2.5rem] p-10 hover:border-emerald-500/30 transition-all group">
                                <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-8`}>
                                    <feature.icon size={32} className={`text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight mb-4">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sector Categories */}
            <section id="projects" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Invest in Local Sectors</h2>
                            <p className="text-gray-400 max-w-xl">Choose from audited projects that match your goals and risk profile.</p>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-all group">
                            Explore All Categories <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Smart Dairy Farming", sector: "Agri", roi: "15-20%", tenure: "1 Year", img: "https://images.unsplash.com/photo-1594142461625-ce6302568601?q=80&w=2070&auto=format&fit=crop" },
                            { title: "Mangrove Reforestation", sector: "Carbon", roi: "12% + Credits", tenure: "5 Years", img: "https://images.unsplash.com/photo-1544339300-244da719c6ef?q=80&w=2070&auto=format&fit=crop" },
                            { title: "Roof-top Veggie Grid", sector: "SME", roi: "25%", tenure: "6 Months", img: "https://images.unsplash.com/photo-1591857177580-dc32d7ab23c4?q=80&w=2071&auto=format&fit=crop" }
                        ].map((item, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-[2.5rem] bg-white/5 border border-white/5">
                                <div className="h-[250px] relative overflow-hidden">
                                    <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                        {item.sector}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h4 className="text-xl font-black tracking-tight mb-4">{item.title}</h4>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Expected ROI</p>
                                            <p className="text-lg font-black text-emerald-400">{item.roi}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tenure</p>
                                            <p className="text-lg font-black">{item.tenure}</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-400 font-black">E-Farming Partnership</span> এর সাথে আপনার বিনিয়োগ এখন আইনিভাবে ১০০% সুরক্ষিত। বাংলাদেশের প্রথম ডিজিটাল কৃষি অংশীদারিত্ব প্ল্যাটফর্ম।
                                    <button
                                        onClick={() => setSelectedProject(item)}
                                        className="w-full bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        Invest in Project
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Investment Modal */}
            <InvestmentModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />

            {/* Final Call to Action */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto relative bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 rounded-[3rem] p-12 md:p-20 overflow-hidden text-black text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8 relative z-10">
                        Ready to Build a <br /> Financial Legacy?
                    </h2>
                    <p className="text-lg md:text-xl font-medium opacity-80 mb-10 max-w-xl mx-auto relative z-10">
                        Join 1,200+ micro-investors who are changing the agricultural landscape of Bangladesh.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <button className="bg-black text-white px-10 py-5 rounded-[1.5rem] font-black text-lg hover:scale-105 transition-transform active:scale-95 shadow-2xl">
                            Create Free Account
                        </button>
                        <button className="bg-white/20 backdrop-blur-md border border-white/30 text-black px-10 py-5 rounded-[1.5rem] font-black text-lg hover:bg-white/30 transition-all">
                            Talk to Expert
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10 bg-black/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black">
                            AF
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase">AmraFund</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                        © 2026 AmraFund. A division of Asthar Hat Group. All rights reserved.
                        <br className="md:hidden" /> Legal Notice | Privacy Policy
                    </p>
                    <div className="flex gap-6">
                        {['Twitter', 'LinkedIn', 'Facebook'].map(s => (
                            <a key={s} href="#" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                                {s}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
