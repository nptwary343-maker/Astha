'use client';

import React, { useEffect, useState } from 'react';
import { Fingerprint } from 'lucide-react';

const StyleDNAWidget = () => {
    const [userImage, setUserImage] = useState<string | null>(null);

    useEffect(() => {
        const storedImage = localStorage.getItem('user_style_image');
        if (storedImage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserImage(storedImage);
        }
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-[100] group cursor-pointer">
            {/* Outer Pulse Effect */}
            <div className="absolute inset-0 rounded-full animate-premium-pulse bg-gold/20 scale-125 pointer-events-none" />

            {/* Rotating Border Logic */}
            <div className="relative w-16 h-16 rounded-full p-[2px] overflow-hidden">
                {/* The Actual Rotating Background */}
                <div className="absolute inset-[-50%] bg-[conic-gradient(#D4AF37,#4A0404,#D4AF37)] animate-rotate-border" />

                {/* Content Container */}
                <div className="relative w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden border border-maroon/20">
                    {userImage ? (
                        <img
                            src={userImage}
                            alt="Style DNA"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <Fingerprint className="text-gold w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                    )}
                </div>
            </div>

            {/* Tooltip Label */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                <div className="glass-surface px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gold border border-gold/20 shadow-2xl">
                    Visual Style DNA Active
                </div>
            </div>
        </div>
    );
};

export default StyleDNAWidget;
