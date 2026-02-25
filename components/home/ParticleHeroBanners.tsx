// NEW: Separate Particle Feature – Zero DB hits
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

// Dynamic import for tsParticles to ensure 100% client-side execution
const Particles = dynamic(() => import('@tsparticles/react'), { ssr: false });
const loadSlim = async (engine: any) => {
    const { loadSlim } = await import('@tsparticles/slim');
    await loadSlim(engine);
};

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bannerType: 'primary' | 'secondary';
    active: boolean;
}

export default function ParticleHeroBanners() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [particlesEnabled, setParticlesEnabled] = useState(true);
    const [init, setInit] = useState(false);

    // Initial load for particles engine
    useEffect(() => {
        import('@tsparticles/react').then((module) => {
            const { initParticlesEngine } = module;
            initParticlesEngine(async (engine) => {
                await loadSlim(engine);
            }).then(() => {
                setInit(true);
            });
        });
    }, []);

    // Real-time config & banner sync
    useEffect(() => {
        // Sync Particle Toggle
        const settingsUnsub = onSnapshot(doc(db, 'settings', 'site-settings'), (doc) => {
            if (doc.exists()) {
                setParticlesEnabled(doc.data().enableHomeParticleEffects ?? true);
            }
        });

        // Sync Banners
        const bannersQuery = query(
            collection(db, 'homeBanners'),
            where('active', '==', true),
            orderBy('order', 'asc')
        );
        const bannersUnsub = onSnapshot(bannersQuery, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Banner[];
            setBanners(data);
        });

        return () => {
            settingsUnsub();
            bannersUnsub();
        };
    }, []);

    // Premium Bangladesh-inspired Config
    const particlesConfig = useMemo(() => ({
        fullScreen: { enable: false }, // Zero interference with other sections
        fpsLimit: 120,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "repulse", // Strong interaction: Move particles away
                },
                onClick: {
                    enable: true,
                    mode: "push", // Fun interaction: Add more on click
                },
                resize: { enable: true },
            },
            modes: {
                repulse: {
                    distance: 150,
                    duration: 0.4,
                },
                push: {
                    quantity: 4,
                },
            },
        },
        particles: {
            color: {
                value: ["#006a4e", "#f42a41", "#ffd700", "#ffffff"], // Deep Green, Red, Gold, White
            },
            links: {
                color: "#006a4e",
                distance: 150,
                enable: true,
                opacity: 0.2, // Subtle connecting lines
                width: 1,
            },
            move: {
                direction: "none" as const,
                enable: true,
                outModes: {
                    default: "bounce" as const,
                },
                random: false,
                speed: 1.5, // Continuous gentle movement
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 100, // Balanced performance
            },
            opacity: {
                value: 0.5,
                animation: {
                    enable: true,
                    speed: 1,
                    minimumValue: 0.1,
                }
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 4 },
            },
        },
        detectRetina: true,
    }), []);

    if (banners.length === 0) return null;

    const primaryBanner = banners.find(b => b.bannerType === 'primary') || banners[0];
    const secondaryBanner = banners.find(b => b.bannerType === 'secondary' && b.id !== primaryBanner.id);

    return (
        <section className="relative w-full bg-blue-950 overflow-hidden py-8 md:py-12">
            {/* Particle Canvas Layer - Zero DB hits after mount */}
            {particlesEnabled && init && (
                <div className="absolute inset-0 z-0">
                    <Particles
                        id="tsparticles-home"
                        className="h-full w-full"
                        options={particlesConfig}
                    />
                </div>
            )}

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                    {/* Primary Banner - Large */}
                    <div className={`${secondaryBanner ? 'lg:col-span-8' : 'lg:col-span-12'} group relative aspect-[21/9] md:aspect-[2.4/1] rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.01]`}>
                        <img
                            src={primaryBanner.imageUrl}
                            alt={primaryBanner.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/40 to-transparent" />

                        <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-6 w-fit animate-bounce">
                                <Zap size={14} /> Flash Deal Live
                            </div>
                            <h2 className="text-white text-3xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-2xl leading-none italic uppercase">
                                {primaryBanner.title}
                            </h2>
                            <p className="text-white/80 text-sm md:text-xl font-bold mb-8 max-w-md drop-shadow-lg">
                                {primaryBanner.subtitle}
                            </p>
                            <Link
                                href={primaryBanner.buttonLink}
                                className="inline-flex items-center gap-3 bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-sm md:text-base border-2 border-transparent hover:bg-orange-500 hover:text-white transition-all w-fit shadow-2xl active:scale-95 group/btn"
                            >
                                {primaryBanner.buttonText}
                                <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Secondary Banner - Compact */}
                    {secondaryBanner && (
                        <div className="lg:col-span-4 group relative aspect-square lg:aspect-auto rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.01]">
                            <img
                                src={secondaryBanner.imageUrl}
                                alt={secondaryBanner.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/40 to-blue-900/95" />

                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                                <h3 className="text-white text-2xl md:text-4xl font-black tracking-tighter mb-2 italic uppercase">
                                    {secondaryBanner.title}
                                </h3>
                                <p className="text-white/80 text-xs md:text-sm font-bold mb-6">
                                    {secondaryBanner.subtitle}
                                </p>
                                <Link
                                    href={secondaryBanner.buttonLink}
                                    className="bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all w-fit shadow-xl"
                                >
                                    {secondaryBanner.buttonText}
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
