'use client';

import { ShoppingCart, MoreVertical, Share2, Copy, Facebook, Image as ImageIcon, CheckCircle, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { useProductCache } from '@/hooks/useProductCache';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

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

    // Calculate display price
    // Calculate display price
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
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300 flex flex-col md:flex-row max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-all active:scale-90 z-20"
                >
                    <X size={20} />
                    <span className="sr-only">Close</span>
                </button>

                {/* Left: Image */}
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain drop-shadow-2xl"
                        />
                    ) : (
                        <ImageIcon size={64} className="text-gray-300" />
                    )}
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <div className="mb-6">
                        <span className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-2 block">Premium Collection</span>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">{product.name}</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-gray-900">৳{finalPrice.toFixed(0)}</span>
                            {hasDiscount && (
                                <span className="text-lg text-gray-400 line-through">৳{product.price}</span>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Experience ultimate comfort and style with our latest {product.name}.
                        Crafted from premium materials for the discerning customer.
                        Limited stock available for this exclusive drop.
                    </p>

                    <div className="mt-auto flex flex-col gap-3">
                        {/* Admin Details - Expiry & Production & Warranty */}
                        {(product.productionDate || product.expirationDate || product.warrantyPeriod || product.guaranteePeriod) && (
                            <div className="grid grid-cols-2 gap-3 mb-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                {product.productionDate && (
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Production</span>
                                        <span className="text-gray-800 font-semibold">{product.productionDate}</span>
                                    </div>
                                )}
                                {product.expirationDate && (
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Expires</span>
                                        <span className="text-red-500 font-semibold">{product.expirationDate}</span>
                                    </div>
                                )}
                                {product.warrantyPeriod && (
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Warranty</span>
                                        <span className="text-blue-600 font-semibold flex items-center gap-1">
                                            <ShieldCheck size={12} /> {product.warrantyPeriod}
                                        </span>
                                    </div>
                                )}
                                {product.guaranteePeriod && (
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Guarantee</span>
                                        <span className="text-green-600 font-semibold flex items-center gap-1">
                                            <ShieldCheck size={12} /> {product.guaranteePeriod}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAuthAction(() => addToCart(product.id, 1))}
                                className="flex-1 py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18} /> Add to Cart
                            </button>
                            <button
                                onClick={() => handleAuthAction(() => addToCart(product.id, 10))}
                                className="flex-1 py-3.5 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                                title="Buy 10 items at once"
                            >
                                <ShoppingCart size={18} /> Buy Wholesale
                            </button>
                        </div>

                        <button
                            onClick={() => handleAuthAction(() => alert('Added to wishlist!'))}
                            className="w-full py-3.5 border border-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 text-sm"
                        >
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Separate component to handle individual state (hover/dropdown)
const ProductCard = ({ product, onSelect }: { product: Product, onSelect: (p: Product) => void }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleShare = (platform: string) => {
        setIsMenuOpen(false);
        const url = `${window.location.origin}/product/${product.id}`;
        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    // Calculate display price
    // Calculate display price
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

    const { addToCart } = useCart();
    const { playNotification } = useSound();

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
        setTimeout(() => setIsAdded(false), 500);
    };

    return (
        <div
            onClick={() => onSelect(product)}
            className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-2 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 cursor-pointer overflow-hidden min-w-[160px]"
        >
            {/* Hover Color Effect Overlay */}
            <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/10 dark:group-hover:bg-blue-900/10 transition-colors duration-300 pointer-events-none z-0" />

            <div className="relative aspect-square rounded-xl mb-3 overflow-hidden bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors z-10">
                {(hasDiscount) && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full z-20 shadow-lg uppercase tracking-wider">
                        {(product.discountType === 'PERCENT' || product.discount?.type === 'percent') ?
                            `-${product.discountValue || product.discount?.value}%` :
                            `৳${product.discountValue || product.discount?.value} OFF`}
                    </span>
                )}



                {/* Image */}
                {product.images && product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10 text-gray-400">
                        <ImageIcon size={32} />
                    </div>
                )}
            </div>

            <div className="px-1 flex flex-col flex-1 z-10 relative">
                {/* Badges Area */}
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {/* Brand Badge */}
                    {product.brand && (
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-blue-100">
                            {product.brand}
                        </span>
                    )}
                    {/* Digital Certification Badge */}
                    <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-purple-100 flex items-center gap-0.5">
                        <CheckCircle size={8} /> Certified
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white transition-colors duration-300 mb-1 line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
                    {product.name}
                </h3>

                {/* View Details Button - Below Name (Brown, Appears on Hover) */}
                <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-10 group-hover:opacity-100 transition-all duration-300 ease-out">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(product);
                        }}
                        className="w-full py-1.5 mt-2 mb-2 text-[11px] font-bold text-white rounded-lg bg-[#8B4513] hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        View Details
                    </button>
                </div>

                <div className="flex items-end justify-between mt-auto pt-2 gap-2 border-t border-gray-700/50 group-hover:border-gray-100 transition-colors duration-300">
                    <div className="flex flex-col">
                        {hasDiscount && <span className="text-xs text-gray-500 group-hover:text-gray-400 line-through font-medium transition-colors">৳{product.price}</span>}
                        <span className="text-lg font-black text-gray-900 group-hover:text-gray-900 transition-colors duration-300">৳{finalPrice.toFixed(0)}</span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className={`p-2 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center min-w-[40px] min-h-[40px] active:scale-90 ${isAdded ? 'bg-green-600 opacity-100' : 'bg-red-600 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'
                            } text-white hover:bg-red-700 hover:shadow-lg`}
                        title="Add to Cart"
                    >
                        {isAdded ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
                    </button>
                </div>
            </div>

            {/* Share Menu - Kept minimal */}
            <div className="absolute top-2 right-2 z-30">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-1.5 rounded-full bg-white/50 hover:bg-white text-gray-600 transition-all opacity-0 group-hover:opacity-100"
                >
                    <MoreVertical size={16} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare('facebook'); }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Share2 size={12} /> Facebook
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare('copy'); }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Copy size={12} /> Copy Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductGrid = ({ initialProducts }: { initialProducts?: any[] }) => {
    const { products: cachedProducts, loading } = useProductCache();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Randomize initial products if they exist
    const products = React.useMemo(() => {
        const base = initialProducts || cachedProducts;
        if (!base || base.length === 0) return [];
        return base.slice(0, 80);
    }, [initialProducts, cachedProducts]);

    if (loading) return (
        <section className="py-12 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse shimmer"></div>
                ))}
            </div>
        </section>
    );

    if (products.length === 0) return (
        <section className="py-12 px-4 text-center">
            <div className="bg-gray-50 rounded-3xl p-16">
                <p className="text-gray-500 font-bold text-lg">No products found. Elevate your catalog.</p>
            </div>
        </section>
    );

    return (
        <section className="py-12 px-4 md:px-8 max-w-[1920px] mx-auto">
            <div className="flex items-end justify-between mb-10">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Featured Products</h2>
                </div>
                <Link href="/shop" className="group flex items-center gap-2 text-gray-900 dark:text-white group font-bold text-sm bg-gray-100 dark:bg-white/5 px-6 py-3 rounded-full hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm">
                    View Entire Shop <Copy size={16} className="rotate-45" />
                </Link>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 md:gap-4">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <ProductCard product={product} onSelect={setSelectedProduct} />
                    </div>
                ))}
            </div>

            {/* SPA Modal Detail */}
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
