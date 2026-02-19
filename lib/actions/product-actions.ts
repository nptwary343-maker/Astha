'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { revalidatePath, revalidateTag } from 'next/cache';
import { syncProductToMongo, deleteProductFromMongo, MongoProduct } from '@/lib/mongo-sync';

// ------------------------------------------------------------------
// 📦 PRODUCT ACTIONS (Dual Write Strategy)
// 1. Write to Firebase (Source of Truth) -> Secure, Transactional
// 2. Sync to MongoDB (AI Read Cache) -> Fast, Free Reads
// 3. Clear Next.js Cache (User Speed) -> Instant Updates
// ------------------------------------------------------------------

export async function createProduct(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const stock = parseInt(formData.get('stock') as string) || 0;
        const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()) || [];

        // 1. Firebase Write
        const productData = {
            name,
            price,
            category,
            description,
            stock,
            tags,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'products'), productData);

        // 2. MongoDB Sync (Non-blocking)
        const mongoPayload: MongoProduct = {
            firebaseId: docRef.id,
            name,
            price,
            category,
            description,
            tags,
            stock,

            images: [], // Placeholder to fix type error
            updatedAt: Date.now()
        };

        // Fire and forget sync (don't await to keep UI fast)
        syncProductToMongo(mongoPayload).catch(console.error);

        // 3. Revalidate Cache
        revalidatePath('/shop');
        revalidatePath('/admin/products');

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Create Product Error:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const stock = parseInt(formData.get('stock') as string) || 0;
        const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()) || [];

        // 1. Firebase Write
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, {
            name,
            price,
            category,
            description,
            stock,
            tags,
            updatedAt: serverTimestamp()
        });

        // 2. MongoDB Sync
        const mongoPayload: MongoProduct = {
            firebaseId: id,
            name,
            price,
            category,
            description,
            tags,
            stock,

            images: [], // Placeholder to fix type error
            updatedAt: Date.now()
        };
        syncProductToMongo(mongoPayload).catch(console.error);

        // 3. Revalidate
        revalidatePath(`/product/${id}`);
        revalidatePath('/shop');

        return { success: true };
    } catch (error) {
        console.error("Update Product Error:", error);
        return { success: false, error: "Failed to update" };
    }
}

export async function deleteProduct(id: string) {
    try {
        // 1. Firebase Delete
        await deleteDoc(doc(db, 'products', id));

        // 2. MongoDB Delete
        deleteProductFromMongo(id).catch(console.error);

        // 3. Revalidate
        revalidatePath('/shop');

        return { success: true };
    } catch (error) {
        console.error("Delete Product Error:", error);
        return { success: false };
    }
}
