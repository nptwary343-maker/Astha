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
import PartnerMarquee from '@/components/PartnerMarquee';
import RewardSection from '@/components/RewardSection';
import { m, AnimatePresence } from "framer-motion";
import { useLocation } from '@/context/LocationContext';
import { useState, useEffect } from 'react';
import ParticleHeroBanners from '@/components/home/ParticleHeroBanners';

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
    <div className="min-h-screen bg-gray-50 text-blue-900 selection:bg-orange-500/30">

      {/* NEW: Separate Particle Feature – Zero DB hits */}
      <ParticleHeroBanners />

      {/* Hero & Banners Section */}
      <div className="relative z-10">
        <SafeBannerRenderer />
        <HeroBanner hasSpecialCoupon={true} customBanners={banners} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 space-y-12 pb-24">

        {/* 🛡️ Trust Signals Section */}
        <section className="mt-[-2rem] md:mt-[-4.5rem] relative z-20">
          <TrustBar />
        </section>

        <div className="space-y-12">
          {/* 🧩 Quick Action Bar */}
          <HomepageActionBar />

          {/* Categories Section - Amazon Style Square Cards */}
          <section className="relative z-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-900">
                Shop by Category
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.slice(0, 6).map((cat, idx) => {
                const menuItem = MENU_ITEMS.find(m => m.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase()));
                const subs = menuItem?.subItems?.slice(0, 4) || [];

                return (
                  <div key={cat.id} className="group bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 rounded-3xl">
                    <h3 className="text-xl font-bold mb-4 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{cat.name}</h3>

                    <div className="relative aspect-square mb-6 overflow-hidden bg-gray-50 flex items-center justify-center p-4 rounded-2xl">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto space-y-2">
                      {subs.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {subs.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="text-xs font-semibold text-blue-600 hover:text-orange-600 hover:underline"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mb-4 italic">Discover premium {cat.name} products</p>
                      )}
                      <Link
                        href={`/shop?category=${cat.id}`}
                        className="block text-sm font-bold text-blue-600 hover:text-orange-600 mt-2"
                      >
                        Shop All {cat.name} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 📍 Dynamic Product Blocks based on Location */}
          {blocks.map(block => (
            <section key={block.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-blue-900 uppercase italic">{block.title}</h2>
                  {block.blockType === 'deals' && (
                    <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded uppercase animate-pulse">Hot Deal</div>
                  )}
                </div>
                <Link href="/shop" className="text-sm font-bold text-blue-600 hover:text-orange-600 hover:underline">
                  See More →
                </Link>
              </div>
              <ProductGrid initialProducts={products.filter(p => block.productIds?.includes(p.id))} />
            </section>
          ))}

          {/* Feature Section - QR Scanner */}
          <section className="bg-white p-8 md:p-12 shadow-2xl border border-gray-100 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
            <HomeScanSection />
          </section>

          {/* Standard Featured Grid (Fallback/Main) */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-900 uppercase">Featured for You</h2>
                <div className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded uppercase">Verified</div>
              </div>
              <Link href="/shop" className="text-sm font-bold text-blue-600 hover:text-orange-600 hover:underline">
                Explore All Products →
              </Link>
            </div>
            <ProductGrid initialProducts={products} />
          </section>
        </div>
      </div>

      {/* NEW: Coupons & Rewards Section */}
      <RewardSection />

      {/* NEW: Partner Marquee */}
      <PartnerMarquee />

    </div>
  );
}
