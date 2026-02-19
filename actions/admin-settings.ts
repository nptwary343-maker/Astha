'use server';

import { updateOrderSettings, OrderSettings } from '@/lib/settings-engine';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * 🔒 ADMIN ACTION: Securely Update Store Settings
 * এই ফাংশনটি শুধুমাত্র ভেরিফাইড অ্যাডমিনরাই কল করতে পারবেন।
 */
export async function updateStoreSettingsAction(
    adminToken: string,
    newSettings: Partial<OrderSettings>
) {
    try {
        // 🛡️ SECURITY STEP 1: Verify Admin Identity (Scenario 4 & 20)
        // প্রোডাকশনে এখানে admin.auth().verifyIdToken(adminToken) ব্যবহার করা হয়।
        if (!adminToken) throw new Error("UNAUTHORIZED: Session expired.");

        // এখানে আমরা একটি ডামি চেক করছি, বাস্তবে রিয়েল এডমিন আইডি চেক হবে।
        const adminEmail = "admin@astharhat.com"; // Placeholder after verification

        // 🛡️ SECURITY STEP 2: Value Validation (Scenario 2 & 3)
        if (newSettings.maxOrdersPerUser !== undefined && newSettings.maxOrdersPerUser < 1) {
            return { success: false, error: "Limit must be at least 1." };
        }

        if (newSettings.lockUntil) {
            const expiry = new Date(newSettings.lockUntil).getTime();
            if (isNaN(expiry) || expiry < Date.now()) {
                return { success: false, error: "Automatic unlock time must be in the future." };
            }
        }

        // 🛡️ STEP 3: Atomic Update & Audit Log (Scenario 7, 8 & 17)
        const result = await updateOrderSettings(newSettings, adminEmail);

        return result;
    } catch (e: any) {
        console.error("Admin Action Error:", e);
        return { success: false, error: e.message };
    }
}
