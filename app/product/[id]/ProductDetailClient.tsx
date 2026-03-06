'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc, limit } from 'firebase/firestore';
import { ShoppingCart, Star, ArrowLeft, Minus, Plus, Check, ShieldCheck, Search } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

// --- Types ---
interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
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
}

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    timestamp: any;
}

// --- Sub-Components ---

const Header = () => (
    <header className="w-full h-14 bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
            <Link href="/shop" className="text-white p-1">
                <ArrowLeft size={24} />
            </Link>
            <span className="text-white font-bold text-lg tracking-tight">Asthar Hat</span>
        </div>
        <div className="flex items-center gap-4 text-white">
            <Search size={22} className="cursor-pointer" />
            <Link href="/cart" className="relative p-1">
                <ShoppingCart size={22} />
            </Link>
        </div>
    </header>
);

const ImageGallery = ({ images, activeImage, setActiveImage, discountTag }: any) => (
    <section className="w-full bg-white relative border-b border-slate-100">
        <div className="w-full aspect-square flex items-center justify-center">
            {images?.[activeImage] ? (
                <img src={images[activeImage]} alt="Product" className="w-full h-full object-contain" />
            ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 text-xs font-bold">No Image</div>
            )}
        </div>

        {discountTag && (
            <div className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-sm shadow-sm ring-1 ring-white/20">
                {discountTag}
            </div>
        )}

        {images?.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-t border-slate-50">
                {images.map((img: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-12 h-12 flex-shrink-0 border rounded-sm transition-all ${activeImage === idx ? 'border-orange-500 ring-1 ring-orange-500' : 'border-slate-200'}`}
                    >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        )}
    </section>
);

const PriceTitleSection = ({ price, originalPrice, name, averageRating, reviewCount }: any) => (
    <section className="p-4 bg-white border-b border-slate-100 space-y-1">
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600">৳{price.toFixed(0)}</span>
            {originalPrice > price && (
                <span className="text-sm text-slate-400 line-through font-medium">৳{originalPrice}</span>
            )}
        </div>
        <h1 className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
            {name}
        </h1>
        <div className="flex items-center gap-1 mt-1">
            <div className="flex text-orange-400">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill={i < Math.floor(averageRating) ? "currentColor" : "none"} strokeWidth={3} />
                ))}
            </div>
            <span className="text-[10px] text-blue-600 font-bold ml-1">{reviewCount} Ratings</span>
        </div>
    </section>
);

const SizeSelector = ({ selected, onSelect }: any) => (
    <section className="p-4 bg-white border-b border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Model Size Selection</p>
        <div className="grid grid-cols-4 gap-2">
            {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                    key={size}
                    onClick={() => onSelect(size)}
                    className={`py-3 border rounded text-xs font-bold transition-all ${selected === size
                        ? 'border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                >
                    {size}
                </button>
            ))}
        </div>
    </section>
);

// --- Main Component ---

export default function ProductDetailClient({ product, productId }: { product: Product, productId: string }) {
    const { addItem } = useCart();
    const { user } = useAuth();
    const pathname = usePathname();
    const { addToRecentlyViewed } = useRecentlyViewed();

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userComment, setUserComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [dynamicPrice, setDynamicPrice] = useState(product.price);

    useEffect(() => {
        if (product) {
            addToRecentlyViewed({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                category: product.category,
                slug: product.slug
            });

            // Calculate Initial Discounted Price
            let final = product.price;
            const discount = product.discountType || product.discount?.type;
            const value = product.discountValue || product.discount?.value || 0;
            if (discount === 'PERCENT' || discount === 'percent') final = product.price - (product.price * value / 100);
            else if (discount === 'FIXED' || discount === 'flat') final = product.price - value;
            setDynamicPrice(final);
        }
    }, [product, productId]);

    useEffect(() => {
        const qReviews = query(collection(db, 'products', productId, 'reviews'), orderBy('timestamp', 'desc'));
        const qSimilar = query(collection(db, 'products'), limit(10));

        const unsubReviews = onSnapshot(qReviews, (snap) => {
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        });
        const unsubSimilar = onSnapshot(qSimilar, (snap) => {
            setSimilarProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)).filter(p => p.id !== productId && p.category === product.category));
        });

        return () => { unsubReviews(); unsubSimilar(); };
    }, [productId, product.category]);

    const handleAddToCart = () => {
        addItem({ id: product.id, name: product.name, price: dynamicPrice, image: product.images[0], quantity, weight: selectedSize || undefined });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isSubmittingReview) return;
        setIsSubmittingReview(true);
        try {
            await addDoc(collection(db, 'products', productId, 'reviews'), { userName: user.displayName || 'Anonymous', comment: userComment, rating: 5, timestamp: serverTimestamp(), userId: user.uid });
            setUserComment('');
        } finally { setIsSubmittingReview(false); }
    };

    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    const discountTag = (product.discountType || product.discount?.type) ?
        ((product.discountType === 'PERCENT' || product.discount?.type === 'percent') ? `-${product.discountValue || product.discount?.value}%` : `৳${product.discountValue || product.discount?.value} OFF`) : null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
            <Header />

            <main className="flex-1 pb-24">
                <ImageGallery
                    images={product.images}
                    activeImage={activeImage}
                    setActiveImage={setActiveImage}
                    discountTag={discountTag}
                />

                <PriceTitleSection
                    price={dynamicPrice}
                    originalPrice={product.price}
                    name={product.name}
                    averageRating={averageRating}
                    reviewCount={reviews.length}
                />

                <SizeSelector selected={selectedSize} onSelect={setSelectedSize} />

                {/* Stock & Qty */}
                <section className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                    <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 bg-slate-50 border-r border-slate-200"><Minus size={12} /></button>
                        <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 bg-slate-50 border-l border-slate-200"><Plus size={12} /></button>
                    </div>
                </section>

                {/* Description */}
                <section className="p-4 bg-white border-b border-slate-100 space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Specifications</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{product.description || 'Verified product from Asthar Hat boutique.'}</p>
                    <div className="bg-slate-50 p-3 rounded-sm flex items-center gap-3 border border-slate-100 mt-2">
                        <ShieldCheck className="text-green-600" size={18} />
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">100% Guaranteed Transaction Quality</p>
                    </div>
                </section>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <section className="p-4 bg-white border-b border-slate-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">You Might Also Like</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {similarProducts.map((p) => (
                                <Link key={p.id} href={`/product/${p.slug || p.id}`} className="block border border-slate-100 rounded-sm p-2 bg-white active:bg-slate-50">
                                    <div className="aspect-square bg-slate-50 mb-2 overflow-hidden">
                                        <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="text-[10px] text-slate-700 line-clamp-1">{p.name}</h4>
                                    <p className="text-xs font-bold text-rose-600">৳{p.price}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Reviews */}
                <section className="p-4 bg-slate-50 border-t border-slate-200 mt-2">
                    <h2 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4">Customer Reviews</h2>
                    {!user ? (
                        <Link href={`/login?redirect=${encodeURIComponent(pathname || '/')}`} className="block text-center py-4 border border-dashed border-slate-300 rounded text-[10px] font-bold text-slate-500 bg-white">LOGIN TO REVIEW</Link>
                    ) : (
                        <form onSubmit={submitReview} className="space-y-2 mb-6">
                            <textarea value={userComment} onChange={e => setUserComment(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-orange-500 outline-none h-20" placeholder="Describe your experience..." required />
                            <button type="submit" disabled={isSubmittingReview} className="w-full py-2 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest">Share Feedback</button>
                        </form>
                    )}
                    <div className="space-y-3">
                        {reviews.map(r => (
                            <div key={r.id} className="bg-white p-3 border border-slate-100 rounded-sm shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[10px] text-slate-700">{r.userName}</span>
                                    <div className="flex text-orange-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={8} fill={i < r.rating ? 'currentColor' : 'none'} strokeWidth={3} />)}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-normal">{r.comment}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Sticky Action Bar */}
            <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-3 z-50">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`flex-1 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all ${isAdded ? 'bg-green-600 text-white' : 'bg-yellow-400 text-slate-950 shadow-sm active:scale-95'}`}
                    >
                        {isAdded ? 'In Cart' : 'Add to Cart'}
                    </button>
                    <button className="flex-1 py-4 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-sm active:scale-95">
                        Buy Now
                    </button>
                </div>
            </footer>
        </div>
    );
}
