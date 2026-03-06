'use client';
export const runtime = 'edge';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight, ShieldCheck, Copy, Phone, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from "@/lib/firebase";
import { onSnapshot, collection, query, where, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFCM } from '@/hooks/useFCM';
import PermissionModal from '@/components/PermissionModal';
// no coupon section
import { placeOrderAction } from '@/actions/checkout';

interface CalculatedItem {
    productId: string;
    name: string;
    unitPrice: number;
    qty: number;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
}

interface CartSummary {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    finalTotal: number;
}

export default function CartPage() {
    const { items, updateQty, removeFromCart, clearCart } = useCart();
    const { user, userData } = useAuth();
    const router = useRouter();

    const [calculatedItems, setCalculatedItems] = useState<CalculatedItem[]>([]);
    const [summary, setSummary] = useState<CartSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);


    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
    const [bkashTrxId, setBkashTrxId] = useState('');

    const [bkashQr, setBkashQr] = useState('');
    const [bkashNumber, setBkashNumber] = useState('');

    const { requestPermission, permission } = useFCM();
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [pendingOrderAction, setPendingOrderAction] = useState(false);

    // Add isMounted ref to prevent unmounted state updates
    const isMounted = React.useRef(true);
    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBkashQr(data.bkashQr || '');
                    setBkashNumber(data.bkashNumber || '01XXXXXXX');
                }
            } catch (e) { console.error(e); }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (pendingOrderAction && !showPermissionModal) {
            placeOrderFinal();
            setPendingOrderAction(false);
        }
    }, [pendingOrderAction, showPermissionModal]);

    useEffect(() => {
        const calculate = async () => {
            if (items.length === 0) {
                setCalculatedItems([]);
                setSummary(null);
                setLoading(false);
                return;
            }
            setCalculating(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/cart/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, userEmail: user?.email, userTags: userData?.tags || [] })
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Cart Calculation Error:", res.statusText, text);
                    return;
                }
                const data = await res.json();
                if (data.items && data.summary) {
                    setCalculatedItems(data.items);
                    setSummary(data.summary);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setCalculating(false);
                setLoading(false);
            }
        };
        const timer = setTimeout(calculate, 300);
        return () => clearTimeout(timer);
    }, [items, user, userData]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" /></div>;

    const handlePlaceOrderClick = async () => {
        if (!name || !phone || !address) {
            alert('অনুগ্রহ করে নাম, মোবাইল এবং ঠিকানা পূরণ করুন।');
            return;
        }
        if (paymentMethod === 'bkash' && bkashTrxId.length !== 6) {
            alert('বিকাশ TrxID-এর শেষ ৬টি সংখ্যা দিন (যেমন: 7H3J9K)।');
            return;
        }
        if (items.length === 0) return;

        if (permission === 'default') {
            setShowPermissionModal(true);
        } else {
            placeOrderFinal();
        }
    };

    const placeOrderFinal = async () => {
        setIsPlacingOrder(true);
        try {
            let fcmToken = null;
            const isNotificationSupported = typeof window !== 'undefined' && 'Notification' in window;
            if (isNotificationSupported && (permission === 'granted' || (typeof window !== 'undefined' && (window as any).Notification?.permission === 'granted'))) {
                try {
                    fcmToken = await requestPermission();
                } catch (err) {
                    console.warn("FCM Token fetch failed, proceeding without it.");
                }
            }

            // Call Server Action directly
            // Note: We don't send prices or totals. Zero Trust means the server figures it out.
            const result = await placeOrderAction({
                items: items.map(i => ({ productId: i.productId, quantity: i.qty })),
                customer: {
                    name,
                    phone,
                    address
                },
                payment: {
                    method: paymentMethod,
                    trxId: bkashTrxId || null
                },
                userEmail: user?.email || null,
                userTags: userData?.tags || [],
                fcmToken
            });

            if (result.success && result.orderId) {
                // Save order ID for tracking
                const existingOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
                if (!existingOrders.includes(result.orderId)) {
                    localStorage.setItem('my_orders', JSON.stringify([result.orderId, ...existingOrders]));
                }

                clearCart();
                router.push(`/order-success/${result.orderId}`);
            } else {

                alert(result.error || 'অর্ডার করতে সমস্যা হয়েছে।');
            }
        } catch (e: any) {
            console.error(e);
            if (isMounted.current) alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            if (isMounted.current) setIsPlacingOrder(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-8">
            <PermissionModal
                isOpen={showPermissionModal}
                onAllow={() => { setShowPermissionModal(false); requestPermission(); setPendingOrderAction(true); }}
                onDeny={() => { setShowPermissionModal(false); setPendingOrderAction(true); }}
            />

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <h1 className="text-2xl font-black flex items-center gap-3 mb-8 uppercase italic tracking-tighter">
                            <ShoppingBag className="text-brand-primary" />
                            আপনার শপিং কার্ট
                        </h1>

                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-24 space-y-8"
                            >
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-brand-primary/10 blur-3xl rounded-full animate-pulse" />
                                    <div className="p-10 bg-white dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl shadow-brand-primary/10 relative z-10 border border-brand-primary/5">
                                        <ShoppingBag size={80} className="text-brand-primary/30" strokeWidth={1.5} />
                                        <motion.div
                                            animate={{
                                                y: [0, -10, 0],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{ repeat: Infinity, duration: 4 }}
                                            className="absolute -top-2 -right-2 bg-brand-primary text-white p-3 rounded-2xl shadow-xl"
                                        >
                                            <Plus size={20} className="animate-pulse" />
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="text-center space-y-3 max-w-xs">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">কার্টটি একদম খালি!</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                        আপনার পছন্দের পন্যগুলো এখনও যুক্ত করা হয়নি। চলুন ঘুরে দেখা যাক আপনার জন্য কী কী অপেক্ষা করছে!
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/')}
                                    className="group bg-slate-900 hover:bg-brand-primary text-white px-12 py-5 rounded-[2rem] font-black transition-all shadow-2xl hover:shadow-brand-primary/25 active:scale-95 flex items-center gap-3 uppercase text-xs tracking-[0.2em] relative overflow-hidden"
                                >
                                    <span className="relative z-10">কেনাকাটা শুরু করুন</span>
                                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {calculatedItems.map((item) => (
                                    <div key={item.productId} className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 border border-slate-50 dark:border-zinc-800/50 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex-1 space-y-1">
                                            <h3 className="font-bold text-slate-800 dark:text-zinc-100 group-hover:text-brand-primary transition-colors uppercase tracking-tight text-lg">{item.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/20" />
                                                একক মূল্য: ৳{item.unitPrice}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6">
                                            <div className="flex items-center bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-1.5 shadow-inner">
                                                <button onClick={() => updateQty(item.productId, -1)} className="p-3 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-brand-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"><Minus size={18} /></button>
                                                <span className="w-10 text-center font-black text-slate-800 text-lg">{item.qty}</span>
                                                <button onClick={() => updateQty(item.productId, 1)} className="p-3 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-brand-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"><Plus size={18} /></button>
                                            </div>
                                            <div className="text-right w-24">
                                                <p className="font-black text-brand-primary text-lg tracking-tighter italic">৳{item.total}</p>
                                                {item.discountAmount > 0 && <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md inline-block">সেভ: ৳{item.discountAmount}</p>}
                                            </div>
                                            <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-rose-600 p-3 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"><Trash2 size={24} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                        <h3 className="text-xs font-black flex items-center gap-2 border-b border-slate-50 pb-6 uppercase tracking-[0.2em] text-slate-400">
                            <CreditCard className="text-brand-primary" size={18} />
                            অর্ডার করতে নিচের তথ্য দিন
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">আপনার নাম</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম লিখুন" className="w-full px-5 py-5 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">মোবাইল নম্বর</label>
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="০১৯XXXXXXXX" className="w-full px-5 py-5 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all font-bold" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1">বিস্তারিত ঠিকানা</label>
                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="বাসা নং, রোড নং, এলাকা এবং শহরের নাম..." className="w-full px-5 py-5 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all font-bold h-24 resize-none" />
                        </div>

                        <div className="space-y-6 pt-6">
                            <div className="flex flex-col gap-1">
                                <p className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] mb-2">পেমেন্ট মেথড বেছে নিন</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* COD Interactive Card */}
                                    <button
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`p-6 rounded-3xl border-2 transition-all duration-500 cursor-pointer text-left relative overflow-hidden flex items-center gap-5
                                            ${paymentMethod === 'cod'
                                                ? 'border-brand-primary bg-brand-primary/5 shadow-xl shadow-brand-primary/10'
                                                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 
                                            ${paymentMethod === 'cod' ? 'bg-brand-primary text-white rotate-6' : 'bg-slate-50 text-slate-300'}`}>
                                            <ShoppingBag size={28} />
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase tracking-widest text-[11px] ${paymentMethod === 'cod' ? 'text-brand-primary' : 'text-slate-400'}`}>ক্যাশ অন ডেলিভারি</p>
                                            <p className="text-[10px] text-slate-400 font-medium">পণ্যের হাতে পেয়ে দাম পরিশোধ করুন</p>
                                        </div>
                                        {paymentMethod === 'cod' && (
                                            <motion.div layoutId="paymentChecked" className="absolute top-4 right-4 text-brand-primary">
                                                <CheckCircle size={20} fill="currentColor" className="text-white fill-brand-primary" />
                                            </motion.div>
                                        )}
                                    </button>

                                    {/* bKash Interactive Card */}
                                    <button
                                        onClick={() => setPaymentMethod('bkash')}
                                        className={`p-6 rounded-3xl border-2 transition-all duration-500 cursor-pointer text-left relative overflow-hidden flex items-center gap-5
                                            ${paymentMethod === 'bkash'
                                                ? 'border-pink-500 bg-pink-50/50 shadow-xl shadow-pink-100'
                                                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 
                                            ${paymentMethod === 'bkash' ? 'bg-pink-600 text-white -rotate-6' : 'bg-slate-50 text-slate-300'}`}>
                                            <div className="font-black text-xs uppercase italic tracking-tighter">bKash</div>
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase tracking-widest text-[11px] ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-slate-400'}`}>বিকাশ পেমেন্ট</p>
                                            <p className="text-[10px] text-slate-400 font-medium">ঝটপট এবং নিরাপদ অনলাইন পেমেন্ট</p>
                                        </div>
                                        {paymentMethod === 'bkash' && (
                                            <motion.div layoutId="paymentChecked" className="absolute top-4 right-4 text-pink-600">
                                                <CheckCircle size={20} fill="currentColor" className="text-white fill-pink-600" />
                                            </motion.div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {paymentMethod === 'bkash' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-8 bg-pink-50/30 rounded-[2.5rem] border border-pink-100/50 space-y-6 relative">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <CreditCard size={120} className="text-pink-600" />
                                            </div>

                                            <div className="space-y-2 relative z-10">
                                                <h4 className="text-xs font-black text-pink-600 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-pulse" />
                                                    বিকাশ পেমেন্ট ইনস্ট্রাকশন
                                                </h4>
                                                <p className="text-[11px] text-pink-700 leading-relaxed font-bold">
                                                    নিচের নম্বরটি কপি করে আপনার বিকাশ অ্যাপ থেকে <span className="text-pink-600 font-black">৳{summary?.finalTotal || 0}</span> টাকা পে করুন। সফল পেমেন্টের পর ট্র্যানজেকশন আইডি (TrxID) এর শেষ ৬টি সংখ্যা দিন।
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-3xl border border-pink-100 justify-between shadow-lg shadow-pink-100/20 relative z-10">
                                                <div className="flex items-center gap-4 pl-4 py-2">
                                                    <Phone size={20} className="text-pink-600" />
                                                    <span className="font-black text-pink-600 text-2xl tracking-tighter">{bkashNumber}</span>
                                                </div>
                                                <button
                                                    onClick={() => { if (typeof navigator !== 'undefined') navigator.clipboard.writeText(bkashNumber); }}
                                                    className="w-full sm:w-auto px-8 py-4 bg-pink-600 text-white rounded-2xl hover:bg-pink-700 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                                                >
                                                    নম্বর কপি করুন
                                                </button>
                                            </div>

                                            <div className="space-y-3 relative z-10">
                                                <label className="text-[10px] uppercase font-black text-pink-400 ml-1 tracking-widest">TrxID-এর শেষ ৬টি সংখ্যা প্রবেশ করান</label>
                                                <div className="relative">
                                                    <input
                                                        value={bkashTrxId}
                                                        onChange={(e) => setBkashTrxId(e.target.value)}
                                                        maxLength={6}
                                                        placeholder="7H3J9K"
                                                        className="w-full px-8 py-6 rounded-3xl border-2 border-pink-100 bg-white outline-none focus:border-pink-400 transition-all font-black tracking-[0.4em] text-center text-2xl text-pink-600 uppercase placeholder:opacity-20 shadow-inner"
                                                    />
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-pink-100">
                                                        <ShieldCheck size={28} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">


                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4 sticky top-8">
                        <h2 className="text-xs font-black border-b border-slate-50 pb-5 uppercase tracking-[0.2em] text-slate-400">অর্ডার ডিটেইলস</h2>
                        <div className="space-y-4 text-xs font-bold">
                            <div className="flex justify-between text-slate-400 uppercase tracking-widest"><span>মোট বাজার (Gross)</span><span>৳{summary?.subtotal || 0}</span></div>
                            <div className="flex justify-between text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/50">
                                <span>মোট ডিসকাউন্ট</span>
                                <span>-৳{summary?.totalDiscount || 0}</span>
                            </div>

                            <div className="flex justify-between text-slate-400 uppercase tracking-widest px-3"><span>ভ্যাট (Vat)</span><span>৳{summary?.totalTax || 0}</span></div>

                            <div className="pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">সর্বমোট প্রদেয়</span>
                                    <span className="font-black text-4xl text-brand-primary tracking-tighter italic">৳{summary?.finalTotal || 0}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrderClick}
                            disabled={isPlacingOrder || items.length === 0}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2 mt-8 transition-all active:scale-95 disabled:opacity-50 min-h-[56px]
                                ${isPlacingOrder ? 'bg-slate-100' : 'bg-brand-primary hover:bg-slate-900 text-white shadow-brand-primary/20'}
                            `}
                        >
                            {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : <>অর্ডার কনফার্ম করুন <ArrowRight size={18} /></>}
                        </button>

                        {(summary?.totalDiscount || 0) > 0 && (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center group">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
                                    সেরা ডিল! আপনি মোট ৳{summary?.totalDiscount || 0} সেভ করছেন।
                                </p>
                            </div>
                        )}

                        <div className="pt-8 space-y-4 border-t border-slate-50 mt-4">
                            <div className="flex items-center gap-3 text-emerald-600 text-[10px] font-black uppercase tracking-widest"><ShieldCheck size={18} /> Zero Trust Secured Payment</div>
                            <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest"><Phone size={18} /> হেল্পলাইন: {bkashNumber}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
