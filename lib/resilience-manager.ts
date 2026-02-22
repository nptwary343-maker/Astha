// lib/resilience-manager.ts
import { db, addDoc, collection, serverTimestamp } from './firebase';

/**
 * 🛡️ SIMPLE WRITE WRAPPER
 * Focuses only on Firebase. MongoDB failover removed for simplification.
 */
export async function safeStoreOrder(orderData: any) {
    try {
        // Attempt Primary Storage (Firebase)
        const docRef = await addDoc(collection(db, 'orders'), {
            ...orderData,
            _engine: 'firebase',
            createdAt: serverTimestamp(),
        });

        // 📡 PULSE SIGNAL: Notify admin of new order activity
        await addDoc(collection(db, 'system_signals'), {
            type: 'ORDER_PLACED_SIGNAL',
            status: 'SUCCESS',
            orderId: docRef.id,
            timestamp: serverTimestamp(),
            source: 'resilience_manager'
        });

        return { success: true, id: docRef.id, engine: 'firebase' };
    } catch (error: any) {
        console.error("🚨 FIREBASE WRITE ERROR:", error.code || error.message);
        throw error;
    }
}

/**
 * 🔍 READ WRAPPER
 * Ensures that if a read fails, we provide UI-friendly static content.
 */
export function handleReadError(error: any, fallback: any) {
    console.error("🔥 DATABASE_READ_ERROR:", error);
    return fallback;
}
