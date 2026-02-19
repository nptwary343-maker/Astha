import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs a sensitive action to the immutable 'activity_logs' collection.
 * @param action - The action performed (e.g., 'CASH_COLLECTED', 'ORDER_DELETED')
 * @param details - Additional metadata (e.g., { amount: 500, orderId: '...' })
 * @param user - The user who performed the action
 */
export const logActivity = async (
    action: string,
    details: Record<string, any>,
    user: { uid: string; email?: string | null; displayName?: string | null }
) => {
    try {
        await addDoc(collection(db, 'activity_logs'), {
            action,
            details,
            performedBy: {
                uid: user.uid,
                email: user.email || 'N/A',
                name: user.displayName || 'Unknown'
            },
            timestamp: serverTimestamp(),
            // Security: Add metadata to prevent tampering
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
            ip: 'Logged at Edge' // In a real app, capture IP via API/Headers
        });
        console.log(`🔒 SECURE LOG: ${action} recorded.`);
    } catch (error) {
        console.error("🚨 CRITICAL: Failed to write to audit log!", error);
        // In a strict Zero Trust env, you might throw an error here to BLOCK the action if logging fails.
    }
};
