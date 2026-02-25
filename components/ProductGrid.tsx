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
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className="bg-white w-full max-w-5xl rounded-lg overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-all active:scale-95 z-20"
                >
                    <X size={20} />
                </button>

                {/* Left: Image */}
                <div className="w-full md:w-3/5 bg-gray-50 flex items-center justify-center p-8 border-r border-gray-100">
                    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="max-w-full max-h-[500px] object-contain drop-shadow-md"
                            />
                        ) : (
                            <ImageIcon size={64} className="text-gray-300" />
                        )}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-2/5 p-8 flex flex-col overflow-y-auto">
                    <div className="mb-6">
                        <Link href={`/shop?brand=${product.brand}`} className="text-blue-600 text-sm font-bold hover:underline mb-2 block">
                            Visit the {product.brand || 'AstharHat'} Store
                        </Link>
                        <h2 className="text-2xl font-medium text-gray-900 leading-tight mb-4">{product.name}</h2>

                        <div className="h-px bg-gray-200 mb-6" />

                        <div className="flex flex-col gap-1 mb-6">
                            {hasDiscount && (
                                <div className="flex items-center gap-2">
                                    <span className="text-red-600 text-2xl font-light">-{product.discountValue || product.discount?.value}%</span>
                                    <span className="text-2xl font-medium">৳{finalPrice.toFixed(0)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                {hasDiscount ? (
                                    <>Typical price: <span className="line-through">৳{product.price}</span></>
                                ) : (
                                    <span className="text-2xl font-medium text-gray-900">৳{product.price}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
                        <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                            <CheckCircle size={16} /> In Stock
                        </div>
                        <p className="text-sm text-gray-600">Eligible for FREE shipping on first order.</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleAuthAction(() => addToCart(product.id, 1))}
                            className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-blue-900 rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => handleAuthAction(() => { addToCart(product.id, 1); router.push('/checkout'); })}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Buy Now
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-sm mb-2">Product Features</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex gap-2"><span>•</span> Premium quality materials</li>
                            <li className="flex gap-2"><span>•</span> {product.warrantyPeriod ? `Warranty: ${product.warrantyPeriod}` : 'Expert verified quality'}</li>
                            <li className="flex gap-2"><span>•</span> Secure transaction</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductCard = ({ product, onSelect }: { product: Product, onSelect: (p: Product) => void }) => {
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
        <div
            onClick={() => onSelect(product)}
            className="group flex flex-col bg-white border border-gray-100 p-4 transition-all hover:border-gray-300 hover:shadow-lg cursor-pointer h-full"
        >
            <div className="relative aspect-square mb-4 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <ImageIcon size={32} className="text-gray-200" />
                )}

                {hasDiscount && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">
                        {product.discountValue || product.discount?.value}% OFF
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1">
                <h3 className="text-sm font-medium text-blue-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2 leading-tight min-h-[2.5rem]">
                    {product.name}
                </h3>

                <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-orange-400">
                        {[...Array(5)].map((_, i) => <span key={i} className="text-xs">★</span>)}
                    </div>
                    <span className="text-[10px] text-blue-600 hover:underline">1,240</span>
                </div>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-bold self-start mt-0.5">৳</span>
                        <span className="text-xl font-bold">{finalPrice.toFixed(0)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-500 line-through ml-1">৳{product.price}</span>
                        )}
                    </div>

                    <p className="text-[10px] text-gray-500 mt-1 mb-4">Eligible for FREE Shipping</p>

                    <button
                        onClick={handleAddToCart}
                        className={`w-full py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm
                        ${isAdded ? 'bg-green-600 text-white' : 'bg-orange-400 hover:bg-orange-500 text-blue-900 hover:scale-[1.02] active:scale-95 animate-bounce-subtle'}
                        `}
                    >
                        {isAdded ? <><CheckCircle size={14} /> Added</> : <><ShoppingCart size={14} /> Add to Cart</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductGrid = ({ initialProducts }: { initialProducts?: any[] }) => {
    const { products: cachedProducts, loading } = useProductCache();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const products = React.useMemo(() => {
        const base = initialProducts || cachedProducts;
        if (!base || base.length === 0) return [];
        return base.slice(0, 40);
    }, [initialProducts, cachedProducts]);

    if (loading) return (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white border border-gray-100 animate-pulse"></div>
            ))}
        </div>
    );

    return (
        <section className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-gray-200 border border-gray-200 overflow-hidden shadow-sm">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                ))}
            </div>

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
