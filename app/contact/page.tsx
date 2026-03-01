'use client';
export const runtime = 'edge';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { m } from 'framer-motion';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        setSending(false);
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:py-20 lg:py-32">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-24">
                    <m.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                    >
                        Get in Touch
                    </m.span>
                    <m.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-black text-slate-950 uppercase italic tracking-tighter leading-none"
                    >
                        Contact <span className="text-indigo-600 font-normal not-italic">Us</span>
                    </m.h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* Left Side: Info */}
                    <m.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Contact Information</h2>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                                Have questions about an order or need support? Our team is here to help you 24/7. Reach out through any of these channels.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <ContactCard
                                icon={Phone}
                                title="Call Us"
                                value="+880 1XXX XXXXXX"
                                accent="bg-blue-50 text-blue-600"
                            />
                            <ContactCard
                                icon={Mail}
                                title="Email Us"
                                value="support@astharhat.com"
                                accent="bg-indigo-50 text-indigo-600"
                            />
                            <ContactCard
                                icon={MapPin}
                                title="Visit Us"
                                value="Dhaka, Bangladesh"
                                accent="bg-rose-50 text-rose-600"
                            />
                        </div>

                        <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-lg font-black italic mb-2">Live Support Available</h3>
                            <p className="text-xs text-slate-400 font-bold mb-6">Average response time: 2 minutes</p>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
                                <MessageCircle size={16} /> Start Chat
                            </button>
                        </div>
                    </m.div>

                    {/* Right Side: Form */}
                    <m.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 relative"
                    >
                        {success ? (
                            <div className="py-20 text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <Send size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-950 italic uppercase">Message Sent!</h2>
                                <p className="text-slate-500 font-medium">Thank you for reaching out. We'll get back to you shortly.</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Your Name</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-950"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Your Email</label>
                                        <input
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-950"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Subject</label>
                                    <input
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        type="text"
                                        placeholder="Order Inquiry / Support"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-950"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Message</label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="How can we help you today?"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-950 h-40 resize-none"
                                    />
                                </div>
                                <button
                                    disabled={sending}
                                    type="submit"
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-slate-950 hover:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {sending ? "Sending..." : <>Send Message <Send size={16} /></>}
                                </button>
                            </form>
                        )}
                    </m.div>
                </div>
            </div>
        </div>
    );
}

function ContactCard({ icon: Icon, title, value, accent }: any) {
    return (
        <div className="flex items-center gap-6 group">
            <div className={`w-14 h-14 ${accent} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                <Icon size={24} />
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
                <p className="text-lg font-black text-slate-950 italic tracking-tight">{value}</p>
            </div>
        </div>
    );
}
