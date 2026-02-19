'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function FacebookPixel() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pixelId, setPixelId] = useState<string | null>(null);

    // 1. Fetch Pixel ID on Mount
    useEffect(() => {
        fetch('/api/settings')
            .then(async res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return res.json();
                } else {
                    // Start of fallback logic
                    // If API is missing/broken, we return null so the app doesn't crash
                    return { pixelId: null };
                }
            })
            .then(data => {
                if (data && data.pixelId) {
                    setPixelId(data.pixelId);
                }
            })
            .catch(err => {
                // Squelch the error in production, log in dev
                if (process.env.NODE_ENV === 'development') {
                    console.warn("Facebook Pixel ID could not be loaded:", err);
                }
            });
    }, []);

    // 2. Track PageViews on Route Change
    useEffect(() => {
        if (pixelId && typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'PageView');
        }
    }, [pathname, searchParams, pixelId]);

    if (!pixelId) return null;

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
                }}
            />
        </>
    );
}
