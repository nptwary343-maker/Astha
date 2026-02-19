'use server';

import clientPromise from '@/lib/mongodb-client';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

const DB_NAME = "astharhat_analytics";
const COLLECTION = "email_templates";

export interface EmailTemplate {
    _id?: string;
    name: string; // e.g. "order_confirmation"
    subject: string;
    body: string; // HTML content
    active: boolean;
    updatedAt: string;
}

export async function getEmailTemplates() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const templates = await db.collection(COLLECTION).find({}).toArray();
        return templates.map((t: any) => ({
            ...t,
            _id: t._id.toString()
        })) as EmailTemplate[];
    } catch (e) {
        console.error("Failed to fetch templates", e);
        return [];
    }
}

export async function saveEmailTemplate(template: EmailTemplate) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const { _id, ...data } = template;
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        if (_id) {
            await db.collection(COLLECTION).updateOne(
                { _id: new ObjectId(_id) },
                { $set: updateData }
            );
        } else {
            await db.collection(COLLECTION).insertOne(updateData);
        }

        revalidatePath('/admin/emails');
        return { success: true };
    } catch (e) {
        console.error("Failed to save template", e);
        return { success: false, error: "Failed to save" };
    }
}

export async function deleteEmailTemplate(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
        revalidatePath('/admin/emails');
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to delete" };
    }
}
