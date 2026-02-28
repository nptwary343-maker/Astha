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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        fetch('/api/settings', { signal: controller.signal })
            .then(async res => {
                clearTimeout(timeoutId);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                if (data && data.pixelId) {
                    setPixelId(data.pixelId);
                }
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.warn("Facebook Pixel ID fetch timed out");
                } else if (process.env.NODE_ENV === 'development') {
                    console.warn("Facebook Pixel ID could not be loaded:", err);
                }
                // Fallback: Check localStorage if we ever saved it there? 
                // For now, just remain silent.
            });

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
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
