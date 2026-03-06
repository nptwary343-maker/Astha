'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Facebook, Youtube, Linkedin, Mail, Phone, MapPin, Instagram, Truck, ShoppingBag, Box, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';

interface Partner {
    id: string;
    logo: string;
    title: string;
}

interface FooterConfig {
    description: string;
    address: string;
    phone: string;
    email: string;
    social: {
        facebook: string;
        youtube: string;
        linkedin: string;
        instagram?: string;
    };
    established?: string;
}

interface ProductHierarchy {
    [category: string]: {
        [subCategory: string]: Array<{ id: string; name: string }>;
    };
}

export default function DynamicFooter() {
    const { t } = useI18n();
    const [config, setConfig] = useState<FooterConfig | null>(null);
    const [hierarchy, setHierarchy] = useState<ProductHierarchy>({});
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [openSubCategory, setOpenSubCategory] = useState<string | null>(null);

    useEffect(() => {
        // Fetch Footer Config
        const unsubscribeConfig = onSnapshot(collection(db, 'site_config'), (snapshot) => {
            const footerDoc = snapshot.docs.find(doc => doc.id === 'footer_master');
            if (footerDoc) setConfig(footerDoc.data() as FooterConfig);
        });

        // Fetch Products for Accordion Hierarchy
        const unsubscribeProducts = onSnapshot(query(collection(db, 'products'), limit(100)), (snapshot) => {
            const newHierarchy: ProductHierarchy = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const category = data.category || 'Other';
                const subCategory = data.subCategory || 'General';
                const product = { id: doc.id, name: data.name };

                if (!newHierarchy[category]) newHierarchy[category] = {};
                if (!newHierarchy[category][subCategory]) newHierarchy[category][subCategory] = [];
                newHierarchy[category][subCategory].push(product);
            });
            setHierarchy(newHierarchy);
        });

        return () => {
            unsubscribeConfig();
            unsubscribeProducts();
        };
    }, []);

    if (!config) return null;

    return (
        <footer className="w-full bg-slate-950 text-white pt-16 pb-8 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">ASTHAR HAT</h2>
                            <p className="text-[10px] tracking-[0.4em] text-indigo-400 font-black uppercase">
                                {config.established || "Established 2024"}
                            </p>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            {config.description || "Discover premium quality and unparalleled service at Asthar Hat. Your trusted destination for authentic boutique and lifestyle essentials."}
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={Facebook} href={config.social?.facebook} />
                            <SocialIcon icon={Instagram} href={config.social?.instagram} />
                            <SocialIcon icon={Youtube} href={config.social?.youtube} />
                        </div>
                    </div>

                    {/* Accordion Navigation Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Explore Catalog</h3>
                        <div className="space-y-2">
                            {Object.entries(hierarchy).map(([category, subs]) => (
                                <div key={category} className="border-b border-white/5 last:border-0 pb-2">
                                    <button
                                        onClick={() => setOpenCategory(openCategory === category ? null : category)}
                                        className="w-full flex items-center justify-between py-4 text-sm font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Box size={16} className="text-indigo-500" />
                                            {category}
                                        </div>
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${openCategory === category ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {openCategory === category && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pl-6 space-y-2 bg-white/5 rounded-2xl mb-4"
                                            >
                                                {Object.entries(subs).map(([sub, products]) => (
                                                    <div key={sub} className="py-2">
                                                        <button
                                                            onClick={() => setOpenSubCategory(openSubCategory === sub ? null : sub)}
                                                            className="w-full flex items-center justify-between py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                                                        >
                                                            {sub}
                                                            <ChevronRight size={12} className={`transition-transform ${openSubCategory === sub ? 'rotate-90' : ''}`} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {openSubCategory === sub && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden pl-4 space-y-1 pb-4"
                                                                >
                                                                    {products.map(p => (
                                                                        <Link
                                                                            key={p.id}
                                                                            href={`/product/${p.id}`}
                                                                            className="block py-1 text-[11px] font-medium text-slate-500 hover:text-indigo-400 transition-colors"
                                                                        >
                                                                            {p.name}
                                                                        </Link>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    <p>© {new Date().getFullYear()} ASTHAR HAT. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/refund" className="hover:text-white transition-colors">Refund</Link>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        <span>Security Verified</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon: Icon, href }: { icon: any, href?: string }) {
    if (!href) return null;
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
        >
            <Icon size={18} />
        </a>
    );
}
