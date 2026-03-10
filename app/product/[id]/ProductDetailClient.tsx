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
    const { addToCart } = useCart();
    const { user } = useAuth();
    const pathname = usePathname();
    const { addProduct: addToRecentlyViewed } = useRecentlyViewed();

    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userComment, setUserComment] = useState('');
    const [rating, setRating] = useState(5);
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
        addToCart(product.id, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isSubmittingReview) return;
        setIsSubmittingReview(true);
        try {
            await addDoc(collection(db, 'products', productId, 'reviews'), {
                userName: user.displayName || 'Anonymous',
                comment: userComment,
                rating: rating,
                timestamp: serverTimestamp(),
                userId: user.uid
            });
            setUserComment('');
            setRating(5);
            // Show a success state or toast here if available
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setIsSubmittingReview(false);
        }
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


                {/* Interactive TABS for Description & Details */}
                <section className="bg-white mt-2 border-y border-slate-100">
                    <div className="flex border-b border-slate-100">
                        <button 
                             onClick={() => setActiveTab('description')} 
                             className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-center transition-all ${activeTab === 'description' ? 'text-brand-primary border-b-2 border-brand-primary bg-slate-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            Description
                        </button>
                        <button 
                             onClick={() => setActiveTab('details')} 
                             className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-center transition-all ${activeTab === 'details' ? 'text-brand-primary border-b-2 border-brand-primary bg-slate-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            More Details
                        </button>
                    </div>

                    <div className="p-4 min-h-[150px]">
                        {activeTab === 'description' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Product Overview</h3>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                    {product.description || 'This is a premium, verified product directly sourced by Asthar Hat. Get the best quality guaranteed with fast delivery to your door.'}
                                </p>
                                <div className="bg-green-50/50 p-3 rounded-xl flex items-center gap-3 border border-green-100/50 mt-4">
                                    <ShieldCheck className="text-green-600 shrink-0" size={20} />
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Asthar Hat Authenticity</p>
                                        <p className="text-[9px] font-medium text-green-600 mt-0.5">100% Guaranteed Transaction Quality</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Specifications</h3>
                                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                                        <div className="w-1/3 p-3 font-bold text-slate-500 border-r border-slate-100">Category</div>
                                        <div className="w-2/3 p-3 text-slate-700 font-medium capitalize">{product.category || 'N/A'}</div>
                                    </div>
                                    <div className="flex border-b border-slate-100">
                                        <div className="w-1/3 p-3 font-bold text-slate-500 border-r border-slate-100">Brand</div>
                                        <div className="w-2/3 p-3 text-slate-700 font-medium">{product.brand || 'Asthar Hat Selection'}</div>
                                    </div>
                                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                                        <div className="w-1/3 p-3 font-bold text-slate-500 border-r border-slate-100">Stock Status</div>
                                        <div className="w-2/3 p-3 text-slate-700 font-medium">{product.stock > 0 ? `${product.stock} Available` : 'Out of Stock'}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-1/3 p-3 font-bold text-slate-500 border-r border-slate-100">SKU</div>
                                        <div className="w-2/3 p-3 text-slate-700 font-mono text-[10px] uppercase">AST-{product.id.slice(0, 8)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Specifications</h3>


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
                        <Link href={`/login?redirect=${encodeURIComponent(pathname || '/')}`} className="block text-center py-6 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold text-slate-500 bg-white hover:bg-slate-50 transition-colors uppercase tracking-widest">
                            PLEASE LOGIN TO WRITE A REVIEW
                        </Link>
                    ) : (
                        <form onSubmit={submitReview} className="space-y-4 mb-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="p-1 transition-transform active:scale-90"
                                        >
                                            <Star
                                                size={24}
                                                fill={s <= rating ? "#f59e0b" : "none"}
                                                className={s <= rating ? "text-amber-500" : "text-slate-300"}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Experience</label>
                                <textarea
                                    value={userComment}
                                    onChange={e => setUserComment(e.target.value)}
                                    className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none h-24 transition-all resize-none"
                                    placeholder="Tell others what you think about this product..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmittingReview || !userComment.trim()}
                                className="w-full py-3 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:translate-y-0.5"
                            >
                                {isSubmittingReview ? 'SENDING...' : 'PUBLISH REVIEW'}
                            </button>
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
