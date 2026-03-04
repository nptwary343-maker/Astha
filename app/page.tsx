'use client';
export const runtime = 'edge';
import { getFeaturedProducts, getHomeBanners, getProductBlocks } from '@/lib/db-utils';
import HeroBanner from '@/components/HeroBanner';
import ProductGrid from '@/components/ProductGrid';
import HomeScanSection from '@/components/HomeScanSection';
import HomepageActionBar from '@/components/HomepageActionBar';
import SafeBannerRenderer from '@/components/SafeBannerRenderer';
import { CATEGORIES } from '@/data/static-content';
import Image from 'next/image';
import Link from 'next/link';
import { MENU_ITEMS } from '@/components/navigation-config';
import TrustBar from '@/components/TrustBar';
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from '@/context/LocationContext';
import { useState, useEffect } from 'react';
import ParticleHeroBanners from '@/components/home/ParticleHeroBanners';
import FlashSaleBanner from '@/components/FlashSaleBanner';
import RecentlyViewed from '@/components/RecentlyViewed';
import FlashSaleHeroBanner from '@/components/FlashSaleHeroBanner';
import MobileMinimalistHeader, { MobileMinimalistCategories } from '@/components/MobileMinimalistView';
import { Award, Ticket, Users, TrendingUp, ChevronRight } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [categorySettings, setCategorySettings] = useState({ shape: 'rounded', columnsMobile: 1, columnsDesktop: 3 });
  const { selectedLocationId } = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, b, bl, bl_cat] = await Promise.all([
          getFeaturedProducts(),
          getHomeBanners(),
          getProductBlocks(selectedLocationId),
          import('@/lib/firebase').then(async ({ db, collection, getDocs, doc, getDoc }) => {
            const catSnap = await getDocs(collection(db, 'categories'));
            const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

            const settingsSnap = await getDoc(doc(db, 'settings', 'category-display'));
            const settings = settingsSnap.exists() ? settingsSnap.data() : { shape: 'rounded', columnsMobile: 1, columnsDesktop: 3 };

            return { cats, settings };
          })
        ]);
        setProducts(p);
        setDbCategories(bl_cat.cats);
        setCategorySettings(bl_cat.settings as any);
        const newHomeBanner = {
          id: 'manual-shop-home',
          title: 'Shop From Home & Save',
          subtitle: 'Enjoy exclusive offers from top brands only available online today!',
          imageUrl: '/banners/shop-from-home.png',
          backgroundImage: '/banners/shop-from-home.png',
          buttonText: 'Order Now',
          buttonLink: '/shop',
          active: true,
          order: -1
        };

        setBanners([newHomeBanner, ...b]);
        setBlocks(bl);
      } catch (e) {
        console.error("Home Page Data Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedLocationId]);

  return (
    <div className="min-h-screen bg-slate-50 text-text-main selection:bg-brand-primary/10">

      {/* 📱 MOBILE MINIMALIST HEADER - Only visible on small screens */}
      <MobileMinimalistHeader />

      {/* NEW: Separate Particle Feature – Zero DB hits */}
      <div className="block">
        <ParticleHeroBanners />
      </div>

      {/* Hero & Banners Section */}
      <div className="relative z-10 space-y-4">
        <FlashSaleBanner />
        <div className="block">
          <SafeBannerRenderer />
        </div>
        <HeroBanner customBanners={banners} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 space-y-12 md:space-y-20 pb-24">

        {/* 🛡️ Trust Signals Section */}
        <section className="relative z-20">
          <TrustBar />
        </section>

        {/* 🧩 Quick Action Bar - Simplified for Mobile */}
        <HomepageActionBar />

        <div className="space-y-12 md:space-y-24">

          {/* 📱 MOBILE CATEGORIES - Horizontal Scroll */}
          <MobileMinimalistCategories categories={dbCategories.length > 0 ? dbCategories : CATEGORIES.slice(0, 10)} />

          {/* Categories Section - Visible on all screens now */}
          <section className="relative z-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-brand-primary">Curated Collections</span>
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 italic uppercase">
                  Shop by <span className="text-brand-primary">Category</span>
                </h2>
              </div>
              <div className="flex-1 h-px bg-border-light hidden md:block mb-4 mx-8" />
              <Link href="/shop" className="text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors flex items-center justify-center gap-1 group uppercase tracking-widest">
                Explore All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className={`grid gap-3 md:gap-8 ${categorySettings.columnsMobile === 2 || true ? 'grid-cols-2' : 'grid-cols-1'
              } ${categorySettings.columnsDesktop === 2 ? 'lg:grid-cols-2' :
                categorySettings.columnsDesktop === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
              }`}>
              {loading ? (
                // 🦴 PREMIUM SKELETON LOADING - "Feedback" Principle
                [...Array(6)].map((_, idx) => (
                  <div key={`skel-${idx}`} className="bg-white p-8 rounded-[3rem] border border-border-light shadow-sm flex flex-col h-full animate-pulse">
                    <div className="h-6 w-32 bg-slate-100 rounded-lg mb-6" />
                    <div className="aspect-[16/10] bg-slate-50 rounded-[2rem] border border-slate-100 mb-8" />
                    <div className="mt-auto flex gap-3 overflow-hidden">
                      <div className="h-8 w-20 bg-slate-50 rounded-xl" />
                      <div className="h-8 w-20 bg-slate-50 rounded-xl" />
                    </div>
                  </div>
                ))
              ) : dbCategories.length > 0 ? dbCategories.map((cat, idx) => {
                const menuItem = MENU_ITEMS.find(m => m.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase()));
                const subs = cat.subcategories && cat.subcategories.length > 0 ? cat.subcategories.slice(0, 6) : menuItem?.subItems?.slice(0, 4) || [];

                return (
                  <div key={cat.id} className={`group bg-white p-8 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full border border-border-light relative overflow-hidden active:scale-[0.98] ${categorySettings.shape === 'square' ? 'rounded-none' :
                    categorySettings.shape === 'pill' ? 'rounded-full' : 'rounded-[3rem]'
                    }`}>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px]" />

                    <Link href={`/shop?category=${cat.id}`} className="block relative z-10 group/header">
                      <h3 className="text-xl font-bold mb-6 group-hover:text-brand-primary transition-colors text-slate-800">
                        {cat.name}
                      </h3>

                      <div className={`relative aspect-[16/10] mb-8 overflow-hidden bg-ui-bg border border-border-light flex items-center justify-center p-6 sm:p-10 shadow-inner group/img ${categorySettings.shape === 'square' ? 'rounded-none' :
                        categorySettings.shape === 'pill' ? 'rounded-full' : 'rounded-[2rem]'
                        }`}>
                        {cat.image ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              fill
                              unoptimized
                              className="object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl px-4 py-2"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary font-black text-2xl">
                            {cat.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="mt-auto space-y-4 relative z-10">
                      {subs.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {subs.map((sub: any) => (
                            <Link
                              key={sub.name}
                              href={sub.slug ? `/shop?category=${sub.slug}` : sub.href}
                              className="text-xs font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 transition-all hover:opacity-80"
                              style={{
                                color: sub.color || '#475569',
                                borderColor: sub.color ? `${sub.color}40` : '#f1f5f9'
                              }}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-slate-500">Discover the curated {cat.name} line</p>
                      )}

                      <Link
                        href={`/shop?category=${cat.id}`}
                        className="flex items-center justify-between group/link py-2 mt-4"
                      >
                        <span className="text-sm font-semibold text-slate-800 group-hover/link:text-brand-primary transition-colors">Shop Selection</span>
                        <div className="w-8 h-8 rounded-full bg-ui-bg flex items-center justify-center group-hover/link:bg-brand-primary group-hover/link:text-white transition-all">
                          <ChevronRight size={14} />
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              }) : (
                CATEGORIES.slice(0, 6).map((cat, idx) => {
                  const menuItem = MENU_ITEMS.find(m => m.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase()));
                  const subs = (cat as any).subcategories && (cat as any).subcategories.length > 0 ? (cat as any).subcategories.slice(0, 6) : menuItem?.subItems?.slice(0, 4) || [];

                  return (
                    <div key={cat.id} className="group bg-white p-8 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full border border-border-light rounded-[3rem] relative overflow-hidden active:scale-[0.98]">
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px]" />

                      <Link href={`/shop?category=${cat.id}`} className="block relative z-10 group/header">
                        <h3 className="text-xl font-bold mb-6 group-hover:text-brand-primary transition-colors text-slate-800">
                          {cat.name}
                        </h3>

                        <div className="relative aspect-[16/10] mb-8 overflow-hidden bg-ui-bg rounded-[2rem] border border-border-light flex items-center justify-center p-6 sm:p-10 shadow-inner group/img">
                          {cat.image ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                unoptimized
                                className="object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl px-4 py-2"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary font-black text-2xl">
                              {cat.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="mt-auto space-y-4 relative z-10">
                        {subs.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {subs.map((sub: any) => (
                              <Link
                                key={sub.name}
                                href={sub.slug ? `/shop?category=${sub.slug}` : sub.href}
                                className="text-xs font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 transition-all hover:opacity-80"
                                style={{
                                  color: sub.color || '#475569',
                                  borderColor: sub.color ? `${sub.color}40` : '#f1f5f9'
                                }}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-slate-500">Discover the curated {cat.name} line</p>
                        )}

                        <Link
                          href={`/shop?category=${cat.id}`}
                          className="flex items-center justify-between group/link py-2 mt-4"
                        >
                          <span className="text-sm font-semibold text-slate-800 group-hover/link:text-brand-primary transition-colors">Shop Selection</span>
                          <div className="w-8 h-8 rounded-full bg-ui-bg flex items-center justify-center group-hover/link:bg-brand-primary group-hover/link:text-white transition-all">
                            <ChevronRight size={14} />
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* ⚡ DHAMAKA FLASH SALE BANNER - Middle Section */}
          <FlashSaleHeroBanner />

          {/* 📍 Dynamic Product Blocks based on Location */}
          {blocks.map(block => (
            <section key={block.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-baseline justify-between mb-12">
                <div className="flex items-center gap-6">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">{block.title}</h2>
                  {block.blockType === 'deals' && (
                    <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full shadow-sm">Exclusive</div>
                  )}
                </div>
                <Link href="/shop" className="text-sm font-semibold text-slate-500 hover:text-brand-primary flex items-center gap-1 group">
                  Explore <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <ProductGrid initialProducts={products.filter(p => block.productIds?.includes(p.id))} />
            </section>
          ))}

          {/* Feature Section - QR Scanner */}
          <section className="bg-text-main p-8 md:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] rounded-[4rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-brand-primary/20 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl group-hover:bg-brand-accent/10 transition-colors duration-1000" />
            <HomeScanSection />
          </section>

          {/* Standard Featured Grid (Fallback/Main) */}
          <section className="pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-border-light pb-8">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Curated Spotlight</span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">Featured <span className="text-brand-primary">Assets</span></h2>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-slate-500 hover:text-brand-primary flex items-center gap-1 group">
                Full Catalog <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <ProductGrid initialProducts={products} />
          </section>
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
}
