'use client';
export const runtime = 'edge';

import React, { useState } from 'react';
import { Search, ChevronDown, Book, HelpCircle, Shield, ShoppingCart, Truck, CreditCard, User } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
    {
        category: 'Getting Started',
        icon: User,
        questions: [
            { q: "How do I create an account?", a: "You can create an account by clicking the 'Sign Up Free' button in the sidebar or from the login page. You'll need to provide your name, email, and choose a strong password." },
            { q: "Is my personal data secure?", a: "Yes, we use industry-standard encryption and follow strict privacy guidelines to ensure your personal and payment data is always safe." }
        ]
    },
    {
        category: 'Orders & Payments',
        icon: ShoppingCart,
        questions: [
            { q: "How can I track my order?", a: "You'll receive a unique Secret Key via email once your order is confirmed. Enter this key in the 'Track Order' section of the footer or header to see real-time updates." },
            { q: "What payment methods do you accept?", a: "We currently accept Cash on Delivery (COD) and bKash. We are working on adding more payment options soon." }
        ]
    },
    {
        category: 'Shipping & Delivery',
        icon: Truck,
        questions: [
            { q: "How long does delivery take?", a: "Standard delivery within Dhaka takes 24-48 hours. Outside Dhaka, it may take 3-5 business days." },
            { q: "What are the shipping costs?", a: "Shipping costs are calculated at checkout based on your location and the size of your order." }
        ]
    }
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggleOpen = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:py-20">
            <div className="max-w-7xl mx-auto">
                {/* Header Sub-section */}
                <div className="text-center mb-16 space-y-8">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl"
                    >
                        <HelpCircle size={40} />
                    </m.div>
                    <div className="space-y-4">
                        <m.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-7xl font-black text-slate-950 uppercase italic tracking-tighter leading-none"
                        >
                            Help <span className="text-indigo-600 font-normal not-italic">& Support</span>
                        </m.h1>
                        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto uppercase tracking-wide">
                            Everything you need to know about shopping at AstharHat.
                        </p>
                    </div>

                    {/* Quick Search */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 10 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-xl mx-auto relative group"
                    >
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find answers (e.g. tracking, returns)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-xl shadow-indigo-900/5 outline-none focus:border-indigo-600 transition-all font-bold text-slate-900"
                        />
                    </m.div>
                </div>

                {/* FAQ Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-12">
                        {FAQ_ITEMS.map((cat, idx) => (
                            <m.section
                                key={cat.category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 px-2">
                                    <cat.icon className="text-indigo-600" size={24} />
                                    <h2 className="text-2xl font-black text-slate-950 uppercase italic tracking-tight">{cat.category}</h2>
                                </div>

                                <div className="space-y-4">
                                    {cat.questions.map((q, qIdx) => {
                                        const id = `${idx}-${qIdx}`;
                                        const isOpen = openIndex === id;
                                        return (
                                            <div key={id} className={`bg-white rounded-3xl border transition-all duration-300 ${isOpen ? 'border-indigo-200 shadow-xl shadow-indigo-900/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                                <button
                                                    onClick={() => toggleOpen(id)}
                                                    className="w-full text-left p-6 flex items-center justify-between gap-4"
                                                >
                                                    <span className="text-base font-extrabold text-slate-800 tracking-tight">{q.q}</span>
                                                    <ChevronDown className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <m.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-6 pb-6 text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">
                                                                {q.a}
                                                            </div>
                                                        </m.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </m.section>
                        ))}
                    </div>

                    {/* Sidebar Support */}
                    <div className="space-y-8 sticky top-24 h-fit">
                        <m.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/20"
                        >
                            <h3 className="text-xl font-black uppercase italic mb-4">Still need help?</h3>
                            <p className="text-xs text-indigo-100 font-bold mb-8 leading-relaxed italic opacity-80 uppercase tracking-widest">Our customer success team is available 24/7 to solve your problems.</p>
                            <div className="space-y-4">
                                <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Support Center</button>
                                <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-indigo-600 border border-indigo-400 transition-all">Start Chat</button>
                            </div>
                        </m.div>

                        <m.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
                        >
                            <h3 className="text-sm font-black uppercase italic mb-6 text-slate-950">Quick Links</h3>
                            <div className="space-y-4">
                                <QuickLink icon={Truck} label="Shipping Policy" />
                                <QuickLink icon={Shield} label="Privacy Policy" />
                                <QuickLink icon={Book} label="Terms of Service" />
                            </div>
                        </m.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickLink({ icon: Icon, label }: any) {
    return (
        <a href={`/${label.toLowerCase().replace(/ /g, '-')}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group">
            <Icon size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
            <span className="text-xs font-black text-slate-500 group-hover:text-slate-950 transition-colors uppercase tracking-widest">{label}</span>
        </a>
    );
}
