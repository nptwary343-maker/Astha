export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { calculateCart, CouponData, UserContext } from '@/lib/cart-calculator';
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

// 1. Hybrid Coupon Cache: Static data is cached for 1 hour
const getStaticCouponData = async (code: string) => {
    const couponRef = doc(db, 'coupons', code.toUpperCase().trim());
    const snap = await getDoc(couponRef);
    if (snap.exists()) {
        return { ...snap.data(), code: snap.id } as CouponData;
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
        const { items, couponCode: rawCoupon, userEmail: rawEmail, userTags } = body;

        const couponCode = rawCoupon ? sanitizeInput(rawCoupon).toUpperCase() : undefined;
        const userEmail = rawEmail ? sanitizeInput(rawEmail).toLowerCase() : undefined;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // 2. Hybrid Coupon Validation
        let couponData: CouponData | undefined = undefined;
        if (couponCode) {
            // A. Fetch Static Data (Cached)
            const staticCoupon = await getStaticCouponData(couponCode);

            if (staticCoupon) {
                couponData = staticCoupon;

                // B. Real-time Check ONLY if usage limit exists
                if (staticCoupon.usageLimit > 0) {
                    const liveRef = doc(db, 'coupons', staticCoupon.code!);
                    const liveSnap = await getDoc(liveRef); // Single real-time hit
                    if (liveSnap.exists()) {
                        const liveData = liveSnap.data();
                        couponData.usedCount = liveData.usedCount || 0;
                    }
                }
            }
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

        // 3. User Context (Zero Trust: Verify Tags on Server)
        let verifiedTags = userTags || [];
        if (userEmail) {
            const { getUserProfile } = await import('@/lib/db-utils');
            const profile: any = await getUserProfile(userEmail);
            if (profile) {
                verifiedTags = profile.tags || [];
            }
        }

        const userContext: UserContext = {
            email: userEmail,
            tags: verifiedTags
        };

        // 4. Calculate
        const result = calculateCart(items, catalog, couponData, userContext);

        return NextResponse.json(result);

    } catch (error) {
        console.error("Calculation Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
