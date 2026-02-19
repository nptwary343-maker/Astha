/**
 * 🍃 MONGODB DATA API CLIENT (Edge Compatible)
 * Standard MongoDB driver doesn't work on Cloudflare Edge (TCP restricted).
 * This client uses HTTPS to interact with MongoDB Atlas Data API.
 */

const API_KEY = process.env.MONGODB_DATA_API_KEY;
const API_URL = process.env.MONGODB_DATA_API_URL;
const CLUSTER = process.env.MONGODB_CLUSTER_NAME || process.env.MONGODB_CLUSTER || 'Cluster0';
const DATABASE = process.env.MONGODB_DATABASE_NAME || process.env.MONGODB_DB || 'astharhat_analytics';

async function fetchMongo(action: string, body: any) {
    if (!API_KEY || !API_URL) {
        console.warn("⚠️ MONGODB_DATA_API_KEY or URL is missing. MongoDB fallback disabled.");
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/action/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': API_KEY,
            },
            body: JSON.stringify({
                dataSource: CLUSTER,
                database: DATABASE,
                ...body
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MongoDB Data API Error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ MongoDB ${action} failed:`, error);
        return null;
    }
}

export const mongoDataApi = {
    async findOne(collection: string, filter: any) {
        return fetchMongo('findOne', { collection, filter });
    },

    async find(collection: string, filter: any = {}, limit: number = 20) {
        return fetchMongo('find', { collection, filter, limit });
    },

    async insertOne(collection: string, document: any) {
        return fetchMongo('insertOne', { collection, document });
    },

    async updateOne(collection: string, filter: any, update: any, upsert: boolean = true) {
        return fetchMongo('updateOne', { collection, filter, update, upsert });
    },

    async deleteOne(collection: string, filter: any) {
        return fetchMongo('deleteOne', { collection, filter });
    }
};
