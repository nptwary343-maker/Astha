import { algoliasearch } from 'algoliasearch';

// Initialize the client with the App ID and Write Key (Server-side only)
// Note: ALGOLIA_WRITE_KEY should NOT be prefixed with NEXT_PUBLIC to keep it secret.
const app_id = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const write_key = process.env.ALGOLIA_WRITE_KEY || '';

const client = algoliasearch(app_id, write_key);
const INDEX_NAME = 'asthar_products';

export const syncProductToAlgolia = async (productData: any, objectID: string) => {
    if (!app_id || !write_key) {
        console.warn("Algolia credentials missing. Skipping sync.");
        return;
    }

    try {
        // Format data for Algolia (e.g., ensure numbers are numbers, dates are timestamps)
        const record = {
            objectID,
            name: productData.name,
            price: Number(productData.price),
            category: productData.category,
            description: productData.description,
            imageUrl: productData.images?.[0] || '',
            stock: Number(productData.stock || 0),
            updatedAt: Date.now() // Use current timestamp for indexing
        };

        await client.saveObject({
            indexName: INDEX_NAME,
            body: record
        });
        console.log(`Successfully synced product ${objectID} to Algolia.`);
    } catch (error) {
        console.error("Error syncing to Algolia:", error);
    }
};

export const deleteProductFromAlgolia = async (objectID: string) => {
    if (!app_id || !write_key) return;

    try {
        await client.deleteObject({
            indexName: INDEX_NAME,
            objectID: objectID
        });
        console.log(`Successfully deleted product ${objectID} from Algolia.`);
    } catch (error) {
        console.error("Error deleting from Algolia:", error);
    }
};
