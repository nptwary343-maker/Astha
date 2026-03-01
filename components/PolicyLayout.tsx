'use client';
import React from 'react';
import { ShieldCheck, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { m } from 'framer-motion';

interface PolicyLayoutProps {
    title: string;
    description: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export default function PolicyLayout({ title, description, lastUpdated, children }: PolicyLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:py-20 lg:py-32">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-12 transition-colors font-black text-[10px] uppercase tracking-widest group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/5 overflow-hidden border border-slate-100">
                    <div className="bg-slate-950 p-12 md:p-20 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />

                        <m.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block p-6 bg-white/5 rounded-[2.5rem] mb-8 backdrop-blur-md border border-white/10"
                        >
                            <ShieldCheck size={48} className="text-indigo-400" />
                        </m.div>
                        <h1 className="text-4xl md:text-7xl font-black mb-6 uppercase italic tracking-tighter leading-none italic">{title}</h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed uppercase tracking-wide opacity-80">
                            {description}
                        </p>
                    </div>

                    <div className="p-12 md:p-24 space-y-12">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] bg-indigo-50 px-4 py-2 rounded-full w-fit">
                            <Clock size={14} /> Last Updated: {lastUpdated}
                        </div>

                        <div className="prose prose-slate prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-p:text-slate-500 prose-p:font-medium prose-p:leading-relaxed prose-li:text-slate-500 prose-li:font-medium max-w-none">
                            {children}
                        </div>
                    </div>
                </div>
            </m.div>
        </div>
    );
}
