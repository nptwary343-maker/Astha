'use client';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RecentlyViewed() {
    const { viewedProducts, clearRecentlyViewed } = useRecentlyViewed();

    if (viewedProducts.length === 0) return null;

    return (
        <div className="w-full bg-slate-50 border-t border-gray-100 py-12 md:py-16">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Clock className="text-orange-500" size={28} />
                            Recently Viewed Items
                        </h2>
                        <p className="text-sm font-medium text-gray-500 mt-2">Pick up right where you left off</p>
                    </div>

                    <button
                        onClick={clearRecentlyViewed}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all flex items-center self-start md:self-auto gap-2 border border-transparent hover:border-red-100"
                    >
                        <Trash2 size={14} /> Clear History
                    </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {viewedProducts.map((p, index) => {
                        const price = p.price;
                        let finalPrice = price;
                        if (p.discountType === 'PERCENT' && p.discountValue) {
                            finalPrice = price - (price * p.discountValue) / 100;
                        } else if (p.discountType === 'FIXED' && p.discountValue) {
                            finalPrice = price - p.discountValue;
                        }

                        return (
                            <Link
                                href={`/product/${p.slug || p.id}`}
                                key={p.id + index}
                                className="snap-start shrink-0 w-[180px] md:w-[220px] bg-white rounded-3xl border border-gray-100 p-4 hover:shadow-xl hover:border-orange-200 transition-all duration-300 group hover:-translate-y-1 relative"
                            >
                                <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden relative mb-4">
                                    {p.image ? (
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 text-xs font-bold uppercase">No Image</div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                            View Details <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors mb-2">
                                    {p.name}
                                </h3>

                                <div className="flex items-end gap-2 mt-auto">
                                    <span className="text-lg font-black text-gray-900 tracking-tight">৳{Math.round(finalPrice)}</span>
                                    {finalPrice < price && (
                                        <span className="text-xs font-bold text-gray-400 line-through mb-1">৳{price}</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
