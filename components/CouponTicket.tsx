'use client';

import React, { useState } from 'react';
import { Ticket, Copy, Check, Star, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface CouponTicketProps {
    uid?: string;
    coupon: {
        id: string;
        code: string;
        value: number;
        type: 'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING';
        description?: string;
        isPublic?: boolean;
        isExclusive?: boolean;
    };
    isSaved?: boolean;
}

export default function CouponTicket({ uid, coupon, isSaved: initialSaved = false }: CouponTicketProps) {
    const [saved, setSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClaim = async () => {
        if (!uid) return;
        setLoading(true);
        try {
            // Save to user's saved coupons
            const myCouponRef = doc(db, 'users', uid, 'myCoupons', coupon.id);
            await setDoc(myCouponRef, {
                code: coupon.code,
                claimedAt: serverTimestamp(),
                status: 'active'
            });
            setSaved(true);
        } catch (error) {
            console.error("Error claiming coupon:", error);
        } finally {
            setLoading(false);
        }
    };

    const isPercentage = coupon.type === 'PERCENTAGE';
    const amountStr = isPercentage ? `${coupon.value}%` : `৳${coupon.value}`;

    return (
        <div className="relative group transition-all duration-300 hover:-translate-y-1">
            {/* Ticket Shape */}
            <div className="relative bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-blue-500/50 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl group-hover:border-blue-500 transition-all">

                {/* Jagged Edge Pseudo-Elements (Cut-outs) */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-[#050505] rounded-full border-r-2 border-dashed border-gray-200 dark:border-blue-500/50 z-10" />
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-[#050505] rounded-full border-l-2 border-dashed border-gray-200 dark:border-blue-500/50 z-10" />

                <div className="flex items-stretch min-h-[140px]">
                    {/* Left Section: Value */}
                    <div className="w-1/3 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center p-4 border-r border-dashed border-gray-200 dark:border-blue-500/30">
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {amountStr}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-blue-400 uppercase tracking-widest mt-1">OFF</span>

                        {(coupon.isExclusive || !coupon.isPublic) && (
                            <div className="mt-2 flex items-center gap-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                <ShieldCheck size={10} /> Exclusive
                            </div>
                        )}
                    </div>

                    {/* Right Section: Code & Action */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-black text-gray-900 dark:text-white tracking-tight">
                                    {coupon.code.slice(0, 2)}****
                                </h3>
                                {coupon.isPublic && (
                                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {coupon.description || "Limited time offer! Use this code to save on your next purchase."}
                            </p>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleCopy}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>

                            <button
                                onClick={handleClaim}
                                disabled={saved || loading || !uid}
                                className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${saved
                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                                    }`}
                            >
                                {saved ? <Check size={14} /> : loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Star size={14} />}
                                {saved ? 'Saved' : 'Claim'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glowing Accent for Dark Mode */}
            <div className="absolute inset-0 bg-blue-500/5 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
