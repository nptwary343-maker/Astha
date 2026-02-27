'use client';
export const runtime = 'edge';
import { getFeaturedProducts, getHomeBanners, getProductBlocks } from '@/lib/db-utils';
import HeroBanner from '@/components/HeroBanner';
import ProductGrid from '@/components/ProductGrid';
import HomeScanSection from '@/components/HomeScanSection';
import HomepageActionBar from '@/components/HomepageActionBar';
import SafeBannerRenderer from '@/components/SafeBannerRenderer';
import { CATEGORIES } from '@/data/static-content';
import Link from 'next/link';
import { MENU_ITEMS } from '@/components/navigation-config';
import TrustBar from '@/components/TrustBar';
import RewardSection from '@/components/RewardSection';
import { m, AnimatePresence } from "framer-motion";
import { useLocation } from '@/context/LocationContext';
import { useState, useEffect } from 'react';
import ParticleHeroBanners from '@/components/home/ParticleHeroBanners';
import { Award, Ticket, Users, TrendingUp, ChevronRight } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const { selectedLocationId } = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, b, bl] = await Promise.all([
          getFeaturedProducts(),
          getHomeBanners(),
          getProductBlocks(selectedLocationId)
        ]);
        setProducts(p);
        setBanners(b);
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

      {/* NEW: Separate Particle Feature – Zero DB hits */}
      <ParticleHeroBanners />

      {/* Hero & Banners Section */}
      <div className="relative z-10">
        <SafeBannerRenderer />
        <HeroBanner hasSpecialCoupon={true} customBanners={banners} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 space-y-20 pb-24 -mt-10">

        {/* 🛡️ Trust Signals Section */}
        <section className="relative z-20">
          <TrustBar />
        </section>

        <div className="space-y-24">
          {/* 🧩 Quick Action Bar */}
          <HomepageActionBar />

          {/* Categories Section - Modern High-End Architecture */}
          <section className="relative z-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Curated Collections</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-text-main italic uppercase">
                  Shop by <span className="text-brand-primary">Category</span>
                </h2>
              </div>
              <div className="flex-1 h-px bg-border-light hidden md:block mb-4 mx-8" />
              <Link href="/shop" className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-brand-primary transition-colors flex items-center gap-2">
                Explore All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {CATEGORIES.slice(0, 6).map((cat, idx) => {
                const menuItem = MENU_ITEMS.find(m => m.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase()));
                const subs = menuItem?.subItems?.slice(0, 4) || [];

                return (
                  <div key={cat.id} className="group bg-white p-8 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full border border-border-light rounded-[3rem] relative overflow-hidden active:scale-[0.98]">
                    {/* Abstract Grid background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px]" />

                    <h3 className="text-2xl font-black mb-6 group-hover:text-brand-primary transition-colors uppercase italic tracking-tighter relative z-10">
                      {cat.name}
                    </h3>

                    <div className="relative aspect-[16/10] mb-8 overflow-hidden bg-ui-bg rounded-[2rem] border border-border-light flex items-center justify-center p-6 sm:p-10 shadow-inner group/img">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary font-black text-2xl">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto space-y-4 relative z-10">
                      {subs.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {subs.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="text-[10px] font-black text-text-muted hover:text-brand-primary uppercase tracking-widest bg-ui-bg px-3 py-2 rounded-xl border border-border-light/50 transition-all hover:border-brand-primary/30"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Discover the curated {cat.name} line</p>
                      )}

                      <Link
                        href={`/shop?category=${cat.id}`}
                        className="flex items-center justify-between group/link py-2 mt-4"
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest text-text-main group-hover/link:text-brand-primary transition-colors">Shop Selection</span>
                        <div className="w-8 h-8 rounded-full bg-ui-bg flex items-center justify-center group-hover/link:bg-brand-primary group-hover/link:text-white transition-all">
                          <ChevronRight size={14} />
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 📍 Dynamic Product Blocks based on Location */}
          {blocks.map(block => (
            <section key={block.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-baseline justify-between mb-12">
                <div className="flex items-center gap-6">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-main uppercase italic">{block.title}</h2>
                  {block.blockType === 'deals' && (
                    <div className="px-4 py-1.5 bg-brand-accent text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-brand-accent/20 animate-pulse">Exclusive</div>
                  )}
                </div>
                <Link href="/shop" className="text-xs font-black text-text-muted hover:text-brand-primary uppercase tracking-widest flex items-center gap-1 group">
                  Explore <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Curated Spotlight</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-main uppercase italic">Featured <span className="text-brand-primary">Assets</span></h2>
              </div>
              <Link href="/shop" className="text-xs font-black text-text-muted hover:text-brand-primary uppercase tracking-widest flex items-center gap-1 group">
                Full Catalog <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <ProductGrid initialProducts={products} />
          </section>
        </div>
      </div>

      {/* NEW: Coupons & Rewards Section */}
      <RewardSection />


    </div>
  );
}
