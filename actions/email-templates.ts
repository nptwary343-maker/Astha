'use server';

import { mongoDataApi } from '@/lib/mongo-data-api';
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
        const response = await mongoDataApi.find(COLLECTION, {}, 100);
        const templates = response?.documents || [];
        return templates.map((t: any) => ({
            ...t,
            _id: t._id?.toString() || ""
        })) as EmailTemplate[];
    } catch (e) {
        console.error("Failed to fetch templates", e);
        return [];
    }
}

export async function saveEmailTemplate(template: EmailTemplate) {
    try {
        const { _id, ...data } = template;
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        if (_id) {
            // Data API uses $oid for _id filtering if it's a real ObjectId string, 
            // but for simple cases we can try matching by string or skip ObjectId if it's stored as string.
            // Let's assume standard ObjectId string for now.
            await mongoDataApi.updateOne(
                COLLECTION,
                { _id: { $oid: _id } },
                { $set: updateData }
            );
        } else {
            await mongoDataApi.insertOne(COLLECTION, updateData);
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
        await mongoDataApi.deleteOne(COLLECTION, { _id: { $oid: id } });
        revalidatePath('/admin/emails');
        return { success: true };
    } catch (e) {
        console.error("Failed to delete template", e);
        return { success: false, error: "Failed to delete" };
    }
}
