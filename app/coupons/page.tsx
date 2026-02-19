'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import CouponTicket from '@/components/CouponTicket';
import { Ticket, Gift, Sparkles, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RewardsPage() {
    const { user, loading: authLoading } = useAuth();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllRewards = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Saved Coupons to mark status
                const savedRef = collection(db, 'users', user.uid, 'myCoupons');
                const savedSnap = await getDocs(savedRef);
                const savedSet = new Set(savedSnap.docs.map(doc => doc.id));
                setSavedIds(savedSet);

                // 2. Fetch Targeted / Public Coupons
                const couponRef = collection(db, 'coupons');

                // Firestore doesn't support complex OR queries easily with array-contains 
                // in some versions without index, so we'll fetch then filter or run two queries

                const [publicSnap, userSnap] = await Promise.all([
                    getDocs(query(couponRef, where('isPublic', '==', true))),
                    getDocs(query(couponRef, where('targeting.allowedUsers', 'array-contains', user.uid)))
                ]);

                // Also consider allowedEmails
                const emailSnap = user.email ? await getDocs(query(couponRef, where('targeting.allowedEmails', 'array-contains', user.email))) : { docs: [] };

                const allDocs = [...publicSnap.docs, ...userSnap.docs, ...emailSnap.docs];

                // Deduplicate by ID
                const uniqueCoupons = Array.from(new Map(allDocs.map(doc => [doc.id, { id: doc.id, ...doc.data() }])).values());

                // Filter by Inactive or Expired (Client side for now to avoid multiple indexes)
                const now = new Date();
                const filtered = uniqueCoupons.filter((c: any) => {
                    const expiry = c.expiryDate ? new Date(c.expiryDate) : null;
                    return c.isActive !== false && (!expiry || expiry > now);
                });

                setCoupons(filtered);
            } catch (err) {
                console.error("Error fetching rewards:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchAllRewards();
        }
    }, [user, authLoading]);

    if (authLoading || (user && loading)) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-gray-500 font-bold animate-pulse">Checking your rewards...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Gift className="text-blue-600" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Secret Rewards!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Log in to reveal exclusive coupons and special rewards tailored just for you.
                    </p>
                    <Link
                        href="/login?redirect=/coupons"
                        className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                        <LogIn size={20} /> Login to View
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] py-16 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header Container */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-sm mb-2">
                            <Sparkles size={16} /> Just For You
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Your Rewards</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Claim and save your exclusive discount tickets.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                            <Ticket className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{coupons.length}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Tickets</p>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                {coupons.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-24 text-center border border-dashed border-gray-200 dark:border-white/10 shadow-sm">
                        <div className="mb-6 opacity-20">
                            <Ticket size={80} className="mx-auto text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No special rewards for you yet.</h2>
                        <p className="text-gray-500 dark:text-gray-400">Keep shopping and participating in our events to earn exclusive deals!</p>
                        <Link href="/shop" className="inline-block mt-8 text-blue-600 dark:text-blue-400 font-black hover:underline">Explore Store</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {coupons.map((coupon) => (
                            <CouponTicket
                                key={coupon.id}
                                uid={user.uid}
                                coupon={coupon}
                                isSaved={savedIds.has(coupon.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
