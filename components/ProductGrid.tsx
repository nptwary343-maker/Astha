'use client';

import { ShoppingCart, MoreVertical, Share2, Copy, Facebook, Image as ImageIcon, CheckCircle, X, ShieldCheck, ChevronRight, FileText, Truck, MapPin } from 'lucide-react';
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
    const isWeightBased = ['grocery', 'meat', 'bazar daily', 'natural', 'natural products'].includes(product.category.toLowerCase());

    const WEIGHT_UNITS = [
        { label: '250g', multiplier: 0.25 },
        { label: '500g', multiplier: 0.5 },
        { label: '1kg', multiplier: 1 },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-text-main/60 backdrop-blur-md"
                onClick={onClose}
            ></m.div>

            <m.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative z-10 flex flex-col md:flex-row max-h-[90vh] border border-white/20"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 bg-ui-bg hover:bg-slate-200 rounded-full text-text-main transition-all z-20 shadow-sm border border-border-light"
                >
                    <X size={20} />
                </button>

                {/* Left: Premium Image Showcase */}
                <div className="w-full md:w-1/2 bg-ui-bg flex items-center justify-center p-8 md:p-12">
                    <div className="relative w-full aspect-square bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center p-8 border border-white overflow-hidden group/img">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover/img:scale-110"
                            />
                        ) : (
                            <ImageIcon size={80} className="text-slate-100" />
                        )}
                        <div className="absolute top-4 left-4 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                            Premium Choice
                        </div>
                    </div>
                </div>

                {/* Right: Refined Data & Actions */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white overflow-y-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-md">{product.category}</span>
                            <div className="flex items-center gap-1 text-brand-accent ml-2">
                                <ShieldCheck size={14} className="fill-current" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Merchant</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-text-main leading-none mb-4 tracking-tight uppercase italic">{product.name}</h2>

                        <div className="flex items-center gap-4 py-4 border-y border-border-light">
                            <div className="flex items-center gap-0.5 text-brand-accent">
                                {[...Array(5)].map((_, i) => <span key={i} className="text-lg">★</span>)}
                            </div>
                            <span className="text-xs font-bold text-text-muted">4.9 (155 REVIEWS)</span>
                        </div>
                    </div>

                    <div className="bg-ui-bg p-8 rounded-[2rem] mb-10 border border-border-light relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="flex items-baseline gap-3 mb-2 relative z-10">
                            <span className="text-5xl font-black text-brand-primary tracking-tighter uppercase italic">৳{finalPrice.toFixed(0)}</span>
                            {isWeightBased && <span className="text-lg font-bold text-text-muted">/{selectedUnit.label}</span>}
                        </div>
                        {hasDiscount && (
                            <div className="flex items-center gap-3 relative z-10">
                                <span className="text-lg text-text-muted line-through opacity-50">৳ {(product.price * selectedUnit.multiplier * qty).toFixed(0)}</span>
                                <span className="text-sm font-black text-white bg-brand-accent px-3 py-1 rounded-full shadow-lg shadow-brand-accent/20">-{product.discountValue || product.discount?.value}% OFF</span>
                            </div>
                        )}
                    </div>

                    {isWeightBased && (
                        <div className="mb-10">
                            <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.3em] block mb-4">Quantity Scaling</label>
                            <div className="grid grid-cols-3 gap-3">
                                {WEIGHT_UNITS.map(unit => (
                                    <button
                                        key={unit.label}
                                        onClick={() => setSelectedUnit(unit)}
                                        className={`py-4 px-2 rounded-2xl text-xs font-black transition-all border-2 uppercase tracking-widest ${selectedUnit.label === unit.label
                                            ? 'border-brand-primary bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105'
                                            : 'border-border-light bg-ui-bg text-text-muted hover:border-text-muted/30'
                                            }`}
                                    >
                                        {unit.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-8 mt-auto">
                        {/* 💎 NEW: Product Intelligence / Organic Clarification */}
                        {(['natural', 'natural product', 'natural products', 'bazar', 'bazar daily', 'meat'].includes(product.category.toLowerCase()) || product.tags?.includes('organic')) && (
                            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-[2rem] p-6 mb-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Organic Integrity Verified</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-900 uppercase">Cultivation</p>
                                        <p className="text-[9px] font-bold text-emerald-600/70 leading-relaxed uppercase">100% Pesticide Free. No chemical fertilizers used during growth.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-900 uppercase">Sourcing</p>
                                        <p className="text-[9px] font-bold text-emerald-600/70 leading-relaxed uppercase">Directly from the Lush Highlands. Farm-to-Table within 24H.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-900 uppercase">Processing</p>
                                        <p className="text-[9px] font-bold text-emerald-600/70 leading-relaxed uppercase">Zero Preservatives. Cold-chain maintained for maximum nutrients.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-900 uppercase">Integrity</p>
                                        <p className="text-[9px] font-bold text-emerald-600/70 leading-relaxed uppercase">Lab Tested for Heavy Metals & Contaminants Weekly.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🚚 NEW: Live Tracker & Certification */}
                        {(product.trackingInfo || product.labReportUrl) && (
                            <div className="space-y-4 mb-6">
                                {product.trackingInfo && (
                                    <div className="bg-orange-50/50 border border-orange-100/50 rounded-[2rem] p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Truck className="text-orange-600" size={18} />
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-900">Live Item Tracker</h4>
                                            </div>
                                            <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase">Current Status</span>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-orange-100 flex items-center justify-center text-orange-600">
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text-main uppercase italic">{product.trackingInfo.status}</p>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{product.trackingInfo.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {product.labReportUrl && (
                                    <button
                                        onClick={() => window.open(product.labReportUrl, '_blank')}
                                        className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 p-5 rounded-[2rem] flex items-center justify-between group/cert transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/cert:text-brand-primary transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Documentation</p>
                                                <p className="text-xs font-black text-text-main uppercase italic">View Official Certification</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover/cert:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black text-text-muted tracking-[0.3em]">Select Units</span>
                            <div className="flex items-center gap-2 bg-ui-bg p-1.5 rounded-2xl border border-border-light">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-text-main hover:text-brand-primary transition-all font-black border border-border-light"
                                >-</button>
                                <span className="w-12 text-center text-base font-black text-text-main">{qty}</span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-text-main hover:text-brand-primary transition-all font-black border border-border-light"
                                >+</button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAuthAction(() => { addToCart(product.id, selectedUnit.multiplier * qty); router.push('/cart'); })}
                                className="flex-[1.5] bg-text-main hover:bg-brand-primary text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group/btn"
                            >
                                Secure Buy Now <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => handleAuthAction(() => { addToCart(product.id, selectedUnit.multiplier * qty); onClose(); })}
                                className="flex-1 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all border-2 border-brand-primary/10"
                            >
                                Add to Cart
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
            className="group flex flex-col bg-white transition-all hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.15)] cursor-pointer h-full border border-border-light rounded-[2.5rem] overflow-hidden relative"
        >
            <PerspectiveCard>
                {/* Image Architecture */}
                <div className="relative aspect-[4/5] overflow-hidden bg-ui-bg flex items-center justify-center p-6 sm:p-8 m-2 rounded-[2rem]">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        />
                    ) : (
                        <ImageIcon size={32} className="text-slate-200" />
                    )}

                    {hasDiscount && (
                        <div className="absolute top-4 left-4 bg-brand-accent text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-brand-accent/30 tracking-widest uppercase">
                            {product.discountValue || product.discount?.value}% OFF
                        </div>
                    )}
                </div>

                {/* Data Architecture */}
                <div className="flex flex-col flex-1 p-6 pt-2">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{product.category}</span>
                    <h3 className="text-sm font-bold text-text-main transition-colors line-clamp-2 mb-4 leading-tight min-h-[2.5rem] group-hover:text-brand-primary uppercase">
                        {product.name}
                    </h3>

                    <div className="mt-auto">
                        <div className="flex flex-col gap-0.5 mb-4">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black text-brand-primary tracking-tighter uppercase italic">৳{finalPrice.toFixed(0)}</span>
                            </div>
                            {hasDiscount && (
                                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                    <span className="line-through opacity-40">৳{product.price}</span>
                                    <span className="font-bold text-brand-accent">-{product.discountValue || product.discount?.value}%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between py-3 border-t border-border-light/50">
                            <div className="flex text-brand-accent">
                                {[...Array(5)].map((_, i) => <span key={i} className="text-[10px]">★</span>)}
                            </div>
                            {product.labReportUrl && (
                                <div className="p-1.5 bg-brand-primary/5 rounded-lg text-brand-primary group/tooltip relative">
                                    <FileText size={12} />
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-main text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">CERTIFIED QUALITY</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); onSelect(product); }}
                            className="w-full bg-ui-bg hover:bg-brand-primary hover:text-white text-text-main py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all border border-border-light flex items-center justify-center gap-2 group/vbtn"
                        >
                            View Details <ChevronRight size={14} className="group-hover/vbtn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </PerspectiveCard>

            {/* Premium Interactive Overlay */}
            <button
                onClick={handleAddToCart}
                className={`w-full py-4 text-[10px] font-black transition-all transform translate-y-full group-hover:translate-y-0 uppercase tracking-widest absolute bottom-0
                    ${isAdded ? 'bg-green-500 text-white' : 'bg-brand-primary text-white shadow-[0_-10px_30px_rgba(67,56,202,0.3)]'}
                `}
            >
                {isAdded ? 'Success!' : 'Add to Collection'}
            </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-border-light p-2 shadow-sm animate-pulse">
                    <div className="relative aspect-[4/5] bg-ui-bg rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="h-2 bg-slate-100 w-1/4 rounded-full" />
                        <div className="h-4 bg-slate-100 w-full rounded-full" />
                        <div className="h-4 bg-slate-100 w-2/3 rounded-full" />
                        <div className="mt-8 space-y-2">
                            <div className="h-6 bg-slate-100 w-1/3 rounded-full" />
                            <div className="h-10 bg-slate-100 w-full rounded-[2rem]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <section className="relative">
            <m.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8"
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
