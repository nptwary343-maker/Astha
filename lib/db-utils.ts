// lib/db-utils.ts
import { db } from './firebase';
import { collection, getDocs, query, limit, doc, getDoc, where } from 'firebase/firestore';
import { FALLBACK_PRODUCTS, FALLBACK_SETTINGS } from './fallback-data';

/**
 * 📦 SIMPLE IN-MEMORY CACHE (Edge-compatible)
 * unstable_cache does NOT work on Cloudflare Pages edge runtime.
 */
let _productCache: any[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 🛠️ Updated: 5 minutes instead of 1 hour

/**
 * 🧹 CLEAR CACHE (Call this after Admin updates)
 */
export const clearProductCache = () => {
    console.log("🧹 [CACHE_CLEAR] Purging in-memory product cache.");
    _productCache = null;
    _cacheTime = 0;
};


export const getCachedProducts = async () => {
    const now = Date.now();
    if (_productCache && (now - _cacheTime) < CACHE_TTL) {
        return _productCache;
    }

    console.log("🔥 [FIREBASE_HIT] Fetching products (Limit 200)...");
    try {
        const q = query(collection(db, 'products'), limit(200));
        const snap = await getDocs(q);
        const data = snap.empty ? [] : snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
        console.log(`✅ [CACHE_REFILLED] Loaded ${data.length} products.`);
        _productCache = data.length > 0 ? data : FALLBACK_PRODUCTS;
        _cacheTime = now;
        return _productCache;
    } catch (e: any) {
        console.error("Firebase read failed:", e.code || e.message);
        if (e.code === 'resource-exhausted' || e.message?.includes('quota')) {
            console.warn("⚠️ [QUOTA_EXCEEDED] Providing fallback products.");
        }
        return FALLBACK_PRODUCTS;
    }
};


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
 * ⚙️ SITE SETTINGS (Edge-compatible)
 */
export const getSiteSettings = async () => {
    try {
        const mainSnap = await getDoc(doc(db, 'settings', 'general'));
        const footerSnap = await getDoc(doc(db, 'site_config', 'footer_master'));
        return {
            ...(mainSnap.exists() ? mainSnap.data() : {}),
            ...(footerSnap.exists() ? footerSnap.data() : {}),
            _lastUpdated: Date.now()
        };
    } catch (e: any) {
        console.error("Settings fetch failed:", e.code || e.message);
        return FALLBACK_SETTINGS;
    }
};

/**
 * 🔍 FIND SIMILAR PRODUCTS (By Name/Category for Brand Options)
 */
export const getSimilarProducts = async (productName: string, category: string, currentId: string) => {
    const all = await getCachedProducts();
    const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-');
    const baseName = normalize(productName);

    return all.filter((p: any) =>
        p.id !== currentId &&
        (normalize(p.name).includes(baseName) || baseName.includes(normalize(p.name)) || p.category === category)
    ).slice(0, 10);
};

/**
 * 🎨 HERO BANNER CONFIG (Edge-compatible)
 */
export const getBannerConfig = async () => {
    try {
        const snap = await getDoc(doc(db, 'site_config', 'hero_banner'));
        return snap.exists() ? snap.data() : null;
    } catch (e: any) {
        console.error("Banner fetch failed:", e);
        return null;
    }
};

/**
 * ⚡ FLASH SALE CONFIG (Edge-compatible)
 */
export const getFlashSaleConfig = async () => {
    try {
        const snap = await getDoc(doc(db, 'site_config', 'flash_sale'));
        return snap.exists() ? snap.data() : null;
    } catch (e: any) {
        console.error("Flash Sale fetch failed:", e);
        return null;
    }
};

/**
 * 👗 FASHION QUIZ CONFIG (Edge-compatible)
 */
export const getFashionQuizConfig = async () => {
    try {
        const snap = await getDoc(doc(db, 'site_config', 'fashion_quiz'));
        return snap.exists() ? snap.data() : { isActive: false };
    } catch (e: any) {
        console.error("Fashion Quiz fetch failed:", e);
        return { isActive: false };
    }
};

/**
 * 👤 USER PROFILE (Edge-compatible)
 */
export const getUserProfile = async (email: string) => {
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
};

/**
 * 🤝 PARTNERS (Dynamic Marquee)
 */
export const getActivePartners = async () => {
    try {
        const q = query(collection(db, 'partners'), where('active', '==', true));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    } catch (e) {
        console.error("Partners fetch failed:", e);
        return [];
    }
};

/**
 * 🎫 COUPONS (Dynamic Rewards)
 */
export const getActiveCoupons = async () => {
    try {
        const q = query(collection(db, 'coupons'), where('active', '==', true));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        // Filter in-memory to avoid composite index requirement
        return data.filter(c => c.isPublic === true);
    } catch (e) {
        console.error("Coupons fetch failed:", e);
        return [];
    }
};

/**
 * 📍 BUSINESS LOCATIONS
 */
export const getBusinessLocations = async () => {
    try {
        const q = query(collection(db, 'businessLocations'), where('active', '==', true));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Locations fetch failed:", e);
        return [];
    }
};

/**
 * 🖼️ HOME BANNERS (Dynamic Carousel)
 */
export const getHomeBanners = async () => {
    try {
        const q = query(collection(db, 'homeBanners'), where('active', '==', true));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    } catch (e) {
        console.error("Home Banners fetch failed:", e);
        return [];
    }
};

/**
 * 🧩 PRODUCT BLOCKS (Location-aware)
 */
export const getProductBlocks = async (locationId: string = 'all') => {
    try {
        const q = query(collection(db, 'productBlocks'), where('active', '==', true));
        const snap = await getDocs(q);
        const allBlocks = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

        // Filter by location if specified
        if (locationId !== 'all') {
            return allBlocks.filter(b => b.locationIds?.includes(locationId) || b.locationIds?.includes('all'));
        }
        return allBlocks;
    } catch (e) {
        console.error("Product Blocks fetch failed:", e);
        return [];
    }
};
