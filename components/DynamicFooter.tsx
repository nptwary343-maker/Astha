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

import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function DynamicFooter() {
    const pathname = usePathname();
    const [config, setConfig] = useState<FooterConfig | null>(null);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
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

                {/* Main Footer Container */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                        {/* Column 1: Brand & Social */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
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
                                <li>
                                    <button
                                        onClick={() => setIsTrackingModalOpen(true)}
                                        className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-xs font-medium transition-colors flex items-center gap-2 group"
                                    >
                                        <div className="w-1 h-1 bg-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {t('footer.trackOrder')} (Secret Key)
                                    </button>
                                </li>
                                <FooterLink href="/refund-policy" label={t('footer.refundPolicy')} />
                                <FooterLink href="/about" label={t('footer.aboutUs')} />
                            </ul>
                        </div>

                        {/* Order Tracking Modal */}
                        <OrderTrackingModal
                            isOpen={isTrackingModalOpen}
                            onClose={() => setIsTrackingModalOpen(false)}
                        />

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

function OrderTrackingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [secretKey, setSecretKey] = useState('');
    const [orderData, setOrderData] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = () => {
        if (!secretKey.trim()) return;
        setIsSearching(true);
        setError('');

        const q = query(collection(db, 'orders'), where('secretKey', '==', secretKey.trim()));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setOrderData(snapshot.docs[0].data());
                setIsSearching(false);
            } else {
                setError('No order found with this secret key.');
                setOrderData(null);
                setIsSearching(false);
            }
        }, (err) => {
            console.error("Tracking Error:", err);
            setError('Failed to track order. Please try again.');
            setIsSearching(false);
        });

        return () => unsubscribe();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-white/20"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Truck size={20} />
                            </div>
                            <h2 className="text-xl font-black text-blue-900 dark:text-white uppercase italic tracking-tighter">Track Order</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowRight className="rotate-180" size={20} />
                        </button>
                    </div>

                    {!orderData ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Enter your secret order key provided in your confirmation email to track status.
                            </p>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    placeholder="Enter Secret Key..."
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-all font-bold text-blue-900 dark:text-white"
                                />
                            </div>
                            {error && <p className="text-xs text-red-500 font-bold ml-2">{error}</p>}
                            <button
                                onClick={handleTrack}
                                disabled={isSearching}
                                className="w-full py-4 bg-blue-900 dark:bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[0.98] transition-transform shadow-xl flex items-center justify-center gap-2"
                            >
                                {isSearching ? "Searching..." : "Sync Status Now"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-3xl border border-orange-100 dark:border-orange-500/20">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Order Status</span>
                                    <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{orderData.status || 'Processing'}</span>
                                </div>
                                <h3 className="text-2xl font-black text-blue-900 dark:text-white mb-2 italic">#{orderData.orderId || 'ORD-SYNC'}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">Estimated Delivery: {orderData.estimatedDelivery || '3-5 Days'}</p>
                            </div>

                            <div className="space-y-4">
                                <TrackingStep label="Order Placed" active={true} completed={true} />
                                <TrackingStep label="Processing" active={orderData.status === 'Processing'} completed={['Shipped', 'Delivered'].includes(orderData.status)} />
                                <TrackingStep label="Out for Delivery" active={orderData.status === 'Shipped'} completed={orderData.status === 'Delivered'} />
                                <TrackingStep label="Delivered" active={orderData.status === 'Delivered'} completed={orderData.status === 'Delivered'} />
                            </div>

                            <button
                                onClick={() => setOrderData(null)}
                                className="w-full py-3 text-xs font-bold text-gray-400 hover:text-blue-900 transition-colors"
                            >
                                Track another order
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function TrackingStep({ label, active, completed }: { label: string, active: boolean, completed: boolean }) {
    return (
        <div className={`flex items-center gap-4 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-3 h-3 rounded-full ${completed ? 'bg-green-500' : active ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className={`text-sm font-bold ${active ? 'text-blue-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
        </div>
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
