'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFashionQuizAction } from '@/actions/public-data';

const FashionPersonaSidebar = () => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [persona, setPersona] = useState<string | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [config, setConfig] = useState<{ isActive: boolean } | null>(null);

    // Only show on fashion related routes
    // Broaden visibility for the 'MCQ' (Multiple Choice Quiz) personalization bar
    const isFashionRoute = pathname.includes('/clothing') ||
        pathname.includes('/fashion') ||
        pathname.includes('/boutique') ||
        pathname.includes('/fasson') ||
        pathname === '/shop' ||
        pathname === '/';

    useEffect(() => {
        const loadConfig = async () => {
            const data = await fetchFashionQuizAction();
            setConfig(data as { isActive: boolean });
        };
        loadConfig();
    }, []);

    useEffect(() => {
        if (config === null) { // Wait for config to load
            return;
        }
        if (!config || !config.isActive) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsVisible(false);
            return;
        }

        const storedPersona = localStorage.getItem('fashion_persona');
        if (storedPersona) {
             
            setPersona(storedPersona);
        }

        // Auto-show if on fashion route and not dismissed
        if (isFashionRoute && !isDismissed) {
             
            setIsVisible(true);
        } else {
             
            setIsVisible(false);
        }
    }, [pathname, isFashionRoute, isDismissed, config]);

    const handleSelect = (choice: string) => {
        localStorage.setItem('fashion_persona', choice);
        setPersona(choice);
        // Visual feedback
        setTimeout(() => setIsVisible(false), 800);
    };

    if (!isFashionRoute || isDismissed) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed left-6 top-1/2 -translate-y-1/2 z-[90] w-64"
                >
                    <div className="glass-surface p-6 rounded-3xl border border-gold/30 shadow-2xl relative overflow-hidden group">
                        {/* Decorative Background Element */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/10 blur-3xl rounded-full" />

                        <button
                            onClick={() => setIsDismissed(true)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-maroon transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-gold animate-pulse" size={18} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-maroon dark:text-gold-light">
                                Boutique Intelligence
                            </h3>
                        </div>

                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight">
                            Personalize your shopping experience?
                        </p>

                        <div className="space-y-3">
                            {[
                                { id: 'modern', label: 'Modern Chic', desc: 'Urban & Trendy' },
                                { id: 'heritage', label: 'Gramin Heritage', desc: 'Handloom & Ethnic' }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${persona === option.id
                                        ? 'bg-maroon text-white border-gold'
                                        : 'bg-white/50 dark:bg-black/20 hover:bg-gold/10 border-gray-100 dark:border-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-black uppercase tracking-tighter">{option.label}</span>
                                        {persona === option.id && <Check size={14} />}
                                    </div>
                                    <p className="text-[10px] opacity-60 font-medium">{option.desc}</p>
                                </button>
                            ))}
                        </div>

                        <p className="mt-6 text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
                            Powered by Style DNA
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FashionPersonaSidebar;
