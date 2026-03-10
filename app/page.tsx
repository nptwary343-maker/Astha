'use client';

export const runtime = 'edge';
import { useState, useEffect } from 'react';
import { getFeaturedProducts } from '@/lib/db-utils';
import { db } from '@/lib/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Star, Zap, Flame, Grid, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [banner, setBanner] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bannerSnap = await getDoc(doc(db, 'settings', 'hero-banner'));
        if (bannerSnap.exists()) setBanner(bannerSnap.data());

        const catSnap = await getDocs(collection(db, 'categories'));
        const cats = catSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setCategories(cats);

        const prods = await getFeaturedProducts();
        setProducts(prods.slice(0, 15)); // Limit to keep layout clean, can add 'load more'
      } catch (e) {
        console.error("Home Page Data Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-orange-100 bg-[#f4f7f6]">

      {/* ========================================================= */}
      {/* 💻 DECORATED DESKTOP VERSION (Hidden on Mobile) */}
      {/* ========================================================= */}
      <main className="hidden md:block pb-24">
        
        {/* 1. Desktop Hero Grid Strategy (Banner + Side Deals) */}
        <section className="bg-white pb-10 pt-4 px-4 shadow-sm border-b border-gray-100">
          <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 h-[460px]">
            {/* Mega Categories Sidebar (Left 2.5 columns) */}
            <div className="col-span-3 lg:col-span-2 hidden md:flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-900 text-white font-black text-xs tracking-widest uppercase p-4 flex items-center gap-2">
                <Grid size={16} /> Categories
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                {categories.length > 0 ? categories.map((cat, i) => (
                  <Link href={`/shop?category=${cat.name.toLowerCase()}`} key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors group">
                     {cat.image ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-orange-200">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 shrink-0">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    <span className="text-xs font-bold text-gray-700 group-hover:text-orange-600 truncate">{cat.name}</span>
                  </Link>
                )) : (
                  [...Array(8)].map((_, i) => <div key={i} className="h-8 bg-gray-50 mx-4 my-2 rounded-lg animate-pulse" />)
                )}
              </div>
            </div>

            {/* Main Hero Slider (Center 7.5 columns) */}
            <div className="col-span-9 lg:col-span-7 h-full rounded-2xl overflow-hidden relative group shadow-lg shadow-orange-500/10">
              {banner?.backgroundImage || banner?.imageUrl ? (
                <>
                  <Image src={banner.backgroundImage || banner.imageUrl} alt={banner.title || 'Banner'} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent flex flex-col justify-center px-12">
                    {banner.title && <h2 className="text-white font-black text-5xl leading-tight drop-shadow-2xl capitalize max-w-lg mb-4">{banner.title}</h2>}
                    {banner.subtitle && <p className="text-white/90 text-sm font-medium max-w-md bg-black/20 backdrop-blur-md p-3 rounded-lg border border-white/10 decoration-clone">{banner.subtitle}</p>}
                    <Link href="/shop" className="mt-8 bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-3.5 rounded-full w-max flex items-center gap-2 shadow-xl shadow-orange-500/30 transition-all hover:pr-6 group/btn">
                      Shop Now <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="w-full h-full relative bg-slate-900 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-center px-12 z-10">
                    <div className="bg-white/10 w-max px-3 py-1 rounded-full border border-white/20 mb-4 backdrop-blur-sm">
                      <span className="text-[10px] font-black tracking-widest uppercase text-brand-primary">Setup Needed</span>
                    </div>
                    <h2 className="text-white font-black text-5xl leading-tight drop-shadow-2xl">Asthar Hat<br/>Premium Shop</h2>
                    <p className="text-white/80 text-sm font-medium mt-4 max-w-md">No banner has been uploaded yet. Please log into the Admin panel and set up your Hero Banners to replace this view.</p>
                    <Link href="/shop" className="mt-8 bg-white text-slate-900 font-black px-8 py-3.5 rounded-full w-max flex items-center gap-2 shadow-xl transition-all hover:scale-105">
                      Explore Shop
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Promo Sidebars (Right 2 columns) - E-commerce Standard */}
            <div className="hidden lg:flex flex-col gap-6 col-span-3 h-full">
              {/* Top Side Banner */}
              <div className={`flex-1 rounded-2xl bg-gradient-to-br from-${banner?.sideBanner1?.gradientFrom || 'purple-600'} to-${banner?.sideBanner1?.gradientTo || 'indigo-700'} p-6 relative overflow-hidden group shadow-lg shadow-indigo-500/20`}>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-2 text-white/80 font-black text-[10px] uppercase tracking-widest mb-2"><Zap size={14} className="text-yellow-400" /> {banner?.sideBanner1?.tag || 'Member Deal'}</div>
                <h3 className="text-white font-black text-2xl leading-none whitespace-pre-line">{banner?.sideBanner1?.title || 'Join the\nAstha Club'}</h3>
                {banner?.sideBanner1?.subtitle && <p className="text-white/60 text-xs mt-2 font-medium">{banner?.sideBanner1?.subtitle}</p>}
                <Link href={banner?.sideBanner1?.link || '/login'} className="mt-4 text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full inline-block transition-colors border border-white/20">{banner?.sideBanner1?.buttonText || 'Sign Up Free'}</Link>
              </div>
              
              {/* Bottom Side Banner */}
              <div className={`flex-1 rounded-2xl bg-gradient-to-br from-${banner?.sideBanner2?.gradientFrom || 'rose-500'} to-${banner?.sideBanner2?.gradientTo || 'orange-500'} p-6 relative overflow-hidden group shadow-lg shadow-rose-500/20`}>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-2 text-white/90 font-black text-[10px] uppercase tracking-widest mb-2"><Flame size={14} /> {banner?.sideBanner2?.tag || 'Trending'}</div>
                <h3 className="text-white font-black text-2xl leading-none whitespace-pre-line">{banner?.sideBanner2?.title || 'Flash\nSale'}</h3>
                {banner?.sideBanner2?.subtitle && <p className="text-white/80 text-xs mt-2 font-medium">{banner?.sideBanner2?.subtitle}</p>}
                <Link href={banner?.sideBanner2?.link || '/shop'} className="mt-4 text-xs font-bold text-[#f57224] bg-white hover:bg-gray-50 px-4 py-2 rounded-full inline-block transition-colors shadow-sm">{banner?.sideBanner2?.buttonText || 'View Deals'}</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Product Grid (5-column premium layout) */}
        <section className="py-12 max-w-[1600px] mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Just For You</h2>
              <div className="w-20 h-1.5 bg-brand-primary rounded-full mt-2"></div>
            </div>
            <Link href="/shop" className="text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1">View All <ChevronRight size={16} /></Link>
          </div>

          <div className="grid grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="aspect-square bg-slate-50 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-50 w-3/4 mb-2 rounded" />
                  <div className="h-6 bg-slate-50 w-1/2 rounded" />
                </div>
              ))
            ) : products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl flex flex-col relative group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-2xl border border-gray-100/50 hover:border-brand-primary/20 overflow-hidden">
                <Link href={`/product/${product.slug || product.id}`} className="block aspect-[4/5] w-full relative overflow-hidden bg-slate-50">
                  <Image src={product.images?.[0] || 'https://placehold.co/400x400?text=No+Image'} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out p-4" unoptimized />
                  {/* Glassmorphism Add-to-Cart Overlay */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button onClick={(e) => { e.preventDefault(); addToCart(product.id, 1); }} className="w-full bg-white/90 backdrop-blur-md hover:bg-brand-primary hover:text-white text-slate-900 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-colors border border-white/50 hover:border-brand-primary">
                      <ShoppingCart size={14} /> Quick Add
                    </button>
                  </div>
                  {product.discountValue > 0 && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg shadow-red-600/20">-{product.discountValue}%</span>
                  )}
                </Link>

                <div className="p-5 flex-1 flex flex-col gap-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.category}</p>
                  <Link href={`/product/${product.slug || product.id}`} className="block">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-brand-primary transition-colors">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-900 tracking-tight italic">৳{product.price}</span>
                    {product.oldPrice && <span className="text-xs text-slate-400 line-through font-bold">৳{product.oldPrice}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* 📱 APP-LIKE MOBILE VERSION (Hidden on Desktop) */}
      {/* ========================================================= */}
      <main className="md:hidden pb-24">
        
        {/* Mobile App Banner - Full Bleed */}
        <section className="w-full relative shadow-sm">
          <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-900">
            {banner?.backgroundImage || banner?.imageUrl ? (
              <>
                <Image src={banner.backgroundImage || banner.imageUrl} alt={banner.title || 'Mobile Banner'} fill className="object-cover" priority unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-5">
                   {banner.title && <h2 className="text-white font-black text-3xl leading-none italic uppercase tracking-tighter mb-2">{banner.title}</h2>}
                   {banner.subtitle && <p className="text-white/80 text-xs font-semibold mb-3">{banner.subtitle}</p>}
                   <Link href="/shop" className="bg-white text-slate-900 font-black text-xs px-5 py-2.5 rounded-full w-max shadow-lg mb-1">Explore Now</Link>
                </div>
              </>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-white font-bold bg-slate-900 animate-pulse">AstharHat</div>
            )}
            {/* Soft curve connection to categories */}
            <div className="absolute bottom-0 left-0 w-full h-4 bg-[#f4f7f6] rounded-t-[20px]"></div>
          </div>
        </section>

        {/* Mobile Horizontal Categories (AliExpress Style) */}
        <section className="bg-[#f4f7f6] pt-1 pb-4">
          <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
            {categories.length > 0 ? categories.map((cat, i) => (
              <Link href={`/shop?category=${cat.name.toLowerCase()}`} key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[4.5rem] active:scale-95 transition-transform">
                <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 flex items-center justify-center p-[6px] shadow-sm overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl font-black text-slate-300">{cat.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter text-center leading-tight truncate w-full">{cat.name}</span>
              </Link>
            )) : (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 animate-pulse w-[4.5rem]">
                  <div className="w-16 h-16 rounded-3xl bg-gray-200" />
                  <div className="w-10 h-2 bg-gray-200 rounded" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mobile Ribbon */}
        <div className="mx-4 mb-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-black py-2.5 px-4 flex justify-between items-center uppercase tracking-widest italic rounded-xl shadow-md shadow-orange-500/20">
          <span>Free Delivery over ৳500</span>
          <ChevronRight size={14} className="opacity-70" />
        </div>

        {/* Mobile Compact Product Masonry Grid (2 columns) */}
        <section className="px-3">
          <div className="flex items-center justify-between mb-3 px-1">
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-1"><Flame size={18} className="text-orange-500"/> Hot Deals</h2>
             <Link href="/shop" className="text-[10px] font-black uppercase text-slate-400">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-2 animate-pulse">
                  <div className="aspect-square bg-slate-100 rounded-xl mb-2" />
                  <div className="h-3 bg-slate-100 w-3/4 mb-1" />
                  <div className="h-4 bg-slate-100 w-1/2" />
                </div>
              ))
            ) : products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl flex flex-col relative overflow-hidden active:scale-[0.98] transition-transform shadow-sm border border-gray-100/80">
                <Link href={`/product/${product.slug || product.id}`} className="block aspect-square w-full relative bg-slate-50">
                  <Image src={product.images?.[0] || 'https://placehold.co/400x400?text=No+Image'} alt={product.name} fill className="object-cover p-2" unoptimized />
                  {product.discountValue > 0 && (
                    <span className="absolute top-2 left-2 bg-brand-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none shadow-sm shadow-brand-primary/20">
                      -{product.discountValue}%
                    </span>
                  )}
                </Link>

                <div className="p-3 flex-1 flex flex-col">
                  <Link href={`/product/${product.slug || product.id}`} className="block mb-1">
                    <h3 className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">{product.name}</h3>
                  </Link>

                  <div className="mt-auto pt-1 flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.oldPrice && <span className="text-[9px] text-slate-400 line-through leading-none decoration-slate-300">৳{product.oldPrice}</span>}
                      <span className="text-sm font-black text-slate-950 tracking-tight italic">৳{product.price}</span>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); addToCart(product.id, 1); }} className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors">
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  );
}

