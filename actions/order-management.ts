'use server';

import { db, collection, doc, updateDoc, runTransaction, increment } from '@/lib/firebase';
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

        // 2. Save to Firestore using an atomic transaction to decrease stock reliably
        const orderId = await runTransaction(db, async (transaction: any) => {
            // Validate and map product refs first to maintain zero write skew
            const itemsWithData = await Promise.all((orderData.items || []).map(async (item: any) => {
                // For manually added items without a true product match (custom manual items), we skip
                if (!item.id || typeof item.id === 'number') return { item, productRef: null, exists: false };

                const productRef = doc(db, 'products', item.id.toString());
                const snap = await transaction.get(productRef);
                return { item, productRef, exists: snap.exists() };
            }));

            // Create the order document
            const docRef = doc(collection(db, 'orders'));
            const generatedId = docRef.id;
            transaction.set(docRef, sanitizedOrder);

            // Perform stock decrements (Admin Override Privilege: we decrement even if stock goes negative)
            for (const { item, productRef, exists } of itemsWithData) {
                if (exists && productRef) {
                    transaction.update(productRef, {
                        stock: increment(-item.qty),
                        lastSoldAt: new Date().toISOString()
                    });
                }
            }

            return generatedId;
        });

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
            try {
                const orderRef = doc(db, 'orders', orderId);
                await updateDoc(orderRef, {
                    notificationError: true,
                    telegram_notified: false,
                    notificationErrorReason: teleErr instanceof Error ? teleErr.message : "Unknown error"
                });
            } catch (updateErr) {
                console.error("Failed to flag notification error in database (Manual Order)", updateErr);
            }
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
