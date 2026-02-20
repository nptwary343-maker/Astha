export const runtime = 'edge';
import { db } from '@/lib/firebase';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';

// This API is intended to be called by a Cron Job scheduler (e.g. Vercel Cron)
// Schedule: Every 3 hours
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Simple CRON_SECRET check (Environment variable should be set in production)
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // allowing bypass for dev/testing if env is not set
            if (process.env.NODE_ENV === 'production') {
                return new Response('Unauthorized', { status: 401 });
            }
        }

        console.log("⏰ CRON_JOB: Starting System Integrity Check...");

        // 1. Firebase Check (Source of Truth)
        const productsRef = collection(db, 'products');
        const snapshot = await getCountFromServer(productsRef);
        const firebaseCount = snapshot.data().count;

        // 2. MongoDB Check (Mid-Layer / AI Cache)
        let mongoCount = 0;
        let mongoStatus = "UNKNOWN";
        try {
            const { getMongoProductContext } = await import('@/lib/mongo-sync');
            const mongoContext = await getMongoProductContext();
            if (mongoContext) {
                mongoCount = mongoContext.totalProducts;
                mongoStatus = "CONNECTED";
            } else {
                mongoStatus = "FAILED";
            }
        } catch (e) {
            console.error("❌ Mongo Check Failed:", e);
            mongoStatus = "ERROR";
        }

        // 3. Sync Validation logic
        const isSynced = firebaseCount === mongoCount;
        const syncStatus = isSynced ? "PERFECT_SYNC" : "SYNC_DRIFT_DETECTED";

        console.log(`✅ INTEGRITY_CHECK: Firebase=${firebaseCount}, MongoDB=${mongoCount} | Status=${syncStatus}`);

        return new Response(JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            status: 'HEALTHY',
            metrics: {
                firebase_products: firebaseCount,
                mongodb_products: mongoCount,
                sync_status: syncStatus
            }
        }), {
            headers: { 'content-type': 'application/json' }
        });

    } catch (error: any) {
        console.error("❌ CRON_FAILED:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
