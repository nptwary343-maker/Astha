export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// SECURE: Use a secret token to prevent abuse
// In env: REVALIDATION_TOKEN=your_secret_token
const SECRET_TOKEN = process.env.REVALIDATION_TOKEN || 'secure_token_123';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // 1. Auth Check
        if (body.token !== SECRET_TOKEN) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        // 2. Revalidate Logic
        // Invalidate the 'product-pricing' tag we used in unstable_cache
        if (body.tag) {
            revalidateTag(body.tag);
            return NextResponse.json({ revalidated: true, now: Date.now(), tag: body.tag });
        }

        // Default to pricing tag
        revalidateTag('product-pricing');

        return NextResponse.json({ revalidated: true, now: Date.now(), tag: 'product-pricing' });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}
