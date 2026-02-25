'use client';

import React, { useEffect, useState } from 'react';
import { getActiveCoupons } from '@/lib/db-utils';
import { Coupon } from '@/types/admin';
import { Ticket, Copy, Check, Zap, Gift } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/context/AuthContext';

const RewardSection = () => {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchCoupons = async () => {
            const data = await getActiveCoupons();
            // Ensure ASTHAR30 is always there if not in DB
            const hasAsthar30 = (data as any[]).some(c => c.code === 'ASTHAR30');
            if (!hasAsthar30) {
                data.unshift({
                    id: 'default-1',
                    code: 'ASTHAR30',
                    title: 'ASTHAR30 – 30% Off First Order',
                    description: 'Get exclusive discount on your very first purchase at AstharHat.',
                    discount: 30,
                    expiry: null,
                    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
                    active: true,
                    applicableLocations: ['all']
                } as any);
            }
            setCoupons(data as Coupon[]);
        };
        fetchCoupons();
    }, []);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast('success', 'Reward Unlocked! Code copied to clipboard.');
        setTimeout(() => setCopiedCode(null), 3000);
    };

    if (!user || coupons.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="text-orange-500" size={32} />
                            <h2 className="text-3xl md:text-5xl font-black text-blue-900 tracking-tighter uppercase italic">
                                Coupons & Rewards
                            </h2>
                        </div>
                        <p className="text-gray-500 font-bold max-w-xl">
                            Unlock exclusive savings and member-only rewards. Copy your code and apply at checkout to save big today.
                        </p>
                    </div>
                    <div className="hidden md:block h-px flex-1 bg-gray-200 mb-6 mx-8" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                        >
                            <div className="aspect-[21/9] relative overflow-hidden">
                                <img
                                    src={coupon.imageUrl}
                                    alt={coupon.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
                                <div className="absolute bottom-4 left-6">
                                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">
                                        Active Offer
                                    </div>
                                    <h3 className="text-white text-xl font-bold">{coupon.title}</h3>
                                </div>
                            </div>

                            <div className="p-8">
                                <p className="text-gray-500 text-sm font-medium mb-8 line-clamp-2">
                                    {coupon.description}
                                </p>

                                <div
                                    onClick={() => handleCopy(coupon.code)}
                                    className="flex items-center justify-between bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-4 cursor-pointer hover:bg-blue-100 transition-colors group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <Ticket className="text-blue-600" size={24} />
                                        <span className="text-2xl font-black text-blue-900 tracking-wider">
                                            {coupon.code}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-blue-400 group-hover/btn:text-blue-600">
                                            {copiedCode === coupon.code ? 'Copied' : 'Copy Code'}
                                        </span>
                                        {copiedCode === coupon.code ? <Check className="text-green-500" size={20} /> : <Copy className="text-blue-300" size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RewardSection;
