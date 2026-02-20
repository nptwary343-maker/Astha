export const runtime = 'edge';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paramsToSign, secret } = body;
        const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

        // 🛡️ SECURITY CHECK
        if (secret !== INTERNAL_SECRET) {
            console.error("🚨 UNAUTHORIZED_CLOUDINARY_SIGN_ATTEMPT");
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!apiSecret) {
            console.error("Cloudinary Secret Missing");
            return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
        }

        // 1. Sort keys alphabetically
        const sortedKeys = Object.keys(paramsToSign).sort();

        // 2. Create signature string: key=value&key2=value2... + secret
        const signatureString = sortedKeys
            .map(key => `${key}=${paramsToSign[key]}`)
            .join('&') + apiSecret;

        // 3. SHA-1 Hash (Web Crypto API - Edge Compatible)
        const msgBuffer = new TextEncoder().encode(signatureString);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return NextResponse.json({ signature });
    } catch (error) {
        console.error("Sign Error:", error);
        return NextResponse.json({ error: 'Failed to sign' }, { status: 500 });
    }
}
