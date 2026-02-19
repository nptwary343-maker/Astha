'use server';

import { syncProduct as algoliaSync, deleteProduct as algoliaDelete, ProductRecord } from '@/lib/algolia-service';

/**
 * 🚀 SERVER ACTION: Secure Algolia Synchronization
 * This action runs on the server and has access to the WRITE_KEY.
 */
export async function syncProduct(productData: any, objectID: string) {
    try {
        // Map the fields correctly for the Algolia Service
        const record: ProductRecord = {
            id: objectID,
            name: productData.name,
            price: Number(productData.price),
            category: productData.category,
            imageUrl: productData.images?.[0] || '',
            stock: Number(productData.stock || 0),
            description: productData.description || '',
            brand: productData.brand || '',
            rating: Number(productData.rating || 0),
            updatedAt: new Date().toISOString()
        };

        await algoliaSync(record);
        return { success: true };
    } catch (error) {
        console.error("Algolia Sync Failed", error);
        // We log it but do not throw, as per safety rules
        return { success: false, error: 'Sync failed' };
    }
}

export async function deleteProduct(objectID: string) {
    try {
        await algoliaDelete(objectID);
        return { success: true };
    } catch (error) {
        console.error("Algolia Delete Failed", error);
        return { success: false, error: 'Delete failed' };
    }
}
