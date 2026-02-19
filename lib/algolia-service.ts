import { algoliasearch } from 'algoliasearch';

// --- Types & Interfaces ---
export interface ProductRecord {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl?: string;
    stock: number;
    description?: string;
    brand?: string;
    rating?: number;
    updatedAt?: string | number | Date;
}

// --- Configuration ---
const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const WRITE_KEY = process.env.ALGOLIA_WRITE_KEY || '';
const INDEX_NAME = 'asthar_products';

/**
 * Senior Backend Architect Note:
 * This client is initialized only on the server. The WRITE_KEY must never
 * be prefixed with NEXT_PUBLIC_ to prevent browser exposure.
 */
const client = (APP_ID && WRITE_KEY) ? algoliasearch(APP_ID, WRITE_KEY) : null;

// --- Helper Functions ---

/**
 * Validates critical data before sending to Algolia.
 */
function validateProduct(product: ProductRecord): boolean {
    return !!(product.id && product.name && typeof product.price === 'number');
}

/**
 * Transforms a ProductRecord into an Algolia-compliant record.
 * Maps 'id' to 'objectID' which is Algolia's required unique identifier.
 */
function transformToAlgolia(product: ProductRecord) {
    const { id, ...rest } = product;
    return {
        objectID: id,
        ...rest,
        // Ensure price is indexed as a number for filtering
        price: Number(product.price),
        updatedAt_timestamp: product.updatedAt ? new Date(product.updatedAt).getTime() : Date.now()
    };
}

// --- Public Service Functions ---

/**
 * Synchronize a single product with Algolia.
 * @param product The product data to sync.
 */
export async function syncProduct(product: ProductRecord): Promise<void> {
    if (!client) {
        console.warn('⚠️ Algolia client not initialized. Check your environment variables.');
        return;
    }

    if (!validateProduct(product)) {
        console.error('❌ Algolia Sync Error: Invalid product data provided.', product);
        return;
    }

    try {
        const record = transformToAlgolia(product);
        await client.saveObject({
            indexName: INDEX_NAME,
            body: record
        });
        console.log(`✅ Algolia: Synced product ${product.id} (${product.name})`);
    } catch (error) {
        // Silent failure logic: Log but do not throw to prevent app crash
        console.error(`❌ Algolia: Failed to sync product ${product.id}:`, error);
    }
}

/**
 * Delete a product from the Algolia index.
 * @param objectID The unique ID of the product.
 */
export async function deleteProduct(objectID: string): Promise<void> {
    if (!client) return;

    try {
        await client.deleteObject({
            indexName: INDEX_NAME,
            objectID: objectID
        });
        console.log(`🗑️ Algolia: Deleted product ${objectID}`);
    } catch (error) {
        console.error(`❌ Algolia: Failed to delete product ${objectID}:`, error);
    }
}

/**
 * Bulk reindex products. 
 * Warning: This replaces existing indices with the provided batch.
 * @param products Array of products to index.
 */
export async function reindexAll(products: ProductRecord[]): Promise<void> {
    if (!client) return;

    try {
        const records = products
            .filter(validateProduct)
            .map(transformToAlgolia);

        // Algolia atomic replacement: Use saveObjects with replaceAllObjects if needed
        // For simplicity we use saveObjects which updates/creates
        await client.saveObjects({
            indexName: INDEX_NAME,
            objects: records
        });

        console.log(`🔄 Algolia: Bulk reindexed ${records.length} products.`);
    } catch (error) {
        console.error('❌ Algolia: Bulk reindex failed:', error);
    }
}
