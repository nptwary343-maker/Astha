'use client';
export const runtime = 'edge';


import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight, ShieldCheck, Copy, Phone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from "@/lib/firebase";
import { onSnapshot, collection, query, where, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFCM } from '@/hooks/useFCM';
import PermissionModal from '@/components/PermissionModal';
import CouponSection from '@/components/CouponSection';
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
    couponDiscount?: number;
    couponCode?: string;
    couponError?: string;
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
    const [couponCode, setCouponCode] = useState('');

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
                const res = await fetch('/api/cart/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, couponCode, userEmail: user?.email, userTags: userData?.tags || [] })
                });
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
    }, [items, couponCode, user, userData]);

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
                couponCode: couponCode || null,
                userEmail: user?.email || null,
                userTags: userData?.tags || [],
                fcmToken
            });

            if (result.success && result.orderId) {
                clearCart();
                router.push(`/order-success/${result.orderId}`);
            } else {
                alert(result.error || 'অর্ডার করতে সমস্যা হয়েছে।');
            }
        } catch (e: any) {
            console.error(e);
            alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            setIsPlacingOrder(false);
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
                            <ShoppingBag className="text-indigo-600" />
                            আপনার শপিং কার্ট
                        </h1>

                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                                <div className="p-8 bg-slate-50 rounded-full">
                                    <ShoppingBag size={64} className="text-slate-200" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">আপনার কার্ট খালি!</h3>
                                    <p className="text-slate-500 text-sm">আমাদের চমৎকার সব কালেকশনগুলো একবার ঘুরে দেখুন।</p>
                                </div>
                                <button
                                    onClick={() => router.push('/')}
                                    className="bg-indigo-600 hover:bg-slate-900 text-white px-10 py-4 rounded-xl font-black transition-all shadow-xl active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
                                >
                                    কেনাকাটা শুরু করুন <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {calculatedItems.map((item) => (
                                    <div key={item.productId} className="flex flex-col md:flex-row gap-6 p-5 rounded-2xl border border-slate-50 hover:border-indigo-100 bg-white hover:bg-slate-50/50 transition-all group">
                                        <div className="flex-1 space-y-1">
                                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">একক মূল্য: ৳{item.unitPrice}</p>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6">
                                            <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                                                <button onClick={() => updateQty(item.productId, -1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Minus size={16} /></button>
                                                <span className="w-8 text-center font-black text-slate-800">{item.qty}</span>
                                                <button onClick={() => updateQty(item.productId, 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={16} /></button>
                                            </div>
                                            <div className="text-right w-24">
                                                <p className="font-black text-indigo-600 text-lg tracking-tighter italic">৳{item.total}</p>
                                                {item.discountAmount > 0 && <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md inline-block">সেভ: ৳{item.discountAmount}</p>}
                                            </div>
                                            <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-rose-600 p-2 transition-colors"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                        <h3 className="text-xs font-black flex items-center gap-2 border-b border-slate-50 pb-6 uppercase tracking-[0.2em] text-slate-400">
                            <CreditCard className="text-indigo-600" size={18} />
                            অর্ডার করতে নিচের তথ্য দিন
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">আপনার নাম</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম লিখুন" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">মোবাইল নম্বর</label>
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="০১৯XXXXXXXX" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1">বিস্তারিত ঠিকানা</label>
                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="বাসা নং, রোড নং, এলাকা এবং শহরের নাম..." className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold h-24 resize-none" />
                        </div>

                        <div className="space-y-4 pt-4">
                            <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">পেমেন্ট মেথড বেছে নিন</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setPaymentMethod('cod')} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group/cod ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <ShoppingBag className={paymentMethod === 'cod' ? 'text-indigo-600' : 'text-slate-300'} size={24} />
                                    <span className={`font-black text-[10px] uppercase tracking-widest ${paymentMethod === 'cod' ? 'text-indigo-600' : 'text-slate-400'}`}>ক্যাশ অন ডেলিভারি</span>
                                    {paymentMethod === 'cod' && <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-600 rounded-bl-xl flex items-center justify-center text-white"><ShieldCheck size={14} /></div>}
                                </button>
                                <button onClick={() => setPaymentMethod('bkash')} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${paymentMethod === 'bkash' ? 'border-pink-600 bg-pink-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div className="bg-pink-600 text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase italic tracking-tighter">bKash</div>
                                    <span className={`font-black text-[10px] uppercase tracking-widest ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-slate-400'}`}>বিকাশ পেমেন্ট</span>
                                    {paymentMethod === 'bkash' && <div className="absolute top-0 right-0 w-8 h-8 bg-pink-600 rounded-bl-xl flex items-center justify-center text-white"><ShieldCheck size={14} /></div>}
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'bkash' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-4">
                                <p className="text-xs text-pink-700 leading-relaxed font-bold uppercase tracking-tight">নিচের বিকাশ নম্বরটি কপি করুন এবং <span className="text-pink-600 font-black">৳{summary?.finalTotal || 0}</span> টাকা **Send Money** বা **Payment** করুন। তারপর মেসেজ থেকে TrxID-এর **শেষ ৬টি সংখ্যা** নিচে দিন।</p>
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-pink-200 justify-between shadow-sm">
                                    <span className="font-black text-pink-600 text-xl tracking-wider">{bkashNumber}</span>
                                    <button onClick={() => {
                                        if (typeof navigator !== 'undefined') navigator.clipboard.writeText(bkashNumber);
                                    }} className="p-2.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"><Copy size={18} /></button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase font-black text-pink-400 ml-1">TrxID-এর শেষ ৬টি সংখ্যা</label>
                                    <input
                                        value={bkashTrxId}
                                        onChange={(e) => setBkashTrxId(e.target.value)}
                                        maxLength={6}
                                        placeholder="EX: 7H3J9K"
                                        className="w-full px-5 py-4 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-100 font-black tracking-[0.3em] text-center text-pink-600 uppercase"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <CouponSection onApply={setCouponCode} error={summary?.couponError} appliedCode={summary?.couponCode} discount={summary?.couponDiscount} loading={calculating} />

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4 sticky top-8">
                        <h2 className="text-xs font-black border-b border-slate-50 pb-5 uppercase tracking-[0.2em] text-slate-400">অর্ডার ডিটেইলস</h2>
                        <div className="space-y-4 text-xs font-bold">
                            <div className="flex justify-between text-slate-400 uppercase tracking-widest"><span>মোট বাজার (Gross)</span><span>৳{summary?.subtotal || 0}</span></div>
                            <div className="flex justify-between text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/50">
                                <span>মোট ডিসকাউন্ট</span>
                                <span>-৳{summary?.totalDiscount || 0}</span>
                            </div>
                            {summary?.couponDiscount && summary.couponDiscount > 0 && (
                                <div className="flex justify-between text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100/50">
                                    <span>কুপন ছাড়</span>
                                    <span>-৳{summary.couponDiscount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-400 uppercase tracking-widest px-3"><span>ভ্যাট (Vat)</span><span>৳{summary?.totalTax || 0}</span></div>

                            <div className="pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">সর্বমোট প্রদেয়</span>
                                    <span className="font-black text-4xl text-indigo-600 tracking-tighter italic">৳{summary?.finalTotal || 0}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrderClick}
                            disabled={isPlacingOrder || items.length === 0}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2 mt-8 transition-all active:scale-95 disabled:opacity-50
                                ${isPlacingOrder ? 'bg-slate-100' : 'bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-200'}
                            `}
                        >
                            {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : <>অর্ডার কনফার্ম করুন <ArrowRight size={18} /></>}
                        </button>

                        {(summary?.totalDiscount || 0) > 0 && (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center group">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
                                    সেরা ডিল! আপনি মোট ৳{((summary?.totalDiscount || 0) + (summary?.couponDiscount || 0))} সেভ করছেন।
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
