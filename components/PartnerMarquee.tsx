'use client';

import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { getActivePartners } from '@/lib/db-utils';
import { Partner } from '@/types/admin';

const PartnerMarquee = () => {
    const [partners, setPartners] = useState<Partner[]>([]);

    useEffect(() => {
        const fetchPartners = async () => {
            const data = await getActivePartners();
            setPartners(data as Partner[]);
        };
        fetchPartners();
    }, []);

    if (partners.length === 0) return null;

    return (
        <section className="py-12 bg-white border-y border-gray-100 overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-blue-900 border-l-4 border-orange-500 pl-4">
                        Our Trusted Partners
                    </h2>
                    <div className="flex-1 h-px bg-gray-100" />
                </div>
            </div>

            <div className="relative flex">
                <m.div
                    className="flex items-center gap-12 md:gap-24 whitespace-nowrap py-4"
                    animate={{
                        x: [0, -1000],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                >
                    {/* Double the list for seamless loop */}
                    {[...partners, ...partners, ...partners].map((partner, idx) => (
                        <div key={`${partner.id}-${idx}`} className="flex flex-col items-center gap-2 group transition-all duration-300 grayscale hover:grayscale-0 scale-90 hover:scale-100 opacity-60 hover:opacity-100">
                            <div className="w-32 h-16 md:w-48 md:h-24 relative flex items-center justify-center p-4">
                                <img
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-900 transition-colors">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </m.div>
            </div>
        </section>
    );
};

export default PartnerMarquee;
