'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Youtube, Linkedin, Mail, Phone, MapPin, Zap, ExternalLink, Instagram, Twitter, ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';

interface Partner {
    id: string;
    logo: string;
    title: string;
    subtitle?: string;
    link?: string;
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
        twitter?: string;
    };
    established?: string;
    logoUrl?: string;
    payments: {
        bkash: boolean;
        nagad: boolean;
        visa: boolean;
        mastercard: boolean;
    };
    partners: Partner[];
}

import { fetchSiteSettingsAction } from '@/actions/public-data';

import { usePathname } from 'next/navigation';

export default function DynamicFooter() {
    const pathname = usePathname();
    const [config, setConfig] = useState<FooterConfig | null>(null);
    const { t } = useI18n();

    const isAdmin = pathname?.startsWith('/admin');

    useEffect(() => {
        const fetchConfig = async () => {
            const data = await fetchSiteSettingsAction();
            if (data) {
                setConfig(data as FooterConfig);
            }
        };
        fetchConfig();
    }, []);

    const formatLink = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    if (!config || isAdmin) return null;

    return (
        <footer className="w-full bg-white dark:bg-black text-black dark:text-white pt-10 pb-6 overflow-hidden font-sans border-t border-gray-200 dark:border-white/10 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Sri Mongolian Familian Tree - Associated Partners Section */}
                {config.partners && config.partners.length > 0 && (
                    <div className="w-full border-b border-gray-200 dark:border-white/10 py-8 mb-12 relative overflow-hidden bg-gradient-to-r from-transparent via-orange-50/20 dark:via-orange-900/5 to-transparent">
                        <div className="text-center mb-6">
                            <h3 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-2">
                                {t('footer.associates')}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sri Mongolian Familian Tree</p>
                        </div>
                        <div className="flex overflow-hidden group">
                            <motion.div
                                className="flex gap-12 items-center whitespace-nowrap"
                                animate={{
                                    x: [0, -1000]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 35,
                                    ease: "linear"
                                }}
                            >
                                {(config.partners || []).length > 0 && [...config.partners, ...config.partners, ...config.partners].map((partner, idx) => (
                                    <div key={`${partner.id}-${idx}`} className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer group/partner">
                                        <div className="w-10 h-10 flex items-center justify-center p-2 transition-all rounded-lg border border-transparent group-hover/partner:border-orange-400 group-hover/partner:shadow-lg group-hover/partner:shadow-orange-500/20">
                                            <img
                                                src={partner.logo || "/logo.jpg"}
                                                alt={partner.title}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold tracking-tight text-gray-600 dark:text-gray-400 group-hover/partner:text-orange-600 transition-colors uppercase">{partner.title}</span>
                                            {partner.subtitle && <span className="text-[9px] text-gray-400 dark:text-gray-500">{partner.subtitle}</span>}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Main Footer Container */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                        {/* Column 1: Brand & Social */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                {config.logoUrl ? (
                                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10">
                                        <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                                        <Zap className="text-white" fill="currentColor" size={20} />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">ASTHAR HAT</h2>
                                    <p className="text-[9px] tracking-widest text-orange-500 font-bold mt-0.5">
                                        {config.established || t('footer.established')}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed max-w-xs">
                                {config.description || t('footer.description')}
                            </p>
                            <div className="flex gap-3">
                                {config.social && (
                                    <>
                                        <SocialIcon icon={Facebook} href={formatLink(config.social.facebook)} size={16} />
                                        <SocialIcon icon={Youtube} href={formatLink(config.social.youtube)} size={16} />
                                        <SocialIcon icon={Linkedin} href={formatLink(config.social.linkedin)} size={16} />
                                        {config.social.instagram && <SocialIcon icon={Instagram} href={formatLink(config.social.instagram)} size={16} />}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Quick Shop */}
                        <div>
                            <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t('footer.shop')}
                            </h3>
                            <ul className="space-y-3">
                                <FooterLink href="/shop" label={t('footer.allProducts')} />
                                <FooterLink href="/shop?category=popular" label={t('footer.bestSellers')} />
                                <FooterLink href="/shop?category=new" label={t('footer.newArrivals')} />
                                <FooterLink href="/coupons" label={t('footer.discountTickets')} />
                            </ul>
                        </div>

                        {/* Column 3: Customer Care */}
                        <div>
                            <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t('footer.service')}
                            </h3>
                            <ul className="space-y-3">
                                <FooterLink href="/tracking" label={t('footer.trackOrder')} />
                                <FooterLink href="/refund-policy" label={t('footer.refundPolicy')} />
                                <FooterLink href="/about" label={t('footer.aboutUs')} />
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div>
                            <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t('footer.support')}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-600 transition-colors duration-500 text-orange-500 group-hover:text-white border border-gray-100 dark:border-white/10">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition-colors">
                                            {config.address || "Dhaka, Bangladesh"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-600 transition-colors duration-500 border border-gray-100 dark:border-white/10">
                                        <Phone size={16} className="text-orange-500 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition-colors">
                                            {config.phone || "+880 1XXX XXXXXX"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-600 transition-colors duration-500 border border-gray-100 dark:border-white/10">
                                        <Mail size={16} className="text-orange-500 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition-colors">
                                            {config.email || "support@astharhat.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payments & Legal Bar - Unified */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <p className="text-[10px] tracking-[0.2em] font-bold text-gray-400">
                                {t('footer.copyright', { year: new Date().getFullYear().toString() })}
                            </p>
                            <div className="hidden md:flex gap-4 text-[9px] tracking-[0.2em] font-bold text-gray-500 dark:text-gray-400">
                                <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">{t('footer.privacy')}</Link>
                                <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">{t('footer.terms')}</Link>
                            </div>
                            {/* Zero Trust Badge */}
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">ZERO TRUST SECURED</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                            {config.payments && (
                                <>
                                    {config.payments.bkash && <PaymentLogo name="bkash" />}
                                    {config.payments.nagad && <PaymentLogo name="nagad" />}
                                    {config.payments.visa && <PaymentLogo name="visa" />}
                                    {config.payments.mastercard && <PaymentLogo name="mastercard" />}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}

function SocialIcon({ icon: Icon, href, size = 20 }: { icon: any, href: string, size?: number }) {
    if (!href) return null;
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:-translate-y-1 transition-all duration-500 shadow-lg"
        >
            <Icon size={size} />
        </a>
    );
}

function FooterLink({ href, label }: { href: string, label: string }) {
    return (
        <li>
            <Link
                href={href}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-xs font-medium transition-colors flex items-center gap-2 group"
            >
                <div className="w-1 h-1 bg-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                {label}
            </Link>
        </li>
    );
}

function PaymentLogo({ name }: { name: string }) {
    return (
        <div className="h-10 px-4 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-tighter text-black dark:text-white">{name}</span>
        </div>
    );
}
