'use server';

import { getSiteSettings } from '@/lib/db-utils';

/**
 * Server Action to fetch site settings.
 * Safe to be called from Client Components.
 */
export async function fetchSiteSettingsAction() {
    try {
        const data = await getSiteSettings();
        // Plain object serialization check
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("Failed to fetch site settings:", error);
        return null;
    }
}

export async function fetchProductsAction() {
    try {
        const { getCachedProducts } = await import('@/lib/db-utils');
        const data = await getCachedProducts();
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

export async function fetchBannerConfigAction() {
    try {
        const { getBannerConfig } = await import('@/lib/db-utils');
        const data = await getBannerConfig();
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (error) {
        console.error("Failed to fetch banner config:", error);
        return null;
    }
}

export async function fetchFlashSaleConfigAction() {
    try {
        const { getFlashSaleConfig } = await import('@/lib/db-utils');
        const data = await getFlashSaleConfig();
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (error) {
        console.error("Failed to fetch flash sale config:", error);
        return null;
    }
}

export async function fetchFashionQuizAction() {
    try {
        const { getFashionQuizConfig } = await import('@/lib/db-utils');
        const data = await getFashionQuizConfig();
        return data ? JSON.parse(JSON.stringify(data)) : { isActive: false };
    } catch (error) {
        console.error("Failed to fetch fashion quiz config:", error);
        return { isActive: false };
    }
}
