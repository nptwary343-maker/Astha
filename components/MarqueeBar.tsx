'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, ShoppingBag, Truck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MarqueeBar = () => {
    const [messages, setMessages] = useState<any[]>([
        { text: 'Flash Sale Live: Up to 70% Off', icon: 'zap' },
        { text: 'Free Delivery on Orders Over ৳2000', icon: 'truck' }
    ]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const fetchMarquee = async () => {
            try {
                const docRef = doc(db, 'settings', 'marquee');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().items) {
                    setMessages(docSnap.data().items);
                    setIsActive(docSnap.data().isActive ?? true);
                }
            } catch (error) {
                console.error("Marquee fetch error:", error);
            }
        };
        fetchMarquee();
    }, []);

    if (!isActive || messages.length === 0) return null;

    const renderIcon = (name: string) => {
        switch (name) {
            case 'zap': return <Zap size={14} className="text-gold" />;
            case 'truck': return <Truck size={14} className="text-red-500" />;
            case 'sparkles': return <Sparkles size={14} className="text-blue-400" />;
            case 'shopping-bag': return <ShoppingBag size={14} className="text-green-400" />;
            default: return <Sparkles size={14} className="text-blue-400" />;
        }
    };

    return (
        <div className="w-full bg-slate-900 text-white py-1.5 overflow-hidden border-b border-white/5 relative z-[60]">
            <div className="flex animate-marquee whitespace-nowrap">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-12 px-6">
                        {messages.map((msg, idx) => (
                            <span key={idx} className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em]">
                                {renderIcon(msg.icon)}
                                {msg.text}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 35s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default MarqueeBar;
