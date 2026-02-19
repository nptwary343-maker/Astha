'use server';

import { MongoClient } from 'mongodb';
import { revalidatePath } from 'next/cache';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "astharhat_analytics";

/**
 * 🛠️ Update AI Configuration in MongoDB
 */
export async function updateAIConfig(formData: FormData) {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

    const systemInstruction = formData.get('systemInstruction') as string;
    const modelName = formData.get('modelName') as string;
    const nsfwFilter = formData.get('nsfwFilter') === 'on';
    const provider = formData.get('searchProvider') as string;
    const tavilyKey = formData.get('tavilyKey') as string;
    const serperKey = formData.get('serperKey') as string;
    const activeKeysString = formData.get('activeKeys') as string;
    const activeKeys = activeKeysString.split(',').map(k => k.trim()).filter(Boolean);

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const col = db.collection("system_config");

        await col.updateOne(
            { _id: "ai_settings" as any },
            {
                $set: {
                    systemInstruction,
                    activeKeys,
                    model: modelName,
                    nsfwFilter,
                    searchConfig: {
                        provider,
                        tavilyKey,
                        serperKey
                    },
                    lastUpdated: Date.now()
                }
            },
            { upsert: true }
        );

        revalidatePath('/admin/ai-settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update AI config:", error);
        return { success: false, error: "Database update failed" };
    } finally {
        await client.close();
    }
}

/**
 * 📜 Add a new Wisdom Entry
 */
export async function addWisdomEntry(formData: FormData) {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

    const category = formData.get('category') as string;
    const core_philosophy = formData.get('philosophy') as string;
    const insight = formData.get('insight') as string;
    const hook = formData.get('hook') as string;

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const col = db.collection("wisdom_vault");

        await col.updateOne(
            { category: category as any },
            {
                $set: { category, core_philosophy, lastUpdated: Date.now() },
                $push: {
                    deep_insights: insight,
                    conversation_hooks: hook
                } as any
            },
            { upsert: true }
        );

        revalidatePath('/admin/ai-settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to add wisdom:", error);
        return { success: false, error: "Failed to save wisdom" };
    } finally {
        await client.close();
    }
}
