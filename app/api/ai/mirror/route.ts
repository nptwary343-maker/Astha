export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AIMirrorService } from '@/lib/ai-mirror-service';

/**
 * ⚡ MIRROR SYNC API
 * Force sync products from Firebase to MongoDB to ensure AI has 0 Firebase hits.
 */
export const runtime = 'edge';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const SECRET = process.env.SYNC_SECRET || "astharhat-power-ai-sync-2026";

    if (token !== SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await AIMirrorService.syncProducts();
        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json({ error: "Mirror sync failed" }, { status: 500 });
    }
}
