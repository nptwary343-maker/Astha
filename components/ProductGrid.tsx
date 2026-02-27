'use client';

import { ShoppingCart, MoreVertical, Share2, Copy, Facebook, Image as ImageIcon, CheckCircle, X, ShieldCheck, ChevronRight, FileText, Truck, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { useProductCache } from '@/hooks/useProductCache';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

// --- Product Modal Component ---
const ProductDetailModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [qty, setQty] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState({ label: '1kg', multiplier: 1 });

    if (!product) return null;

    const handleAuthAction = (action: () => void) => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname ?? '/')}`);
            return;
        }
        action();
    };

    let basePrice = product.price;
    const hasDiscount = (product.discountValue && product.discountValue > 0) || (product.discount && product.discount.value > 0);

    if (product.discountType && product.discountValue) {
        if (product.discountType === 'PERCENT') {
            basePrice = product.price - (product.price * (product.discountValue / 100));
        } else if (product.discountType === 'FIXED') {
            basePrice = product.price - product.discountValue;
        }
    } else if (product.discount && product.discount.value > 0) {
        if (product.discount.type === 'percent') {
            basePrice = product.price - (product.price * (product.discount.value / 100));
        } else {
            basePrice = product.price - product.discount.value;
        }
    }

    const finalPrice = basePrice * selectedUnit.multiplier * qty;
    const savings = (product.price * selectedUnit.multiplier * qty) - finalPrice;
    const isWeightBased = ['grocery', 'meat', 'bazar daily', 'natural', 'natural products'].includes(product.category.toLowerCase());

    const WEIGHT_UNITS = [
        { label: '২৫০ গ্রাম', multiplier: 0.25 },
        { label: '৫০০ গ্রাম', multiplier: 0.5 },
        { label: '১ কেজি', multiplier: 1 },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                onClick={onClose}
            ></m.div>

            <m.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[95vh] border border-slate-100"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-all z-20 shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* Left: Premium Image Showcase */}
                <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-6 md:p-10 border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="relative w-full aspect-square bg-white rounded-2xl shadow-sm flex items-center justify-center p-6 overflow-hidden">
                        {product.images?.find(img => !!img) ? (
                            <img
                                src={product.images.find(img => !!img)}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <ImageIcon size={64} className="text-slate-200" />
                        )}
                        <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                            Premium Choice
                        </div>
                    </div>
                </div>

                {/* Right: Refined Data & Actions */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white overflow-y-auto">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{product.category}</span>
                            <div className="flex items-center gap-1 text-emerald-600 ml-2">
                                <ShieldCheck size={14} className="fill-current" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Merchant</span>
                            </div>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight mb-4 uppercase italic tracking-tighter">{product.name}</h2>

                        <div className="flex items-center gap-4 py-3 border-y border-slate-50">
                            <div className="flex items-center gap-0.5 text-orange-400">
                                {[...Array(5)].map((_, i) => <span key={i} className="text-base">★</span>)}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4.9 (155 REVIEWS)</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 relative overflow-hidden group">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-black text-indigo-600 tracking-tighter uppercase italic">৳{finalPrice.toFixed(0)}</span>
                            {isWeightBased && <span className="text-sm font-bold text-slate-400">/{selectedUnit.label}</span>}
                        </div>
                        {hasDiscount && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 line-through opacity-60">৳ {(product.price * selectedUnit.multiplier * qty).toFixed(0)}</span>
                                <span className="text-[10px] font-black text-white bg-rose-600 px-2.5 py-1 rounded-md shadow-md">আপনি বাঁচাচ্ছেন ৳{savings.toFixed(0)}</span>
                            </div>
                        )}
                    </div>

                    {isWeightBased && (
                        <div className="mb-6">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-3">পছন্দমতো ওজন বেছে নিন</label>
                            <div className="grid grid-cols-3 gap-2">
                                {WEIGHT_UNITS.map(unit => (
                                    <button
                                        key={unit.label}
                                        onClick={() => setSelectedUnit(unit as any)}
                                        className={`py-3 px-1 rounded-xl text-[10px] font-black transition-all border-2 uppercase tracking-tighter ${selectedUnit.label === unit.label
                                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-indigo-300'
                                            }`}
                                    >
                                        {unit.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 mt-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">পরিমাণ (QTY)</span>
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-indigo-600 transition-all font-black border border-slate-100"
                                >-</button>
                                <span className="w-10 text-center text-sm font-black text-slate-800">{qty}</span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-indigo-600 transition-all font-black border border-slate-100"
                                >+</button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAuthAction(() => { addToCart(product.id, selectedUnit.multiplier * qty); router.push('/cart'); })}
                                className="flex-[1.5] bg-indigo-600 hover:bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group/btn"
                            >
                                সরাসরি কিনুন <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => handleAuthAction(() => { addToCart(product.id, selectedUnit.multiplier * qty); onClose(); })}
                                className="flex-1 bg-white hover:bg-slate-50 text-indigo-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2 border-indigo-100"
                            >
                                কার্টে যোগ করুন
                            </button>
                        </div>
                    </div>
                </div>
            </m.div>
        </div>
    );
};

import { m, AnimatePresence } from 'framer-motion';
import { PerspectiveCard } from './motion/MotionGraphics';

const ProductCard = ({ product, onSelect, index }: { product: Product, onSelect: (p: Product) => void, index: number }) => {
    const [isAdded, setIsAdded] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { addToCart } = useCart();
    const { playNotification } = useSound();

    let finalPrice = product.price;
    const hasDiscount = (product.discountValue && product.discountValue > 0) || (product.discount && product.discount.value > 0);

    if (product.discountType && product.discountValue) {
        if (product.discountType === 'PERCENT') {
            finalPrice = product.price - (product.price * (product.discountValue / 100));
        } else if (product.discountType === 'FIXED') {
            finalPrice = product.price - product.discountValue;
        }
    } else if (product.discount && product.discount.value > 0) {
        if (product.discount.type === 'percent') {
            finalPrice = product.price - (product.price * (product.discount.value / 100));
        } else {
            finalPrice = product.price - product.discount.value;
        }
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname ?? '/')}`);
            return;
        }

        addToCart(product.id, 1);
        playNotification();
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 800);
    };

    return (
        <m.div
            onClick={() => onSelect(product)}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group flex flex-col bg-white transition-all hover:shadow-2xl cursor-pointer h-full border border-slate-100 rounded-2xl overflow-hidden relative active:scale-95"
        >
            {/* Image Architecture */}
            <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                {product.images?.find(img => !!img) ? (
                    <img
                        src={product.images.find(img => !!img)}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                    />
                ) : (
                    <ImageIcon size={32} className="text-slate-200" />
                )}

                {hasDiscount && (
                    <div className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg tracking-widest uppercase">
                        {product.discountValue || product.discount?.value}% ছাড়
                    </div>
                )}
            </div>

            {/* Data Architecture */}
            <div className="flex flex-col flex-1 p-4">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{product.category}</span>
                <h3 className="text-xs font-bold text-slate-800 line-clamp-2 mb-3 leading-snug min-h-[2.5rem] group-hover:text-indigo-600 uppercase tracking-tighter">
                    {product.name}
                </h3>

                <div className="mt-auto">
                    <div className="flex flex-col mb-3">
                        <span className="text-lg font-black text-indigo-600 tracking-tighter italic uppercase">৳{finalPrice.toFixed(0)}</span>
                        {hasDiscount && (
                            <span className="text-[9px] text-slate-300 line-through">৳{product.price}</span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className={`w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border flex items-center justify-center gap-2
                            ${isAdded
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-slate-900 border-slate-900 text-white hover:bg-indigo-600 hover:border-indigo-600'
                            }`}
                    >
                        {isAdded ? 'যোগ হয়েছে!' : 'কার্টে যোগ করুন'}
                    </button>
                </div>
            </div>
        </m.div>
    );
};

const ProductGrid = ({ initialProducts }: { initialProducts?: any[] }) => {
    const { products: cachedProducts, loading } = useProductCache();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const products = React.useMemo(() => {
        const base = initialProducts || cachedProducts;
        if (!base || base.length === 0) return [];
        return base.slice(0, 30);
    }, [initialProducts, cachedProducts]);

    if (loading) return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 p-2 shadow-sm animate-pulse">
                    <div className="relative aspect-square bg-slate-50 rounded-xl" />
                    <div className="p-4 space-y-3">
                        <div className="h-2 bg-slate-100 w-1/3 rounded-full" />
                        <div className="h-3 bg-slate-100 w-full rounded-full" />
                        <div className="h-6 bg-slate-100 w-1/2 rounded-lg mt-4" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <section className="relative">
            <m.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6"
            >
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} index={index} />
                ))}
            </m.div>

            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};
export default ProductGrid;
