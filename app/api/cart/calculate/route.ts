export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { calculateCart, UserContext } from '@/lib/cart-calculator';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { sanitizeInput } from '@/lib/security';

// Node runtime for Firebase support

// Step 4a Fix: Module-level Map does NOT persist across Cloudflare Edge invocations.
// Each request gets a fresh isolate — in-memory rate limiting is stateless and broken.
// TODO: Replace with Cloudflare KV-based rate limiting when needed.
// For now, rate limiting is DISABLED to prevent false-positive 429 blocks.
function checkRateLimit(_ip: string): boolean {
    return true; // Always allow — stateless edge environment
}

const getCachedProduct = async (id: string) => {
    const docRef = doc(db, 'products', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        const data = snap.data();
        return {
            id,
            name: data.name || "Unnamed Product",
            price: Number(data.price || 0),
            stock: Number(data.stock ?? 0),
            taxPercent: Number(data.taxPercent || 0),
            category: data.category || "General",
            discount: data.discount,
            discountType: data.discountType,
            discountValue: data.discountValue ? Number(data.discountValue) : 0
        };
    }
    return null;
};


export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Too many requests." }, { status: 429 });
        }

        const body = await req.json();
        const { items, userEmail: rawEmail, userTags } = body;

        const userEmail = rawEmail ? sanitizeInput(rawEmail).toLowerCase() : undefined;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // 3. Fetch Products (Cached)
        const productIds = items.map((i: any) => i.productId);
        const uniqueIds = Array.from(new Set(productIds)) as string[];
        const catalog: Record<string, any> = {};

        await Promise.all(uniqueIds.map(async (id) => {
            const product = await getCachedProduct(id);
            if (product) {
                catalog[id] = {
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                    taxPercent: product.taxPercent,
                    discountType: product.discountType,
                    discountValue: product.discountValue,
                    discountPercent: product.discount?.type === 'percent' ? Number(product.discount?.value || 0) : 0,
                    discountFlat: product.discount?.type === 'flat' ? Number(product.discount?.value || 0) : 0,
                };
            }
        }));

        // 3. User Context
        let verifiedTags = userTags || [];
        if (userEmail) {
            try {
                const { getUserProfile } = await import('@/lib/db-utils');
                const profile: any = await getUserProfile(userEmail);
                if (profile) {
                    verifiedTags = profile.tags || [];
                }
            } catch (e) {
                console.warn("User profile fetch failed, continuing with guest context.");
            }
        }

        const userContext: UserContext = {
            email: userEmail,
            tags: verifiedTags
        };

        // 4. Calculate
        const result = calculateCart(items, catalog, userContext);

        return NextResponse.json(result);

    } catch (error) {
        console.error("Calculation Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
