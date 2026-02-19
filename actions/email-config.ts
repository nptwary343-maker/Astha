'use server';

import clientPromise from '@/lib/mongodb-client';
import { revalidatePath } from 'next/cache';

const DB_NAME = "astharhat_analytics";
const COLLECTION = "system_config";

export interface EmailConfig {
    provider: 'auto' | 'resend' | 'gmail' | 'emailjs';
    updatedAt: string;
}

export async function getEmailConfig() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const config = await db.collection(COLLECTION).findOne({ _id: 'email_settings' } as any);
        return { provider: config?.provider || 'auto' } as EmailConfig;
    } catch (e) {
        return { provider: 'auto' };
    }
}

export async function updateEmailConfig(provider: string) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        await db.collection(COLLECTION).updateOne(
            { _id: 'email_settings' } as any,
            { $set: { provider, updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        revalidatePath('/admin/emails');
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to update" };
    }
}
