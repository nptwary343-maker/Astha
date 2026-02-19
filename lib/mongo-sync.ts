import { mongoDataApi } from './mongo-data-api';
import { getCachedProducts } from '@/lib/db-utils';

// Types kept for compatibility if needed elsewhere
export type MongoProduct = {
    firebaseId: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    tags?: string[];
    images: string[];
    stock: number;
    updatedAt: number;
};

export type MongoOrder = any;

import { revalidatePath } from 'next/cache';

export async function syncProductToMongo(product: MongoProduct) {
    console.log(`📡 [EDGE_SYNC] Syncing Product: ${product.name}`);

    // Perform actual write via Data API
    await mongoDataApi.updateOne(
        'products',
        { firebaseId: product.firebaseId },
        { $set: { ...product, updatedAt: Date.now() } },
        true // Upsert
    );

    revalidatePath('/', 'layout');
    return { success: true };
}

export async function deleteProductFromMongo(firebaseId: string) {
    console.log(`📡 [EDGE_SYNC] Deleting Product ID: ${firebaseId}`);

    await mongoDataApi.deleteOne('products', { firebaseId });

    revalidatePath('/', 'layout');
    return { success: true };
}

export async function syncOrderToMongo(order: any) {
    console.log(`📡 [EDGE_SYNC] Syncing Order: ${order.orderId}`);

    await mongoDataApi.insertOne('orders', {
        ...order,
        syncedAt: Date.now()
    });

    return { success: true };
}

/**
 * 🧠 AI_CONTEXT: Fetch Product Context for Daisy (Edge Optimization)
 * Now fetches directly from the validated Firebase Cache via `db-utils`
 */
export async function getMongoProductContext() {
    try {
        // 1. Fetch from Global Cache (Fast, 1-hour revalidate)
        const products = await getCachedProducts();

        if (!products || products.length === 0) {
            return {
                totalProducts: 0,
                categories: 'None',
                priceRange: 'N/A',
                sampleProducts: 'Empty',
                storeHealth: { totalOrders: "N/A", revenue: "N/A", pending: 0 },
                longTermAnalytics: { reportAvailableFor: "Edge Mode" }
            };
        }

        // 2. Compute Context (On the fly, lightweight)
        const totalProducts = products.length;
        const prices = products.map((p: any) => Number(p.price) || 0);
        const categories = [...new Set(products.map((p: any) => p.category))];

        // Simple sampling
        const sampleProducts = products.slice(0, 10).map((p: any) => `${p.name} (৳${p.price})`).join(', ');

        return {
            totalProducts,
            categories: categories.join(', '),
            priceRange: prices.length > 0 ? `৳${Math.min(...prices)} - ৳${Math.max(...prices)}` : 'N/A',
            sampleProducts,
            storeHealth: {
                totalOrders: "Unknown (Edge)", // Analytics disabled on Edge
                revenue: "Unknown (Edge)",
                pending: 0
            },
            longTermAnalytics: {
                reportAvailableFor: "Edge Mode (No Mongo)"
            }
        };

    } catch (error) {
        console.error("❌ [CONTEXT_ERROR]", error);
        return null;
    }
}
