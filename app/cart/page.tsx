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
        <div className="min-h-screen bg-gray-50 pb-20 pt-8">
            <PermissionModal
                isOpen={showPermissionModal}
                onAllow={() => { setShowPermissionModal(false); requestPermission(); setPendingOrderAction(true); }}
                onDeny={() => { setShowPermissionModal(false); setPendingOrderAction(true); }}
            />

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm">
                        <h1 className="text-2xl font-bold flex items-center gap-3 mb-8">
                            <ShoppingBag className="text-blue-600" />
                            আপনার শপিং কার্ট
                        </h1>

                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="p-6 bg-blue-50 rounded-full">
                                    <ShoppingBag size={64} className="text-blue-200" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">আপনার কার্ট খালি</h3>
                                    <p className="text-gray-500">এখনো কোনো পণ্য যোগ করা হয়নি।</p>
                                </div>
                                <button
                                    onClick={() => router.push('/')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95 flex items-center gap-2"
                                >
                                    কেনাকাটা শুরু করুন <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {calculatedItems.map((item) => (
                                    <div key={item.productId} className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-all">
                                        <div className="flex-1 space-y-1">
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">একক মূল্য: ৳{item.unitPrice}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1">
                                                <button onClick={() => updateQty(item.productId, -1)} className="p-2 hover:bg-gray-50 rounded-lg"><Minus size={16} /></button>
                                                <span className="w-8 text-center font-bold">{item.qty}</span>
                                                <button onClick={() => updateQty(item.productId, 1)} className="p-2 hover:bg-gray-50 rounded-lg"><Plus size={16} /></button>
                                            </div>
                                            <div className="text-right w-24">
                                                <p className="font-bold text-blue-600">৳{item.total}</p>
                                                {item.discountAmount > 0 && <p className="text-[10px] text-green-600 font-bold">সেভ: ৳{item.discountAmount}</p>}
                                            </div>
                                            <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-50 pb-4">
                            <CreditCard className="text-blue-600" size={20} />
                            অর্ডার করতে নিচের তথ্য দিন
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100" />
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর" className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="বিস্তারিত ঠিকানা" className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 h-24 resize-none" />

                        <div className="space-y-4 pt-4">
                            <p className="font-bold text-sm text-gray-500 uppercase tracking-widest">পেমেন্ট মেথড</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setPaymentMethod('cod')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100'}`}>
                                    <ShoppingBag className={paymentMethod === 'cod' ? 'text-blue-600' : 'text-gray-400'} />
                                    <span className="font-bold text-sm">ক্যাশ অন ডেলিভারি</span>
                                </button>
                                <button onClick={() => setPaymentMethod('bkash')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'bkash' ? 'border-pink-600 bg-pink-50/50' : 'border-gray-100'}`}>
                                    <div className="bg-pink-600 text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase italic tracking-tighter">bKash</div>
                                    <span className="font-bold text-sm">বিকাশ পেমেন্ট</span>
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'bkash' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-pink-50 rounded-2xl border border-pink-100 space-y-4">
                                <p className="text-sm text-pink-700 leading-relaxed font-medium">নিচের বিকাশ নম্বরটি কপি করুন এবং {summary?.finalTotal || 0} টাকা **Send Money** বা **Payment** করুন। তারপর মেসেজ থেকে TrxID-এর **শেষ ৬টি সংখ্যা** নিচে দিন।</p>
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-pink-200 justify-between">
                                    <span className="font-black text-pink-600 text-lg">{bkashNumber}</span>
                                    <button onClick={() => {
                                        if (typeof navigator !== 'undefined') navigator.clipboard.writeText(bkashNumber);
                                    }} className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100"><Copy size={18} /></button>
                                </div>
                                <input
                                    value={bkashTrxId}
                                    onChange={(e) => setBkashTrxId(e.target.value)}
                                    maxLength={6}
                                    placeholder="TrxID-এর শেষ ৬টি সংখ্যা দিন"
                                    className="w-full px-5 py-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-100 font-bold tracking-widest text-center"
                                />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <CouponSection onApply={setCouponCode} error={summary?.couponError} appliedCode={summary?.couponCode} discount={summary?.couponDiscount} loading={calculating} />

                    <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4 sticky top-8">
                        <h2 className="text-lg font-bold border-b border-gray-50 pb-4">অর্ডার ডিটেইলস</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500"><span>মুল্য (Gross)</span><span>৳{summary?.subtotal || 0}</span></div>
                            <div className="flex justify-between text-green-600"><span>ডিসকাউন্ট</span><span>-৳{summary?.totalDiscount || 0}</span></div>
                            {summary?.couponDiscount && summary.couponDiscount > 0 && (
                                <div className="flex justify-between text-blue-600 font-bold"><span>কুপন ডিসকাউন্ট</span><span>-৳{summary.couponDiscount}</span></div>
                            )}
                            <div className="flex justify-between text-gray-500"><span>ভ্যাট</span><span>৳{summary?.totalTax || 0}</span></div>
                            <div className="flex justify-between pt-4 border-t border-gray-100"><span className="font-bold text-lg text-gray-900">মোট</span><span className="font-black text-2xl text-blue-600 tracking-tighter">৳{summary?.finalTotal || 0}</span></div>
                        </div>

                        <button
                            onClick={handlePlaceOrderClick}
                            disabled={isPlacingOrder || items.length === 0}
                            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 mt-6 transition-all active:scale-95 disabled:opacity-50 bg-black hover:bg-gray-900 text-white shadow-black/10 hover:shadow-black/20`}
                        >
                            {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : <>অর্ডার কনফার্ম করুন <ArrowRight size={20} /></>}
                        </button>

                        <div className="pt-6 space-y-3">
                            <div className="flex items-center gap-3 text-gray-400 text-xs font-medium"><ShieldCheck size={16} /> Secure Payment Connection</div>
                            <div className="flex items-center gap-3 text-gray-400 text-xs font-medium"><Phone size={16} /> Help: +8801900000000</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
