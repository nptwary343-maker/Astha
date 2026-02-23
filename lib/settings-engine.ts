import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * 🛠️ SETTINGS ENGINE: Order Limits & Security
 * -------------------------------------------
 * এই মডিউলটি অ্যাডমিনের সেট করা লিমিটগুলো ম্যানেজ করে।
 */

export const SETTINGS_CACHE_TAG = 'store-settings';

export interface OrderSettings {
    maxOrdersPerUser: number;
    timeWindowHours: number;
    globalLock: boolean;
    lockUntil?: string | null;
    syncMode?: boolean;
}

const DEFAULT_SETTINGS: OrderSettings = {
    maxOrdersPerUser: 50,
    timeWindowHours: 2,
    globalLock: false,
    lockUntil: null,
    syncMode: true
};

export const getCachedOrderSettings = async (): Promise<OrderSettings> => {
    console.log("📡 FETCHING_SETTINGS: Loading store limits...");
    try {
        const docRef = doc(db, 'settings', 'order_limits');
        const snap = await getDoc(docRef);

        if (snap.exists()) {
            const data = snap.data();
            const settings: OrderSettings = {
                maxOrdersPerUser: Math.max(1, data.maxOrdersPerUser || 5),
                timeWindowHours: Math.max(1, data.timeWindowHours || 2),
                globalLock: !!data.globalLock,
                lockUntil: data.lockUntil || null,
                syncMode: data.syncMode ?? true
            };

            if (settings.globalLock && settings.lockUntil) {
                if (new Date().toISOString() > settings.lockUntil) {
                    console.log("🔓 AUTO_UNLOCK: Maintenance window expired.");
                    settings.globalLock = false;
                }
            }
            return settings;
        }
    } catch (e) {
        console.error("CRITICAL: Settings load failed:", e);
    }
    return DEFAULT_SETTINGS;
};

export async function updateOrderSettings(newSettings: Partial<OrderSettings>, adminEmail: string) {
    try {
        const docRef = doc(db, 'settings', 'order_limits');

        // SCENARIO 8: Audit Log Flooding Prevention (Deep Compare simulation)
        const oldSnap = await getDoc(docRef);
        const oldData = oldSnap.exists() ? oldSnap.data() : {};

        const hasActualChanges = Object.keys(newSettings).some(
            key => (newSettings as any)[key] !== oldData[key]
        );

        if (!hasActualChanges) return { success: true, message: "No changes detected." };

        await setDoc(docRef, {
            ...newSettings,
            updatedBy: adminEmail,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // Audit Log with Priority Flag (SCENARIO 20)
        const logRef = doc(db, 'audit_logs', `log_${Date.now()}`);
        await setDoc(logRef, {
            action: 'UPDATE_LIMITS',
            isPriority: newSettings.globalLock !== undefined, // Scenario 20
            performedBy: adminEmail,
            data: newSettings,
            timestamp: serverTimestamp()
        });

        // Settings updated - cache will refresh on next request

        return { success: true };
    } catch (e) {
        console.error("Update Settings Error:", e);
        return { success: false, error: "Failed to update settings" };
    }
}
