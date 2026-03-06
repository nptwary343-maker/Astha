'use client';

export const runtime = 'edge';
import { useState, useEffect } from 'react';
import { getFeaturedProducts, getHomeBanners } from '@/lib/db-utils';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, ChevronRight, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, b, c] = await Promise.all([
          getFeaturedProducts(),
          getHomeBanners(),
          import('@/lib/firebase').then(async ({ db, collection, getDocs }) => {
            const catSnap = await getDocs(collection(db, 'categories'));
            return catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          })
        ]);
        setProducts(p);
        setBanners(b);
        setCategories(c);
      } catch (e) {
        console.error("Home Page Data Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans selection:bg-orange-100">

      {/* 1. Sticky Top Search: Fixed white header with full-width search bar */}
      <header className="sticky top-0 z-[60] bg-white px-4 py-2 border-b border-gray-200 shadow-sm flex items-center gap-3">
        <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2 gap-2 border border-gray-200">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search Asthar Hat..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <Link href="/cart" className="relative p-1 text-gray-700">
          <ShoppingCart size={24} />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24">

        {/* 2. Hero Slider: Full-width mobile banner (aspect-[21/9]) */}
        <section className="w-full bg-white">
          <div className="w-full aspect-[21/9] relative overflow-hidden">
            {banners.length > 0 ? (
              <Image
                src={banners[currentBanner]?.imageUrl || banners[0]?.imageUrl}
                alt="Banner"
                fill
                className="object-cover transition-opacity duration-1000"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-orange-400 to-rose-400 animate-pulse flex items-center justify-center text-white font-bold opacity-80 text-xl italic uppercase tracking-widest">
                Flash Sale Live
              </div>
            )}

            {/* Visual Indicator (Dynamic Dots) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-300 ${currentBanner === idx ? 'bg-white w-4' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 3. Circle Categories: Horizontally scrollable row of small circular icon categories */}
        <section className="bg-white py-4 border-b border-gray-100">
          <div className="flex overflow-x-auto no-scrollbar gap-6 px-4">
            {categories.length > 0 ? categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.name.toLowerCase()}`}
                className="flex flex-col items-center gap-2 flex-shrink-0 active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center p-2 shadow-sm overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl font-black text-orange-500 italic">{cat.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{cat.name}</span>
              </Link>
            )) : (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-gray-100" />
                  <div className="w-10 h-2 bg-gray-100 rounded" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* ⚡ Promotional Ribbon */}
        <div className="bg-orange-500 text-white text-[10px] font-black py-2 px-4 flex justify-between items-center uppercase tracking-widest italic">
          <span>Free Delivery over ৳500</span>
          <ChevronRight size={14} />
        </div>

        {/* 4. Product Grid: 2-column grid */}
        <section className="bg-gray-100 p-2">
          <div className="grid grid-cols-2 gap-2">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded p-2 animate-pulse space-y-2">
                  <div className="aspect-square bg-gray-100" />
                  <div className="h-4 bg-gray-100 w-3/4" />
                  <div className="h-4 bg-gray-100 w-1/2" />
                </div>
              ))
            ) : products.length > 0 ? products.map((product) => (
              <div key={product.id} className="bg-white flex flex-col relative group active:scale-[0.98] transition-all">
                {/* Image Section: Full-width square */}
                <Link href={`/product/${product.slug || product.id}`} className="block aspect-square w-full relative overflow-hidden">
                  <Image
                    src={product.images?.[0] || ''}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {product.discountValue > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-1 py-0.5 rounded-sm">
                      -{product.discountValue}%
                    </span>
                  )}
                </Link>

                {/* Details: p-2 padding */}
                <div className="p-2 flex-1 flex flex-col gap-1">
                  <Link href={`/product/${product.slug || product.id}`} className="block">
                    <h3 className="text-[11px] font-medium text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 opacity-70">
                    <Star size={8} className="text-orange-400 fill-orange-400" />
                    <span className="text-[9px] font-bold text-gray-500">4.9 | 100 sold</span>
                  </div>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-sm font-black text-rose-600">৳{product.price}</span>
                    {product.oldPrice && (
                      <span className="text-[9px] text-gray-400 line-through">৳{product.oldPrice}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.images[0],
                        quantity: 1
                      });
                    }}
                    className="mt-2 w-full py-1.5 bg-yellow-400 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-colors shadow-sm"
                  >
                    Buy
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-2 py-20 text-center text-gray-400 font-bold uppercase text-xs">No Items Found</div>
            )}
          </div>
        </section>

      </main>

      {/* Ensuring the bottom has enough padding for sticky navigation bar (handled in AppShell) */}
      {/* But for this page context, we ensure the main content has pb-24 */}

    </div>
  );
}
