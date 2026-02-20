export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        error: "EDGE_MIGRATION: Security Audit Tool is disabled on Cloudflare Pages (Requires Node.js Runtime).",
        status: "disabled"
    }, { status: 404 });
}
