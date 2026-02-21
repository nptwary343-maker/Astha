"use client";
export const runtime = 'edge';


import { ShoppingCart, Filter, Image as ImageIcon, Award } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';

import { useCart } from '@/context/CartContext';

import { useSound } from '@/context/SoundContext';
import { fetchProductsAction, fetchSiteSettingsAction } from '@/actions/public-data';

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const brand = searchParams.get('brand');

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

    // Extract unique brands for filtering
    const allBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

    // Filter Logic
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
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(type, value);
        else params.delete(type);
        router.push(`/shop?${params.toString()}`);
    };

    const title = searchQuery
        ? `Search Results for "${searchQuery}"`
        : (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products');

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredProducts.length} items found</p>
                </div>

                {allBrands.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        <button
                            onClick={() => updateFilter('brand', null)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!brand ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                        >
                            All Brands
                        </button>
                        {allBrands.map((b: any) => (
                            <button
                                key={b}
                                onClick={() => updateFilter('brand', b)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${brand?.toLowerCase() === b.toLowerCase() ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-blue-400'}`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.slice(0, 80).map(product => {
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
                        <div key={product.id} className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-white/5 p-3 md:p-4 shadow-sm hover:shadow-xl hover:border-orange-100 dark:hover:border-orange-950 transition-all duration-300 group flex flex-col h-full">
                            <Link href={`/${prefix}/${product.slug || product.id}`} className="block">
                                <div className="relative aspect-square bg-gray-50 dark:bg-white/5 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                                    {product.images && product.images[0] ? (
                                        <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                                    ) : <ImageIcon className="text-gray-300" size={32} />}

                                    {product.brand && (
                                        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100 shadow-sm uppercase">
                                            {product.brand}
                                        </span>
                                    )}

                                    {hasDiscount && (
                                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                            {(product.discountType === 'PERCENT' || product.discount?.type === 'percent') ?
                                                `-${product.discountValue || product.discount?.value}%` : 'SALE'}
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm md:text-base mb-1 hover:text-orange-600 transition-colors uppercase tracking-tight">{product.name}</h3>
                            </Link>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-3">{product.category}</p>

                            <div className="mt-auto flex justify-between items-center">
                                <div className="flex flex-col">
                                    {hasDiscount && (
                                        <span className="text-[10px] md:text-xs text-gray-400 line-through">৳{product.price}</span>
                                    )}
                                    <span className="font-bold text-base md:text-lg text-gray-900 dark:text-white">৳{finalPrice.toFixed(0)}</span>
                                </div>
                                <button
                                    onClick={(e) => handleAddToCart(e, product.id)}
                                    className="bg-gray-900 dark:bg-white text-white dark:text-black p-2 md:px-4 md:py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-orange-600 dark:hover:bg-orange-500 transition-colors shadow-sm active:scale-95"
                                >
                                    <ShoppingCart size={16} /> <span className="hidden md:inline">Add</span>
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-lg font-medium">No products found.</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
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
