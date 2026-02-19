'use client';

import React from 'react';
import { Zap, Sparkles, ShoppingBag, Truck } from 'lucide-react';

const MarqueeBar = () => {
    return (
        <div className="w-full bg-black text-white py-2 overflow-hidden border-b border-white/5 relative z-[60]">
            <div className="flex animate-marquee whitespace-nowrap">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-12 px-6">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Zap size={14} className="text-gold" />
                            Flash Sale Live: Up to 70% Off
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Truck size={14} className="text-red-500" />
                            Free Delivery on Orders Over ৳2000
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Sparkles size={14} className="text-blue-400" />
                            New Heritage Collection Just Landed
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                            <ShoppingBag size={14} className="text-green-400" />
                            Verified Farmers Direct bazar Products Available
                        </span>
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
          animation: marquee 40s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default MarqueeBar;
