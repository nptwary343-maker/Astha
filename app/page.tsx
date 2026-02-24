export const runtime = 'edge';
import { getFeaturedProducts } from '@/lib/db-utils';
import HeroBanner from '@/components/HeroBanner';
import ProductGrid from '@/components/ProductGrid';
import HomeScanSection from '@/components/HomeScanSection';
import HomepageActionBar from '@/components/HomepageActionBar';
import SafeBannerRenderer from '@/components/SafeBannerRenderer';
import { Zap, Shield, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/data/static-content';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { MENU_ITEMS } from '@/components/navigation-config';
import AlienBackground from '@/components/AlienBackground';

import TrustBar from '@/components/TrustBar';

export default async function Home() {
  let products = [];
  try {
    products = await getFeaturedProducts();
    console.log(`🏠 Home Page: Rendering with ${products?.length || 0} products`);
  } catch (e) {
    console.error("Home Page Data Fetch Error:", e);
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 relative overflow-hidden selection:bg-blue-500/30">

      <div className="hidden dark:block">
        <AlienBackground />
      </div>

      <div className="relative z-10 space-y-4 pb-24">
        {/* Hero Section */}
        <div className="backdrop-blur-sm bg-gray-50/30 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/5">
          <SafeBannerRenderer />
          <HeroBanner hasSpecialCoupon={true} />
        </div>

        {/* 🛡️ Trust Signals Section */}
        <TrustBar />

        {/* 🧩 Quick Action Bar */}
        <HomepageActionBar />

        {/* Categories Section (Corner Pop Hover Effect) */}
        <section className="px-4 md:px-8 max-w-7xl mx-auto py-10 relative z-20">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic text-center mb-4">
              Explore <span className="text-blue-600">Premium</span> Collections
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-10">
            {CATEGORIES.map((cat) => {
              const menuItem = MENU_ITEMS.find(m => m.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase()));
              const subs = menuItem?.subItems?.slice(0, 4) || [];

              return (
                <div key={cat.id} className="group relative">
                  {/* Corner Sub-items - Hyper-Premium Styling */}
                  {subs.map((sub, idx) => (
                    <Link
                      href={sub.href}
                      key={sub.name}
                      className={`
                            absolute z-[60] px-4 py-2 bg-black/80 dark:bg-white/90 backdrop-blur-xl text-white dark:text-black text-[9px] font-black uppercase rounded-xl opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 whitespace-nowrap border border-white/20 dark:border-black/10 shadow-2xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white
                            ${idx === 0 ? '-top-4 -left-4 group-hover:-top-10 group-hover:-left-6' : ''}
                            ${idx === 1 ? '-top-4 -right-4 group-hover:-top-10 group-hover:-right-6' : ''}
                            ${idx === 2 ? '-bottom-4 -left-4 group-hover:-bottom-10 group-hover:-left-6' : ''}
                            ${idx === 3 ? '-bottom-4 -right-4 group-hover:-bottom-10 group-hover:-right-6' : ''}
                          `}
                    >
                      {sub.name}
                    </Link>
                  ))}

                  <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 flex flex-col items-center gap-6 transition-all duration-700 hover:bg-gray-50 dark:hover:bg-white/[0.02] hover:shadow-[0_0_50px_rgba(37,99,235,0.15)] hover:border-blue-500/50 hover:-translate-y-4 relative overflow-hidden h-full group/card shadow-xl shadow-black/[0.02]">
                    {/* Animated Glow Background */}
                    <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 scale-0 group-hover:scale-150 transition-transform duration-1000 rounded-full blur-3xl" />

                    <div className={`w-28 h-28 rounded-[2rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center p-6 group-hover/card:rotate-[15deg] group-hover/card:scale-125 transition-all duration-700 relative z-10 shadow-2xl border border-gray-100 dark:border-white/5`}>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain filter drop-shadow-2xl group-hover/card:brightness-110"
                        />
                      ) : (
                        <Zap size={48} className="text-blue-500" />
                      )}
                    </div>

                    <div className="text-center relative z-10">
                      <span className="text-xs font-black tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500 group-hover/card:text-blue-600 transition-colors block mb-1">Explore</span>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-widest">{cat.name}</h3>
                    </div>

                    {/* Decorative Line */}
                    <div className="w-8 h-1 bg-gray-100 dark:bg-white/10 rounded-full group-hover/card:w-16 group-hover/card:bg-blue-600 transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>



        {/* Feature Section */}
        <div className="relative py-12">
          <div className="absolute inset-0 bg-blue-600/5 blur-3xl -z-10" />
          <HomeScanSection />
        </div>

        {/* Product Grid - The Core Store */}
        <div className="px-2 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8 px-4">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Explore Store</h2>
          </div>
          <ProductGrid initialProducts={products} />
        </div>
      </div>

      {/* Futuristic Floating Elements */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <div className="w-12 h-12 bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors cursor-pointer group">
          <Shield className="text-gray-400 group-hover:text-white" size={20} />
        </div>
        <div className="w-12 h-12 bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-purple-600 dark:hover:bg-purple-600 transition-colors cursor-pointer group">
          <Sparkles className="text-gray-400 group-hover:text-white" size={20} />
        </div>
      </div>
    </div>
  );
}
