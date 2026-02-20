'use client';

export const runtime = 'edge';


import { CheckCircle, Package, ArrowRight, Home, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '@/context/SoundContext';

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params?.id as string;

    const { playSuccess } = useSound();

    useEffect(() => {
        // Trigger celebration confetti on mount
        const duration = 3000;
        const end = Date.now() + duration;

        playSuccess(); // Play success chime

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#2563eb', '#9333ea', '#db2777']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#2563eb', '#9333ea', '#db2777']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-8 animate-in fade-in zoom-in duration-300">

                {/* Visual Icon */}
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="text-green-600 w-12 h-12" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2">অর্ডার সফল হয়েছে!</h1>
                <div className="space-y-4 mb-8">
                    <p className="text-gray-600 font-medium">
                        কেনার জন্য ধন্যবাদ! আমরা আপনার অর্ডারটি গ্রহণ করেছি।
                    </p>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-sm text-blue-800 flex items-center gap-3 text-left">
                        <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0">
                            <Phone size={18} />
                        </div>
                        <p>
                            <span className="font-bold">পরবর্তী ধাপ:</span> আমাদের অপারেটর দ্রুতই আপনাকে কল করে অর্ডারটি নিশ্চিত করবে।
                        </p>
                    </div>
                    <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl text-sm text-pink-800 flex items-center gap-3 text-left">
                        <div className="bg-pink-600 p-2 rounded-lg text-white shrink-0">
                            <Mail size={18} />
                        </div>
                        <p>
                            আমরা আপনার ইমেইলে অর্ডারের বিস্তারিত তথ্য পাঠিয়ে দেব।
                        </p>
                    </div>
                </div>

                {/* Order ID Card */}
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl mb-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={80} />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2 select-none">Security Tracker ID</p>
                    <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                        <Package size={24} className="text-emerald-400" />
                        <span className="text-2xl font-mono font-black text-white selection:bg-emerald-500/30 tracking-widest">
                            {orderId}
                        </span>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-3 font-medium animate-pulse">
                        ⚠️ ডেলিভারি ম্যানকে পণ্য রিসিভ করার সময় দেখান
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={18} /> আরও কেনাকাটা করুন
                    </Link>
                </div>

                <p className="text-xs text-gray-400 mt-8">
                    সাহায্য প্রয়োজন? কল করুন <span className="font-bold text-gray-600">017XXXXXXXX</span>
                </p>
            </div>
        </div>
    );
}
