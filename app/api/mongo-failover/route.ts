export const runtime = 'edge';
import { NextResponse } from 'next/server';

import { mongoDataApi } from '@/lib/mongo-data-api';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderData, secret } = body;
        const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

        // 🛡️ SECURITY CHECK
        if (secret !== INTERNAL_SECRET) {
            console.error("🚨 UNAUTHORIZED_FAILOVER_ATTEMPT");
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const result = await mongoDataApi.insertOne('emergency_orders', {
            ...orderData,
            meta_recovered_at: new Date().toISOString(),
            _status: 'FAILOVER_BACKUP'
        });

        if (!result) {
            throw new Error("Data API Sync Failed");
        }

        return NextResponse.json({
            success: true,
            id: result.insertedId,
            message: "Saved to MongoDB Secondary (Edge Core)"
        });

    } catch (error: any) {
        console.error("❌ FAILOVER_CRITICAL_ERROR:", error.message);
        return NextResponse.json({ error: "Failover failed" }, { status: 500 });
    }
}
