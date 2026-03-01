export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { clearProductCache } from '@/lib/db-utils';

const SECRET_TOKEN = process.env.REVALIDATION_TOKEN || '';

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Handle both body and query param for flexibility
        let body: any = {};
        try {
            const clonedReq = request.clone();
            body = await clonedReq.json();
        } catch (e) { }

        const token = secret || body.token;

        if (token !== SECRET_TOKEN) {
            console.warn("🚫 [REVALIDATE] Unauthorized attempt.");
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        // On Cloudflare Pages, we clear the in-memory cache in the Edge runtime
        clearProductCache();

        console.log("✅ [REVALIDATE] Cache cleared via API.");
        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            tag: body.tag || searchParams.get('tag') || 'all',
            message: "In-memory cache purged successfully."
        });
    } catch (err) {
        console.error("❌ [REVALIDATE] Error:", err);
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}
