'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ShoppingCart, Star, Send, ArrowLeft, Minus, Plus, Check, Award, ShieldCheck, FileText, ExternalLink, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    status: string;
    brand?: string;
    images: string[];
    description?: string;
    slug?: string;
    discountType?: 'PERCENT' | 'FIXED';
    discountValue?: number;
    discount?: {
        type: 'percent' | 'flat';
        value: number;
    } | null;
    expiryDate?: string;
    warranty?: string;
    weightOptions?: { label: string, price: number }[];
    isExpertVerified?: boolean;
    originDetails?: string;
    labReportUrl?: string;
    descriptionBn?: string;
    dimensions?: {
        length: string;
        width: string;
    };
}

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    timestamp: any;
}

interface ProductDetailClientProps {
    initialProduct: Product | null;
    productId: string;
    similarProducts?: Product[];
}

export default function ProductDetailClient({ initialProduct, productId, similarProducts = [] }: ProductDetailClientProps) {
    const [product, setProduct] = useState<Product | null>(initialProduct);
    const [reviews, setReviews] = useState<Review[]>([]);
    // If we have initial data, we generally aren't "loading" the main content, 
    // but we might be verifying it or loading reviews.
    // Let's assume loading is done if initialProduct exists.
    const [isLoading, setIsLoading] = useState(!initialProduct);
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [isAdded, setIsAdded] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
    const [dynamicPrice, setDynamicPrice] = useState<number>(initialProduct?.price || 0);
    // Price Calculation Helper
    const getDiscountedPrice = (price: number) => {
        if (product?.discountType && product?.discountValue) {
            if (product.discountType === 'PERCENT') {
                return price - (price * (product.discountValue / 100));
            } else if (product.discountType === 'FIXED') {
                return price - product.discountValue;
            }
        } else if (product?.discount && product.discount.value > 0) {
            if (product.discount.type === 'percent') {
                return price - (price * (product.discount.value / 100));
            } else {
                return price - product.discount.value;
            }
        }
        return price;
    };

    // Initialize dynamic price with discount applied
    useEffect(() => {
        if (product) {
            setDynamicPrice(getDiscountedPrice(product.price));
        }
    }, [product?.id]);

    // Dynamic Price Calculation Logic for Variants
    useEffect(() => {
        if (product && selectedWeight && product.weightOptions) {
            const option = product.weightOptions.find(o => o.label === selectedWeight);
            if (option) {
                setDynamicPrice(getDiscountedPrice(option.price));
            }
        } else if (product) {
            setDynamicPrice(getDiscountedPrice(product.price));
        }
    }, [selectedWeight, product]);

    const handleAddToCart = () => {
        if (!product) return;

        if (!user) {
            // Guest Redirection Logic
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
            router.push(loginUrl);
            return;
        }

        // In a real app, you'd pass selectedWeight/dynamicPrice to the cart
        addToCart(product.id, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    // Review Form State
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [userName, setUserName] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // If initialProduct was null for some reason (e.g. static navigation to a new ID without server fetch - rare in Next.js app router soft nav unless purely client side), 
    // we might want a fallback fetch. 
    // But since the parent IS a server component, it handles the fetch. 
    // However, for good measure, we can sync if product is somehow missing or if we want real-time updates on the PRODUCT itself (like stock).

    // Let's keep it simple: Use initialProduct. 
    // If strict realtime stock is needed, we would onSnapshot the product doc too.

    useEffect(() => {
        if (!initialProduct && productId) {
            const fetchProduct = async () => {
                try {
                    const docRef = doc(db, "products", productId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
                    } else {
                        console.log("No such product!");
                    }
                } catch (error) {
                    console.error("Error fetching product:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProduct();
        } else {
            setIsLoading(false);
        }
    }, [productId, initialProduct]);

    useEffect(() => {
        if (!productId) return;
        // Real-time listener for reviews
        // Security NOTE: In a real app, limit this query!
        const q = query(collection(db, "products", productId, "reviews"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];
            setReviews(reviewsData);
        });

        return () => unsubscribe();
    }, [productId]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
            return;
        }

        if (!userName.trim() || !userComment.trim()) return;

        setIsSubmittingReview(true);
        try {
            await addDoc(collection(db, "products", productId, "reviews"), {
                userName,
                userId: user.uid,
                rating: userRating,
                comment: userComment,
                timestamp: serverTimestamp()
            });
            setUserComment('');
            setUserRating(5);
            // setUserName(''); // Keep username
            alert('Review submitted successfully!');
        } catch (error) {
            console.error("Error adding review: ", error);
            alert('Failed to submit review.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
            <Link href="/shop" className="text-blue-600 hover:underline">Back to Shop</Link>
        </div>
    );

    // Final Display Price (calculated once for external refs/SEO if needed, though dynamicPrice handles UI)
    const finalPrice = getDiscountedPrice(product.price);

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Button */}
                <Link href="/shop" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Shop
                </Link>

                {/* Main Product Section */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10">
                    {/* Image Gallery */}
                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                            {product.images?.[activeImage] ? (
                                <img
                                    src={product.images[activeImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                            )}
                            {((product.discountValue && product.discountValue > 0) || (product.discount && product.discount.value > 0)) && (
                                <span className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    {(product.discountType === 'PERCENT' || product.discount?.type === 'percent') ?
                                        `-${product.discountValue || product.discount?.value}% OFF` :
                                        `৳${product.discountValue || product.discount?.value} OFF`}
                                </span>
                            )}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? 'border-orange-500 shadow-md ring-2 ring-orange-200' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        {img ? (
                                            <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="w-full md:w-1/2 flex flex-col">
                        <div className="mb-6">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                                {product.isExpertVerified ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter">
                                        <Award size={14} /> Expert Verified / এক্সপার্ট ভেরিফাইড
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase tracking-tighter">
                                        Unchecked / অডিত করা হয়নি
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={20} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} strokeWidth={2} className={star <= Math.round(averageRating) ? "" : "text-gray-300"} />
                                    ))}
                                </div>
                                <span className="text-gray-500 font-medium text-sm">({reviews.length} Reviews)</span>
                            </div>

                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white transition-all">৳{dynamicPrice.toFixed(0)}</span>
                                {((product.discountValue && product.discountValue > 0) || (product.discount && product.discount.value > 0)) && (
                                    <span className="text-lg text-gray-400 line-through mb-1">৳{selectedWeight && product.weightOptions ? (product.weightOptions.find(o => o.label === selectedWeight)?.price || product.price) : product.price}</span>
                                )}
                            </div>

                            {/* Logic Driven Variation UI (Smart Rendering) */}
                            <div className="space-y-6 mb-8 border-b border-gray-100 dark:border-white/5 pb-8">
                                {/* Scenario A: Items with Weight Options */}
                                {product.weightOptions && product.weightOptions.length > 0 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Variant / ওজন নির্বাচন করুন</span>
                                            {product.expiryDate && (
                                                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                                    Expiry: {product.expiryDate}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {product.weightOptions.map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => setSelectedWeight(opt.label)}
                                                    className={`px-6 py-2.5 rounded-xl border-2 font-bold transition-all ${selectedWeight === opt.label
                                                        ? 'border-orange-600 bg-orange-50 text-orange-600 shadow-inner'
                                                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Scenario B: Electronics / Durables */}
                                {(product.category.toLowerCase().includes('electronics') || product.category.toLowerCase().includes('gadget')) && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase mb-2 flex items-center gap-2">
                                            <ShieldCheck size={16} /> Warranty Protection
                                        </h4>
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                                            Official {product.warranty || '1 Year'} Store Warranty
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-8 border-b border-gray-100 pb-8">
                                <p className="text-gray-900 font-bold text-xl mb-2 flex items-center gap-2">
                                    <FileText size={20} className="text-blue-600" /> Description / বিস্তারিত
                                </p>
                                <p className="text-gray-600 text-base leading-relaxed">
                                    {product.description || "No description available for this product."}
                                </p>
                                {product.descriptionBn && (
                                    <p className="text-gray-800 text-lg font-medium leading-relaxed bg-blue-50/30 p-4 rounded-2xl border-l-4 border-blue-500">
                                        {product.descriptionBn}
                                    </p>
                                )}
                            </div>

                            {/* 📐 Product Dimensions */}
                            {product.dimensions && (
                                <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-gray-900 font-bold text-base mb-3 flex items-center gap-2">
                                        <span className="text-lg">📐</span> Product Size / পণ্যের মাপ
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-5 py-3 rounded-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Length</span>
                                            <span className="text-xl font-black text-gray-900">{product.dimensions.length} cm</span>
                                        </div>
                                        <div className="flex items-center justify-center text-gray-400 font-black text-xl">×</div>
                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Width</span>
                                            <span className="text-xl font-black text-gray-900">{product.dimensions.width} cm</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Area</span>
                                            <span className="text-xl font-black text-gray-700">{(parseFloat(product.dimensions.length || '0') * parseFloat(product.dimensions.width || '0')).toFixed(2)} cm²</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 🔍 Transparency & Origin Section (QR System) */}
                            <div className="mb-10 p-6 bg-gradient-to-br from-zinc-900 to-black rounded-3xl text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:ring-4 hover:ring-orange-500/50 transition-all">
                                <Link href={`/verify/${productId}`} className="absolute inset-0 z-20" aria-label="View Verification Details"></Link>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 pointer-events-none group-hover:scale-[1.02] transition-transform duration-500">
                                    <div className="shrink-0 relative">
                                        <div className="w-32 h-32 bg-white p-2 rounded-2xl shadow-xl transition-transform group-hover:rotate-3 duration-500">
                                            {/* Generated QR Mockup */}
                                            <div className="w-full h-full border-4 border-black p-1 flex items-center justify-center">
                                                <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full opacity-80 backdrop-blur-md">
                                                    {[...Array(16)].map((_, i) => (
                                                        <div key={i} className={`rounded-sm ${(i % 3 === 0 || i % 7 === 0) ? 'bg-black' : 'bg-transparent'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white p-2 rounded-full shadow-lg group-hover:animate-bounce">
                                            <Search size={20} />
                                        </div>
                                        <p className="text-[10px] font-bold text-center mt-3 text-white/50 uppercase tracking-widest">Digital Twin ID: AH-{productId.slice(0, 6).toUpperCase()}</p>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-lg font-black text-white mb-2 tracking-tight flex items-center justify-center md:justify-start gap-2">
                                            <ShieldCheck className="text-orange-500" /> Transparency System / স্বচ্ছতা পদ্ধতি
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                            এই পণ্যটির প্রতিটি ধাপ ট্র্যাক করা হয়েছে। পণ্যের মোড়কে থাকা <span className="text-white font-bold">QR কোড</span> স্ক্যান করে আপনি এর উৎস, উৎপাদনের তারিখ এবং গুণগত মান যাচাই করতে পারেন।
                                        </p>
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5 inline-flex items-center gap-2 mt-4 hover:bg-white/20 transition-all pointer-events-auto">
                                            <span className="text-xs font-bold text-white uppercase tracking-widest pl-2">View Official Report</span>
                                            <div className="bg-orange-500 text-white p-1 rounded-lg">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Comparison / Options Section */}
                            {similarProducts.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <Award size={16} className="text-blue-600" />
                                        Available from Other Brands:
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {/* Current Brand */}
                                        <div className="flex flex-col p-3 rounded-2xl border-2 border-blue-600 bg-blue-50/50 min-w-[120px] shadow-sm">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase mb-1">{product.brand || 'Original'}</span>
                                            <span className="text-sm font-bold text-gray-900">৳{finalPrice.toFixed(0)}</span>
                                            <span className="text-[10px] text-blue-500 font-medium">Currently Viewing</span>
                                        </div>

                                        {/* Other Brands */}
                                        {similarProducts.map((p) => {
                                            const pPrice = p.discountValue && p.discountType === 'PERCENT'
                                                ? p.price - (p.price * (p.discountValue / 100))
                                                : p.discountValue && p.discountType === 'FIXED'
                                                    ? p.price - p.discountValue
                                                    : p.price;

                                            return (
                                                <Link
                                                    key={p.id}
                                                    href={`/product/${p.slug || p.id}`}
                                                    className="flex flex-col p-3 rounded-2xl border border-gray-200 hover:border-blue-400 hover:bg-white transition-all min-w-[120px] group"
                                                >
                                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-blue-600 uppercase mb-1">{p.brand || 'Other Brand'}</span>
                                                    <span className="text-sm font-bold text-gray-900">৳{pPrice.toFixed(0)}</span>
                                                    <span className="text-[10px] text-gray-400 group-hover:text-blue-400 font-medium">View Option</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 🧪 Lab Certification Bar */}
                            {product.labReportUrl && (
                                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-orange-600" />
                                        Quality Certification:
                                    </h4>
                                    <a
                                        href={product.labReportUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white border-2 border-orange-100 rounded-2xl hover:border-orange-500 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                                <Award size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none mb-1">View Lab Report / সার্টিফিকেট</p>
                                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Official Verification Document</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                                            <span>Open</span>
                                            <ExternalLink size={16} />
                                        </div>
                                    </a>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-200 rounded-xl">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="p-3 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="p-3 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAdded}
                                        className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-lg transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 ${isAdded
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-gray-900 text-white hover:bg-orange-600"
                                            }`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check size={20} /> Added to Cart
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={20} /> Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Add Review */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="text-orange-500" fill="currentColor" /> Write a Review
                        </h3>
                        {!user ? (
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center space-y-4">
                                <p className="text-sm font-bold text-blue-900">Sign in to share your experience with this product!</p>
                                <Link
                                    href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
                                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                                >
                                    Login to Review
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setUserRating(star)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    size={28}
                                                    className={`transition-all ${star <= userRating ? "text-yellow-400 fill-yellow-400 scale-110" : "text-gray-300 hover:text-gray-400"}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Comment</label>
                                    <textarea
                                        value={userComment}
                                        onChange={(e) => setUserComment(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                                        placeholder="Share your thoughts about this product..."
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                                >
                                    {isSubmittingReview ? "Submitting..." : <><Send size={18} /> Submit Review</>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Customer Reviews List */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews ({reviews.length})</h3>

                        {reviews.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p>No reviews yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {(review.userName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{review.userName || 'Verified User'}</h4>
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={3} className={i < review.rating ? "" : "text-gray-200"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {review.timestamp?.toDate ? new Date(review.timestamp.toDate()).toLocaleDateString() :
                                                    review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString() :
                                                        'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed ml-12 pl-12 text-pretty">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
