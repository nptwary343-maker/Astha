'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Crown, Gift, Star } from 'lucide-react';
import Link from 'next/link';

interface VipDealsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const VipDealsModal = ({ isOpen, onClose }: VipDealsModalProps) => {
    if (!isOpen) return null;

    const deals = [
        { id: 1, title: 'Super VIP Electronics', discount: '50% OFF', code: 'VIP50', color: 'bg-purple-600' },
        { id: 2, title: 'Premium Fashion', discount: '৳500 OFF', code: 'FASH500', color: 'bg-pink-600' },
        { id: 3, title: 'Luxury Home', discount: '30% OFF', code: 'LUXE30', color: 'bg-amber-600' },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
                >
                    {/* Header */}
                    <div className="bg-blue-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Crown size={120} />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            <Star className="text-orange-400 fill-orange-400" />
                            VIP Member Deals
                        </h2>
                        <p className="text-blue-200 font-bold mt-2">Exclusive high-value rewards for our premium community.</p>
                        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {deals.map((deal) => (
                            <div key={deal.id} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-orange-500/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${deal.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                                        <Zap size={24} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-blue-900 dark:text-white uppercase text-lg leading-tight">{deal.title}</h3>
                                        <span className="text-orange-500 font-black text-2xl tracking-tighter">{deal.discount}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-500/30">
                                        <span className="text-xl font-black text-blue-900 dark:text-white tracking-widest">{deal.code}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Apply at checkout</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-center">
                        <Link href="/shop" onClick={onClose} className="px-12 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                            Unlock All Deals
                        </Link>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default VipDealsModal;
