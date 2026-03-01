'use server';

import { algoliasearch } from 'algoliasearch';

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'NS1FPYWGCF';
const ADMIN_API_KEY = process.env.ALGOLIA_WRITE_KEY || '9b26b0fba76a8a5dec5112a2cab3d493';
const INDEX_NAME = 'asthar_products';

const client = algoliasearch(APP_ID, ADMIN_API_KEY);

interface AlgoliaProduct {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    stock: number;
    brand?: string;
    updatedAt: number;
}

/**
 * 🛰️ SYNC PRODUCT TO ALGOLIA
 * Ensures the search index is always fresh.
 */
export async function syncProductToAlgoliaAction(product: any) {
    try {
        console.log(`📡 [ALGOLIA_SYNC_START] Syncing product: ${product.name} (${product.id})`);

        const record = {
            objectID: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            imageUrl: product.images?.[0] || null,
            stock: product.stock,
            brand: product.brand || 'Asthar Hat',
            updatedAt: Date.now()
        };

        await client.saveObject({
            indexName: INDEX_NAME,
            body: record
        });

        console.log(`✅ [ALGOLIA_SYNC_SUCCESS] Product ${product.id} pushed to index.`);
        return { success: true };
    } catch (error: any) {
        console.error("❌ [ALGOLIA_SYNC_ERROR]:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 🗑️ REMOVE PRODUCT FROM ALGOLIA
 */
export async function deleteProductFromAlgoliaAction(productId: string) {
    try {
        console.log(`📡 [ALGOLIA_DELETE_START] Removing product: ${productId}`);

        await client.deleteObject({
            indexName: INDEX_NAME,
            objectID: productId
        });

        console.log(`✅ [ALGOLIA_DELETE_SUCCESS] Product ${productId} removed from index.`);
        return { success: true };
    } catch (error: any) {
        console.error("❌ [ALGOLIA_DELETE_ERROR]:", error);
        return { success: false, error: error.message };
    }
}
