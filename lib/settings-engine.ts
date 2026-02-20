import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { unstable_cache, revalidateTag } from 'next/cache';

/**
 * 🛠️ SETTINGS ENGINE: Order Limits & Security
 * -------------------------------------------
 * এই মডিউলটি অ্যাডমিনের সেট করা লিমিটগুলো ম্যানেজ করে এবং ক্যাশ করে।
 */

export const SETTINGS_CACHE_TAG = 'store-settings'; // SCENARIO 18: Constant Tag

export interface OrderSettings {
    maxOrdersPerUser: number;
    timeWindowHours: number;
    globalLock: boolean;
    lockUntil?: string | null;
    syncMode?: boolean; // Toggle for "Middle Layer" sync logic (Instruction 1)
}

const DEFAULT_SETTINGS: OrderSettings = {
    maxOrdersPerUser: 50,
    timeWindowHours: 2,
    globalLock: false,
    lockUntil: null,
    syncMode: true // Default ON
};

export const getCachedOrderSettings = unstable_cache(
    async (): Promise<OrderSettings> => {
        console.log("📡 FETCHING_SETTINGS: Loading store limits...");
        try {
            const docRef = doc(db, 'settings', 'order_limits');
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const data = snap.data();
                const settings: OrderSettings = {
                    maxOrdersPerUser: Math.max(1, data.maxOrdersPerUser || 5), // SCENARIO 2
                    timeWindowHours: Math.max(1, data.timeWindowHours || 2),
                    globalLock: !!data.globalLock,
                    lockUntil: data.lockUntil || null,
                    syncMode: data.syncMode ?? true
                };

                // SCENARIO 3: Automatic Global Lock Expiry
                if (settings.globalLock && settings.lockUntil) {
                    if (new Date().toISOString() > settings.lockUntil) {
                        console.log("🔓 AUTO_UNLOCK: Maintenance window expired.");
                        settings.globalLock = false; // Graceful Restore
                    }
                }
                return settings;
            }
        } catch (e) {
            console.error("CRITICAL: Settings load failed, falling back to Fail-Safe (SCENARIO 6):", e);
        }
        return DEFAULT_SETTINGS;
    },
    ['global-order-settings'],
    { revalidate: 3600, tags: [SETTINGS_CACHE_TAG] } // SCENARIO 10: 1 Hour Revalidation
);

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

        // Instant Sync (SCENARIO 3)
        revalidateTag(SETTINGS_CACHE_TAG);

        return { success: true };
    } catch (e) {
        console.error("Update Settings Error:", e);
        return { success: false, error: "Failed to update settings" };
    }
}
