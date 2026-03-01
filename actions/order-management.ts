'use server';

import { db, collection, doc, addDoc, updateDoc, serverTimestamp } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

/**
 * 🚀 CREATE ORDER ACTION (Unified for Manual & Failover)
 * This ensures all orders have consistent fields and trigger notifications.
 */
export async function createOrderAction(orderData: any) {
    try {
        // 1. Ensure consistency
        const sanitizedOrder = {
            ...orderData,
            orderStatus: orderData.orderStatus || 'Pending',
            status: orderData.status || 'Pending', // Top level status
            createdAt: orderData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: orderData.source || 'manual'
        };

        // 2. Save to Firestore
        const docRef = await addDoc(collection(db, 'orders'), sanitizedOrder);
        const orderId = docRef.id;

        // 3. Trigger Telegram Notification in background
        try {
            const { sendOrderToTelegram } = await import('@/services/telegramBot');
            // Mock order ID for telegram if it doesn't have one
            const telegramPayload = {
                ...sanitizedOrder,
                orderId: orderData.invoiceNumber ? `MAN-${orderData.invoiceNumber}` : orderId
            };
            await sendOrderToTelegram(telegramPayload);
        } catch (teleErr) {
            console.error("📢 Telegram Notification Error (Manual Order):", teleErr);
        }

        revalidatePath('/admin/orders');
        return { success: true, id: orderId };
    } catch (error: any) {
        console.error("❌ CREATE_ORDER_ACTION_FAILED:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 🔄 UPDATE ORDER STATUS ACTION
 * Updates both fields for consistency across the system.
 */
export async function updateOrderStatusAction(orderId: string, newStatus: string) {
    try {
        const orderRef = doc(db, 'orders', orderId);

        await updateDoc(orderRef, {
            orderStatus: newStatus,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        console.error("❌ UPDATE_STATUS_FAILED:", error);
        return { success: false, error: error.message };
    }
}
