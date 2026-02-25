'use client';

import { ShoppingCart, MoreVertical, Share2, Copy, Facebook, Image as ImageIcon, CheckCircle, X, ShieldCheck, ChevronRight } from 'lucide-react';
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

    if (!product) return null;

    const handleAuthAction = (action: () => void) => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname ?? '/')}`);
            return;
        }
        action();
    };

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className="bg-white w-full max-w-4xl rounded-sm overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all z-20"
                >
                    <X size={18} />
                </button>

                {/* Left: Image Selection */}
                <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-4 md:p-8">
                    <div className="relative w-full aspect-square flex items-center justify-center mb-4">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <ImageIcon size={64} className="text-gray-200" />
                        )}
                    </div>
                </div>

                {/* Right: Product Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white overflow-y-auto">
                    <h2 className="text-xl font-normal text-gray-800 leading-snug mb-4">{product.name}</h2>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-[#faca51]">
                            {[...Array(5)].map((_, i) => <span key={i} className="text-sm">★</span>)}
                        </div>
                        <span className="text-xs text-[#1a9cb7] hover:underline cursor-pointer">155 Ratings</span>
                        <div className="w-[1px] h-3 bg-gray-300 mx-2" />
                        <span className="text-xs text-[#1a9cb7]">Answered Questions</span>
                    </div>

                    <div className="bg-[#fafafa] p-4 border-y border-gray-100 mb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-normal text-[#f57224]">৳ {finalPrice.toFixed(0)}</span>
                        </div>
                        {hasDiscount && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 line-through">৳ {product.price}</span>
                                <span className="text-sm text-gray-800">-{product.discountValue || product.discount?.value}%</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 w-16">Quantity</span>
                            <div className="flex items-center border border-gray-300 rounded-sm">
                                <button className="px-3 py-1 hover:bg-gray-100 border-r border-gray-300">-</button>
                                <span className="px-4 py-1 text-sm">1</span>
                                <button className="px-3 py-1 hover:bg-gray-100 border-l border-gray-300">+</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                        <button
                            onClick={() => handleAuthAction(() => { addToCart(product.id, 1); router.push('/checkout'); })}
                            className="flex-1 bg-[#2ebaee] hover:bg-[#1a9cb7] text-white py-3 font-medium transition-colors"
                        >
                            Buy Now
                        </button>
                        <button
                            onClick={() => handleAuthAction(() => addToCart(product.id, 1))}
                            className="flex-1 bg-[#f57224] hover:bg-[#d0611e] text-white py-3 font-medium transition-colors"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { m } from 'framer-motion';
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
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
            className="group flex flex-col bg-white transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] cursor-pointer h-full border border-transparent overflow-hidden rounded-sm"
        >
            <PerspectiveCard>
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-[#fafafa] flex items-center justify-center p-2">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <ImageIcon size={32} className="text-gray-200" />
                    )}

                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-[#f57224] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                            -{product.discountValue || product.discount?.value}%
                        </div>
                    )}
                </div>

                {/* Info Container */}
                <div className="flex flex-col flex-1 p-3">
                    <h3 className="text-sm text-[#212121] transition-colors line-clamp-2 mb-2 leading-relaxed min-h-[2.5rem] font-normal">
                        {product.name}
                    </h3>

                    <div className="mt-auto">
                        <div className="flex flex-col gap-0.5 mb-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-normal text-[#f57224]">৳{finalPrice.toFixed(0)}</span>
                            </div>
                            {hasDiscount && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-gray-400 line-through font-light">৳{product.price}</span>
                                    <span className="text-[#212121] font-light">-{product.discountValue || product.discount?.value}%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                            <div className="flex text-[#faca51]">
                                {[...Array(5)].map((_, i) => <span key={i} className="text-[10px]">★</span>)}
                            </div>
                            <span className="text-[10px] text-gray-400">(24)</span>
                        </div>
                    </div>
                </div>
            </PerspectiveCard>

            {/* Hover Action (Daraz Style Slide Up) */}
            <button
                onClick={handleAddToCart}
                className={`w-full py-2 text-[11px] font-bold text-white transition-all transform translate-y-full group-hover:translate-y-0
                    ${isAdded ? 'bg-green-600' : 'bg-[#f57224] hover:bg-[#d0611e]'}
                `}
            >
                {isAdded ? 'ADDED TO CART' : 'ADD TO CART'}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-sm overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                    {/* Image Tray Animation */}
                    <div className="relative aspect-square bg-gray-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    </div>
                    {/* Text Skeletons */}
                    <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 w-3/4 rounded-sm" />
                        <div className="h-3 bg-gray-200 w-1/2 rounded-sm" />
                        <div className="mt-4 flex flex-col gap-1">
                            <div className="h-5 bg-gray-200 w-1/3 rounded-sm" />
                            <div className="h-3 bg-gray-200 w-1/4 rounded-sm" />
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
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3"
            >
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} index={index} />
                ))}
            </m.div>

            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </section>
    );
};
export default ProductGrid;
