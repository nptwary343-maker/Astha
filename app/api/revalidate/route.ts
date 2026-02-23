export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_TOKEN = process.env.REVALIDATION_TOKEN || 'secure_token_123';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (body.token !== SECRET_TOKEN) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        // On Cloudflare Pages, revalidateTag is not available.
        // Cache is managed in-memory, so we just acknowledge the request.
        return NextResponse.json({ revalidated: true, now: Date.now(), tag: body.tag || 'all' });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}
