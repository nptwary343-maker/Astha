'use client';

import React, { useState, useEffect } from 'react';
import { fetchBannerConfigAction } from '@/actions/public-data';

interface BannerConfig {
    html: string;
    css: string;
    js: string;
    isActive: boolean;
}

const SafeBannerRenderer = () => {
    const [config, setConfig] = useState<BannerConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBanner = async () => {
            const data = await fetchBannerConfigAction();
            if (data) {
                setConfig(data as BannerConfig);
            }
            setLoading(false);
        };
        loadBanner();
    }, []);

    if (loading || !config || !config.isActive) return null;

    // Constructing the srcDoc with Zero Trust principles
    // 1. <base target="_parent"> Ensures links open outside the iframe.
    // 2. CSS is injected in <style>.
    // 3. User JS is wrapped in try-catch to prevent page crashes.
    const srcDoc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <base target="_parent">
            <style>
                body { margin: 0; padding: 0; overflow: hidden; font-family: sans-serif; }
                ${config.css}
            </style>
        </head>
        <body>
            <div id="banner-root">${config.html}</div>
            <script>
                (function() {
                    try {
                        ${config.js}
                    } catch (e) {
                        console.error("Dynamic Banner Error:", e);
                    }
                })();
            </script>
        </body>
        </html>
    `;

    return (
        <section className="w-full px-4 py-2">
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm min-h-[100px] flex items-center justify-center">
                <iframe
                    title="Dynamic Ad Banner"
                    srcDoc={srcDoc}
                    sandbox="allow-scripts"
                    className="w-full border-none transition-opacity duration-500 animate-in fade-in"
                    style={{
                        height: 'auto',
                        minHeight: '100px',
                        width: '100%',
                        display: 'block'
                    }}
                    onLoad={(e) => {
                        // Dynamically adjust height to content if possible
                        // Note: Only works if cross-origin rules allow, but since it's srcDoc, 
                        // it might need an internal resize observer script.
                        const iframe = e.currentTarget;
                        if (iframe.contentWindow) {
                            // Basic height adjustment for srcDoc
                            try {
                                const height = iframe.contentWindow.document.body.scrollHeight;
                                iframe.style.height = height + 'px';
                            } catch (err) {
                                // Fallback height if restricted
                                iframe.style.height = '300px';
                            }
                        }
                    }}
                />
            </div>
        </section>
    );
};

export default SafeBannerRenderer;
