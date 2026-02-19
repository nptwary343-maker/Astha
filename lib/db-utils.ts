// lib/db-utils.ts
import { db } from './firebase';
import { collection, getDocs, query, limit, doc, getDoc, where } from 'firebase/firestore';
import { unstable_cache } from 'next/cache';
import { FALLBACK_PRODUCTS, FALLBACK_SETTINGS } from './fallback-data';

/**
 * 📦 UNIFIED PRODUCT CACHE (1-Hour Revalidation)
 * Strategy: 1 Firebase hit per hour for ALL products.
 * Helps Vercel Free users stay within 50k reads limit.
 */
export const getCachedProducts = unstable_cache(
    async () => {
        console.log("🔥 [FIREBASE_HIT] Fetching all products for global cache...");
        try {
            const q = query(collection(db, 'products'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`✅ [CACHE_REFILLED] Loaded ${data.length} products.`);
            return data.length > 0 ? data : FALLBACK_PRODUCTS;
        } catch (e: any) {
            console.error("Firebase read failed:", e.code || e.message);

            // 🛡️ EMERGENCY QUOTA CHECK
            if (e.code === 'resource-exhausted' || e.message?.includes('quota')) {
                console.warn("⚠️ [QUOTA_EXCEEDED] Providing fallback products to keep site alive.");
            }

            return FALLBACK_PRODUCTS;
        }
    },
    ['global-products-cache-v3'],
    { revalidate: 3600, tags: ['products'] }
);

/**
 * FETCH FEATURED PRODUCTS (From Cache)
 */
export const getFeaturedProducts = async () => {
    const all = await getCachedProducts();
    return all.slice(0, 80);
};

/**
 * GET LIGHTWEIGHT SEARCH INDEX (From Cache)
 */
export const getSearchIndex = async () => {
    const all = await getCachedProducts();
    return all.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        image: p.images?.[0] || null,
        price: p.price
    }));
};

/**
 * GET PRODUCT BY ID (From Cache)
 */
export const getCachedProductById = async (id: string) => {
    const all = await getCachedProducts();
    return all.find((p: any) => p.id === id || p.slug === id) || null;
};

/**
 * ⚙️ SITE SETTINGS CACHE
 */
/**
 * ⚙️ SITE SETTINGS CACHE (Middle-Layer)
 */
export const getSiteSettings = unstable_cache(
    async () => {
        try {
            // Check both general and footer configs for middle-layer isolation
            const mainSnap = await getDoc(doc(db, 'settings', 'general'));
            const footerSnap = await getDoc(doc(db, 'site_config', 'footer_master'));

            return {
                ...(mainSnap.exists() ? mainSnap.data() : {}),
                ...(footerSnap.exists() ? footerSnap.data() : {}),
                _lastUpdated: Date.now()
            };
        } catch (e: any) {
            console.error("Middle-layer settings fetch failed:", e.code || e.message);
            if (e.code === 'resource-exhausted' || e.message?.includes('quota')) {
                console.warn("⚠️ [QUOTA_EXCEEDED] Providing fallback settings.");
            }
            return FALLBACK_SETTINGS;
        }
    },
    ['site-settings-v5-cache'],
    { revalidate: 3600, tags: ['settings'] }
);

/**
 * 🔍 FIND SIMILAR PRODUCTS (By Name/Category for Brand Options)
 */
export const getSimilarProducts = async (productName: string, category: string, currentId: string) => {
    const all = await getCachedProducts();
    // Normalize name for comparison (e.g. "iPhone 15 Pro" -> "iphone-15-pro")
    const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-');
    const baseName = normalize(productName);

    return all.filter((p: any) =>
        p.id !== currentId &&
        (normalize(p.name).includes(baseName) || baseName.includes(normalize(p.name)) || p.category === category)
    ).slice(0, 10);
};

/**
 * 🎨 HERO BANNER CONFIG CACHE
 */
export const getBannerConfig = unstable_cache(
    async () => {
        try {
            const snap = await getDoc(doc(db, 'site_config', 'hero_banner'));
            return snap.exists() ? snap.data() : null;
        } catch (e: any) {
            console.error("Banner fetch failed:", e);
            return null;
        }
    },
    ['hero-banner-cache'],
    { revalidate: 3600, tags: ['banners'] }
);

/**
 * ⚡ FLASH SALE CONFIG CACHE
 */
export const getFlashSaleConfig = unstable_cache(
    async () => {
        try {
            const snap = await getDoc(doc(db, 'site_config', 'flash_sale'));
            return snap.exists() ? snap.data() : null;
        } catch (e: any) {
            console.error("Flash Sale fetch failed:", e);
            return null;
        }
    },
    ['flash-sale-cache'],
    { revalidate: 3600, tags: ['banners'] }
);

/**
 * 👗 FASHION QUIZ CONFIG CACHE
 */
export const getFashionQuizConfig = unstable_cache(
    async () => {
        try {
            const snap = await getDoc(doc(db, 'site_config', 'fashion_quiz'));
            return snap.exists() ? snap.data() : { isActive: false };
        } catch (e: any) {
            console.error("Fashion Quiz fetch failed:", e);
            return { isActive: false };
        }
    },
    ['fashion-quiz-cache'],
    { revalidate: 3600, tags: ['settings'] }
);
/**
 * 👤 USER PROFILE CACHE
 */
export const getUserProfile = unstable_cache(
    async (email: string) => {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                return { id: snap.docs[0].id, ...snap.docs[0].data() };
            }
            return null;
        } catch (e) {
            console.error("User profile fetch failed:", e);
            return null;
        }
    },
    ['user-profiles'],
    { revalidate: 300, tags: ['users'] } // 5 minute cache
);
