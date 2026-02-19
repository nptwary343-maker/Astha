'use client';

import React, { useState } from 'react';
import { Ticket, ArrowRight, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CouponSectionProps {
    onApply: (code: string) => void;
    error?: string;
    appliedCode?: string;
    discount?: number;
    loading?: boolean;
}

export default function CouponSection({
    onApply,
    error,
    appliedCode,
    discount,
    loading
}: CouponSectionProps) {
    const [inputValue, setInputValue] = useState('');
    const { user, userData } = useAuth();

    const handleApply = () => {
        if (!inputValue.trim()) return;
        onApply(inputValue.toUpperCase().trim());
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl">
                    <Ticket className="text-blue-600" size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Promo Code</h3>
            </div>

            <div className="relative group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    disabled={!!appliedCode || loading}
                    className={`w-full bg-gray-50 border px-5 py-4 rounded-2xl outline-none focus:ring-4 transition-all font-black tracking-widest uppercase text-sm
                        ${error ? 'border-red-200 focus:ring-red-100' : 'border-gray-100 focus:ring-blue-100'}
                        ${appliedCode ? 'text-green-600 border-green-100 bg-green-50' : 'text-gray-900'}
                    `}
                />
                {!appliedCode && (
                    <button
                        onClick={handleApply}
                        disabled={loading || !inputValue}
                        className="absolute right-2 top-2 bottom-2 bg-gray-900 hover:bg-black text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : (
                            <>Apply <ArrowRight size={16} /></>
                        )}
                    </button>
                )}
            </div>

            {/* Status Feedback */}
            {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {appliedCode && (
                <div className="space-y-3 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-green-700 text-xs font-bold uppercase tracking-widest">
                            <CheckCircle2 size={14} />
                            Code Applied: {appliedCode}
                        </div>
                        <button
                            onClick={() => {
                                setInputValue('');
                                onApply(''); // Clear
                            }}
                            className="text-[10px] text-green-600 hover:underline font-bold"
                        >
                            Remove
                        </button>
                    </div>
                    {discount !== undefined && discount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Coupon Discount</span>
                            <span className="text-green-600 font-bold">-৳{discount.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            )}

            {!appliedCode && !error && (
                <p className="text-[10px] text-gray-400 font-medium px-1">
                    Enter a valid promo code to unlock exclusive discounts.
                </p>
            )}
        </div>
    );
}
