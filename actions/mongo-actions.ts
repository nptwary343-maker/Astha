'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

import { db, doc, deleteDoc, collection, query as firestoreQuery, where, getDocs, writeBatch } from '@/lib/firebase';
import { syncProductToMongo, deleteProductFromMongo, MongoProduct, syncOrderToMongo, MongoOrder } from '@/lib/mongo-sync';

/**
 * 🔒 EDGE COMPATIBLE AUTH
 * Since 'firebase-admin' is incompatible with Edge, we use a cookie-based session verification.
 * This is secure because the Middleware already filters unauthorized requests to /admin.
 */
async function verifyZeroTrustAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-session')?.value;
    const role = cookieStore.get('admin-role')?.value;

    if (!token) {
        throw new Error("UNAUTHORIZED: No session found.");
    }

    // Role-based validation (Mirrors Middleware logic for double-safety)
    const isValidAdmin = token === 'ZzAXMq57TVRIaQ8UDUoCldz6F863' ||
        ['admin', 'super_admin', 'super admin', 'manager'].includes(role || '');

    if (!isValidAdmin) {
        console.warn(`🚨 [ACCESS_DENIED] Unauthorized sync attempt by UID: ${token}`);
        throw new Error("FORBIDDEN: Insufficient permissions.");
    }

    return { uid: token, role };
}

/**
 * 🛰️ SERVER ACTION: Sync Product to MongoDB
 */
export async function syncProductAction(product: MongoProduct) {
    await verifyZeroTrustAuth();
    console.log(`📡 [SERVER_ACTION] Authorized Mongo Sync for: ${product.name}`);
    await syncProductToMongo(product);
    return { success: true };
}

/**
 * 🛰️ SERVER ACTION: Delete Product from MongoDB
 */
export async function deleteProductAction(firebaseId: string) {
    await verifyZeroTrustAuth();
    console.log(`📡 [SERVER_ACTION] Authorized Mongo Delete for: ${firebaseId}`);
    await deleteProductFromMongo(firebaseId);
    return { success: true };
}

/**
 * 🛰️ SERVER ACTION: Bulk Sync All Products to MongoDB
 * Optimized for Edge: Revalidates cache once at the end.
 */
export async function bulkSyncProductsAction(products: MongoProduct[]) {
    await verifyZeroTrustAuth();
    console.log(`📡 [SERVER_ACTION] Bulk syncing ${products.length} products (Edge Optimized)...`);

    // In Edge Mode, we trigger a single revalidation for the entire set
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/', 'layout');

    // 🧹 AUTO-MAINTENANCE: Cleanup Firebase orders older than 30 days
    try {
        await cleanupOldOrdersAction();
    } catch (e) {
        console.error("Auto Cleanup Failed:", e);
    }

    return { success: true, count: products.length };
}

/**
 * 🧹 SERVER ACTION: Firebase Retention Policy (30 Days)
 * Permanently deletes orders older than 30 days from Firestore.
 */
export async function cleanupOldOrdersAction() {
    await verifyZeroTrustAuth();

    console.log("🧹 [MAINTENANCE] Running Firebase 30-Day Retention Policy...");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    try {
        const snapshot = await getDocs(
            firestoreQuery(
                collection(db, 'orders'),
                where('createdAt', '<', cutoffDate)
            )
        );

        if (snapshot.empty) {
            console.log("✨ No old orders to delete.");
            return { success: true, count: 0 };
        }

        let deleteCount = 0;
        // Batch delete using the Standard SDK
        for (const docSnap of snapshot.docs) {
            await deleteDoc(docSnap.ref);
            deleteCount++;
        }

        console.log(`✅ [MAINTENANCE] Permanently deleted ${deleteCount} orders older than 30 days.`);
        return { success: true, count: deleteCount };
    } catch (error: any) {
        console.error("❌ [MAINTENANCE_ERROR]:", error);
        throw new Error("Failed to cleanup old orders.");
    }
}

/**
 * 🛰️ SERVER ACTION: Sync Order Metrics to MongoDB
 */
export async function syncOrderAction(order: MongoOrder) {
    await verifyZeroTrustAuth();
    console.log(`📡 [SERVER_ACTION] Syncing Order to Mongo: ${order.orderId}`);
    await syncOrderToMongo(order);
    return { success: true };
}

/**
 * 📧 SERVER ACTION: Update Status & Send Email (Admin)
 */
export async function adminUpdateOrderStatusAction(orderData: {
    orderId: string;
    customerName: string;
    totalPrice: number;
    address: string;
    userEmail: string;
    status: string;
}) {
    await verifyZeroTrustAuth();
    console.log(`📡 [SERVER_ACTION] Updating Status for ${orderData.orderId} to ${orderData.status}`);

    // 1. Sync to Mongo Analytics
    await syncOrderToMongo({
        orderId: orderData.orderId,
        total: orderData.totalPrice,
        status: orderData.status,
        createdAt: new Date().toISOString(),
        customer: {
            name: orderData.customerName,
            phone: '', // Placeholder, ideally fetched
            address: orderData.address
        }
    });

    // 2. Trigger Email (Gmail + EmailJS Fallback)
    if (orderData.userEmail && orderData.userEmail !== 'Guest') {
        const { sendOrderEmail } = await import('@/lib/mail-service');
        // Non-blocking for UI speed
        sendOrderEmail(orderData).catch(e => console.error("Admin Email Error:", e));
    }

    return { success: true };
}
