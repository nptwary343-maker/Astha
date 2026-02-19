import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, limit } from 'firebase/firestore';
import { sendPixelEvent } from '@/lib/capi-bridge';

export const runtime = 'edge';

/**
 * ⚡ PERIODIC 5-HOUR SYNC (Rule 4)
 * এই এপিআই রুটটি ৫ ঘণ্টা পর পর কল করা হবে যাতে ডেলিভারি স্ট্যাটাস পিক্সেলে সিঙ্ক হয়।
 */
export async function GET(request: Request) {
    // 🛡️ SECURITY: Only allow with a secret key
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("🕒 SYNC_START: Starting 5-hour delivery status sync...");

        // ৫ ঘণ্টা আগের সময় ক্যালকুলেট করছি
        const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

        // ফায়ারবেস থেকে গত ৫ ঘণ্টার 'Delivered' অর্ডারগুলো খুঁজছি
        const ordersQuery = query(
            collection(db, 'orders'),
            where('status', '==', 'Delivered'),
            where('updatedAt', '>', fiveHoursAgo), // assuming we track updatedAt
            limit(50) // 🛡️ API Limit Protection (Batching)
        );

        const snapshot = await getDocs(ordersQuery);
        let syncCount = 0;

        // 🔥 REFACTORED: Parallel Execution using Promise.allSettled
        const pixelPromises = snapshot.docs.map(async (doc) => {
            const order = doc.data();

            // 📡 পিক্সেলকে 'Delivery' ইভেন্ট জানানো হচ্ছে
            await sendPixelEvent(
                'Delivery' as any,
                {
                    phone: order.customer?.phone,
                    ip: order.security_fingerprint?.ip,
                    userAgent: order.security_fingerprint?.userAgent
                },
                {
                    orderId: order.id,
                    value: order.totals?.total || 0,
                    currency: 'BDT'
                },
                `DELIVERY-${order.id}`
            );
            return order.id; // সাকসেস হলে আইডির রেকর্ড থাকলো
        });

        // Promise.allSettled সবগুলোর জন্য অপেক্ষা করবে
        const results = await Promise.allSettled(pixelPromises);

        // কয়টা সাকসেস আর কয়টা ফেইল হলো সেটা আলাদা করা
        const successfulSyncs = results.filter(result => result.status === 'fulfilled').length;
        const failedSyncs = results.filter(result => result.status === 'rejected').length;

        // চাইলে ফেইল হওয়া রিজনগুলোও লগ করতে পারো
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`❌ Sync failed for order index ${index}:`, (result as PromiseRejectedResult).reason);
            }
        });

        console.log(`✅ SYNC_COMPLETE: Synced ${successfulSyncs} delivery events. Failed: ${failedSyncs}`);

        return NextResponse.json({
            success: true,
            synced: successfulSyncs,
            failed: failedSyncs
        });

    } catch (error) {
        console.error("❌ SYNC_ERROR:", error);
        return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
    }
}
