"use client";
export const runtime = 'edge';


import { ShoppingCart, Filter, Image as ImageIcon, Award } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';

import { useCart } from '@/context/CartContext';

import { useSound } from '@/context/SoundContext';
import { fetchProductsAction, fetchSiteSettingsAction } from '@/actions/public-data';

import HeroBanner from '@/components/HeroBanner';
import { m, AnimatePresence } from 'framer-motion';

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = searchParams?.get('category');
    const searchQuery = searchParams?.get('search');
    const brand = searchParams?.get('brand');

    const [products, setProducts] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    const { playNotification } = useSound();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [items, siteSettings] = await Promise.all([
                    fetchProductsAction(),
                    fetchSiteSettingsAction()
                ]);
                setProducts(items);
                setSettings(siteSettings);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddToCart = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(productId, 1);
        playNotification();
    };

    const allBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

    const filteredProducts = products.filter(p => {
        const matchesCategory = category ? p.category?.toLowerCase() === category.toLowerCase() : true;
        const matchesBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
        const matchesSearch = searchQuery
            ? (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand?.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;

        return matchesCategory && matchesSearch && matchesBrand;
    });

    const prefix = settings?.permalinkPrefix || 'product';

    const updateFilter = (type: string, value: string | null) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (value) params.set(type, value);
        else params.delete(type);
        router.push(`/shop?${params.toString()}`);
    };

    const displayTitle = searchQuery
        ? `"${searchQuery}" এর ফলাফল`
        : (category ? category : 'সব প্রডাক্টস');

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">অপেক্ষা করুন...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen">
            <HeroBanner hasSpecialCoupon={true} />

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-20">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                <Award size={12} /> ASTHA EXCLUSIVE
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">
                                {displayTitle}
                            </h1>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{filteredProducts.length}টি পণ্য পাওয়া গেছে</p>
                        </div>

                        {allBrands.length > 0 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                                <button
                                    onClick={() => updateFilter('brand', null)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${!brand ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                >
                                    সব ব্র্যান্ড
                                </button>
                                {allBrands.map((b: any) => (
                                    <button
                                        key={b}
                                        onClick={() => updateFilter('brand', b)}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${brand?.toLowerCase() === b.toLowerCase() ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                        {filteredProducts.map((product, idx) => {
                            let finalPrice = product.price;
                            const hasDiscount = (product.discountValue && product.discountValue > 0) || (product.discount && product.discount.value > 0);

                            if (product.discountType && product.discountValue) {
                                if (product.discountType === 'PERCENT') finalPrice = product.price - (product.price * (product.discountValue / 100));
                                else if (product.discountType === 'FIXED') finalPrice = product.price - product.discountValue;
                            }

                            return (
                                <m.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-white rounded-[2.5rem] border border-slate-100 p-4 md:p-6 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 flex flex-col h-full active:scale-95"
                                >
                                    <Link href={`/${prefix}/${product.slug || product.id}`} className="block relative aspect-square bg-slate-50 rounded-[2rem] overflow-hidden mb-6">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-4" alt={product.name} />
                                        ) : <ImageIcon className="text-slate-200 absolute inset-0 m-auto" size={48} />}

                                        {hasDiscount && (
                                            <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-xl uppercase tracking-widest">
                                                -{product.discountValue || product.discount?.value}% ছাড়
                                            </div>
                                        )}

                                        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <button
                                                onClick={(e) => handleAddToCart(e, product.id)}
                                                className="w-full bg-slate-900/90 backdrop-blur-md text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart size={14} /> কার্টে যোগ করুন
                                            </button>
                                        </div>
                                    </Link>

                                    <div className="space-y-4 flex flex-col flex-1">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-60">{product.category}</p>
                                            <h3 className="font-extrabold text-slate-950 line-clamp-2 text-sm md:text-base leading-tight hover:text-indigo-600 transition-colors uppercase tracking-tight italic">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {hasDiscount && <span className="text-[10px] text-slate-400 line-through font-bold">৳{product.price}</span>}
                                                <span className="text-xl font-black text-slate-950 tracking-tighter italic">৳{finalPrice}</span>
                                            </div>
                                            <Link
                                                href={`/${prefix}/${product.slug || product.id}`}
                                                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/arr"
                                            >
                                                <Filter size={16} className="group-hover/arr:rotate-90 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </m.div>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">অনুগ্রহ করে অন্য কোনো ব্র্যান্ড বা সার্চ ট্রাই করুন।</p>
                            </div>
                        )}
                    </div>
                </m.div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>}>
            <ShopContent />
        </Suspense>
    );
}
