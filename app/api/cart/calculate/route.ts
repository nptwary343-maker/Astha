import { NextRequest, NextResponse } from 'next/server';
import { calculateCart, CouponData, UserContext } from '@/lib/cart-calculator';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { unstable_cache } from 'next/cache';

// Node runtime for Firebase support

const RATE_LIMIT_WINDOW = 2 * 60 * 60 * 1000;
const MAX_REQUESTS = 70;
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const data = rateLimitMap.get(ip);
    if (!data) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return true;
    }
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return true;
    }
    if (data.count >= MAX_REQUESTS) return false;
    data.count++;
    return true;
}

const getCachedProduct = unstable_cache(
    async (id: string) => {
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
    },
    ['product-pricing'],
    { revalidate: 86400, tags: ['product-pricing'] }
);

// 1. Hybrid Coupon Cache: Static data is cached for 1 hour
const getStaticCouponData = unstable_cache(
    async (code: string) => {
        const couponRef = doc(db, 'coupons', code.toUpperCase().trim());
        const snap = await getDoc(couponRef);
        if (snap.exists()) {
            return { ...snap.data(), code: snap.id } as CouponData;
        }
        return null;
    },
    ['coupon-static'],
    { revalidate: 3600, tags: ['coupon-static'] }
);

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Too many requests." }, { status: 429 });
        }

        const body = await req.json();
        const { items, couponCode, userEmail, userTags } = body;

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
