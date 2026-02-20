'use client';
export const runtime = 'edge';;

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Gift, Lock, Unlock, Copy, Check, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SecretCoupon {
    id: string;
    code: string;
    discount: number;
    discountType: 'PERCENT' | 'FIXED';
    description: string;
    expiryDate?: string;
    minPurchase?: number;
    isActive: boolean;
    createdAt: any;
}

export default function SecretRewardsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [coupons, setCoupons] = useState<SecretCoupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            // Guest users will see the prompt, but we don't redirect them
            setIsLoading(false);
            return;
        }

        if (user) {
            fetchSecretCoupons();
        }
    }, [user, loading]);

    const fetchSecretCoupons = async () => {
        try {
            const q = query(
                collection(db, 'secret_coupons'),
                where('isActive', '==', true),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SecretCoupon[];
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching secret coupons:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleApplyCoupon = (code: string) => {
        localStorage.setItem('appliedCoupon', code);
        router.push('/cart');
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    // Guest View - Gated Content
    if (!user) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center px-4 py-20">
                <div className="max-w-2xl w-full">
                    <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-orange-950/20 dark:via-pink-950/20 dark:to-purple-950/20 p-12 text-center shadow-2xl">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50 animate-pulse">
                                        <Lock className="text-white" size={48} strokeWidth={2.5} />
                                    </div>
                                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" size={24} fill="currentColor" />
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                                Secret Rewards!
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                Log in to reveal <span className="font-bold text-orange-600 dark:text-orange-500">exclusive coupons</span> and special rewards tailored just for you.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <Link
                                    href="/login"
                                    className="px-8 py-4 bg-gradient-to-r from-orange-600 to-pink-600 text-white font-black rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Unlock size={20} />
                                    Unlock Rewards
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-8 py-4 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-black rounded-2xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated User View
    return (
        <div className="min-h-screen bg-transparent px-4 py-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50">
                                <Gift className="text-white" size={40} strokeWidth={2.5} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                <Sparkles size={14} fill="currentColor" className="text-yellow-900" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        Your Secret Rewards 🎁
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Exclusive coupons just for you! Copy the code or apply it directly to your cart.
                    </p>
                </div>

                {/* Coupons Grid */}
                {coupons.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No secret rewards available right now. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative z-10 space-y-4">
                                    {/* Discount Badge */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-pink-600 text-white px-4 py-2 rounded-xl font-black text-xl">
                                                {coupon.discountType === 'PERCENT' ? `${coupon.discount}% OFF` : `৳${coupon.discount} OFF`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                        {coupon.description}
                                    </p>

                                    {/* Coupon Code */}
                                    <div className="bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">
                                            Coupon Code
                                        </p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-wider font-mono">
                                            {coupon.code}
                                        </p>
                                    </div>

                                    {/* Min Purchase Info */}
                                    {coupon.minPurchase && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                            Min. purchase: ৳{coupon.minPurchase}
                                        </p>
                                    )}

                                    {/* Expiry */}
                                    {coupon.expiryDate && (
                                        <p className="text-xs text-red-500 dark:text-red-400 text-center font-semibold">
                                            Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleCopyCode(coupon.code)}
                                            className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {copiedCode === coupon.code ? (
                                                <>
                                                    <Check size={16} />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    Copy Code
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleApplyCoupon(coupon.code)}
                                            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={16} />
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
