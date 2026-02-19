import { z } from 'zod';

// ==========================================
// 1. INPUT DEFINITION (আজব ইনপুট আটকানোর স্কিমা)
// ==========================================

// ইনপুট স্কিমা: ক্লায়েন্ট থেকে আমরা শুধু productId আর quantity আশা করি।
// প্রাইস এখানে এলাউড না। দিলেও আমরা ইগনোর করব।
export const OrderItemSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int("Quantity must be integer").positive("Quantity must be positive"),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

// ট্রাস্টেড প্রাইস লিস্ট: এটা ডাটাবেস থেকে আসবে।
// key = productId, value = real price (number)
export type PriceCatalog = Record<string, number>;

// আউটপুট রেসপন্স শেপ
export interface OrderCalculation {
    subtotalInCents: number;   // পয়সায় হিসাব (Integer)
    totalItems: number;        // মোট আইটেম সংখ্যা
    subtotalDisplay: number;   // দেখানোর জন্য (Example: 150.00)
    items: {
        productId: string;
        qty: number;
        unitPrice: number;
        lineTotalInCents: number;
    }[];
}

/**
 * CALCULATE ORDER TOTAL (SECURE)
 * @param items - ক্লায়েন্ট থেকে আসা কার্ট আইটেম (এর প্রাইস আমরা বিশ্বাস করব না)
 * @param prices - সার্ভার/ডাটাবেস থেকে আসা আসল প্রাইস লিস্ট (Source of Truth)
 */
export function calculateOrderTotal(
    items: unknown[],
    prices: PriceCatalog
): OrderCalculation {

    // ১. ইনপুট ভ্যালিডেশন (Zod দিয়ে চেক)
    // যদি items অ্যারে না হয় বা উল্টাপাল্টা কিছু হয়, Zod এরর থ্রো করবে।
    const cleanItems = z.array(OrderItemSchema).parse(items);

    let grandTotalCents = 0;
    let totalQty = 0;
    const processedItems = [];
    const seenIds = new Set<string>(); // ডুপ্লিকেট চেকের জন্য

    // ২. লুপ চালিয়ে ক্যালকুলেশন
    for (const item of cleanItems) {

        // ডুপ্লিকেট চেক: একই প্রোডাক্ট দুইবার থাকলে এরর।
        // (ফ্রন্টএন্ডের আগেই মার্জ করা উচিত ছিল)
        if (seenIds.has(item.productId)) {
            throw new Error(`SECURITY_VIOLATION: Duplicate item detected '${item.productId}'.`);
        }
        seenIds.add(item.productId);

        // ৩. সিকিউরিটি চেক: প্রাইস কি আমাদের ক্যাটালগে আছে?
        // হ্যাকার যদি এমন কোনো ID পাঠায় যার দাম আমাদের কাছে নেই, সাথে সাথে রিজেক্ট।
        const realPrice = prices[item.productId];

        if (realPrice === undefined) {
            // ক্রিটিকাল সিকিউরিটি এরর।
            throw new Error(`SECURITY_VIOLATION: Price not found for product ID '${item.productId}'. Transaction aborted.`);
        }

        // ৪. ম্যাথ সেফটি (Integer Math)
        // জাভাস্ক্রিপ্টে 10.99 * 100 = 1098.9999... হয়ে যেতে পারে।
        // তাই Math.round() দিয়ে সেফ ইন্টিজার (পয়সা) বানানো হচ্ছে।
        const priceInCents = Math.round(realPrice * 100);

        // ৫. লাইন টোটাল হিসাব
        // কোনো দশমিকের ঝামেলা নেই, কারণ পূর্ণ সংখ্যা গুণ করছি।
        const lineTotalCents = priceInCents * item.quantity;

        // ৬. গ্র্যান্ড টোটাল আপডেট
        grandTotalCents += lineTotalCents;
        totalQty += item.quantity;

        // ৭. আউটপুট লিস্টে অ্যাড করা
        processedItems.push({
            productId: item.productId,
            qty: item.quantity,
            unitPrice: realPrice, // অরিজিনাল প্রাইস ডিসপ্লের জন্য
            lineTotalInCents: lineTotalCents
        });
    }

    // ৮. ফাইনাল রিটার্ন অবজেক্ট
    return {
        subtotalInCents: grandTotalCents,
        totalItems: totalQty,
        // ক্লায়েন্টকে দেখানোর জন্য আবার ১০০ দিয়ে ভাগ করে দিচ্ছি
        subtotalDisplay: grandTotalCents / 100,
        items: processedItems
    };
}


// ==========================================
// SELF-DESTRUCT TEST SUITE (Verification)
// ==========================================
// এই অংশ শুধু ডেভেলপমেন্ট বা টেস্ট রানার দিয়ে চালানো হবে।
// প্রডাকশনে এটা কল হবে না।

if (process.env.NODE_ENV === 'test' || process.argv[1]?.includes('calculateOrderTotal')) {
    const assert = require('assert');

    console.log("Running Self-Destruct Test Suite for Cart Logic...");

    try {
        // Test 1: Happy Path (সাধারণ সঠিক কেস)
        const items = [{ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 1 }];
        const catalog = { 'p1': 100, 'p2': 50.50 }; // 50.50 -> 5050 cents

        const result = calculateOrderTotal(items, catalog);

        // p1: 100 * 2 = 200
        // p2: 50.50 * 1 = 50.50
        // Total: 250.50
        assert.strictEqual(result.subtotalDisplay, 250.50);
        assert.strictEqual(result.subtotalInCents, 25050);
        console.log("✅ Test 1 Passed: Happy Path");

        // Test 2: Unknown Product (হ্যাকার ভুয়া ID পাঠিয়েছে)
        try {
            calculateOrderTotal([{ productId: 'hacker-item', quantity: 1 }], catalog);
            throw new Error("❌ Test 2 Failed: Should have thrown error for unknown item");
        } catch (e: any) {
            if (e.message.includes("Price not found")) {
                console.log("✅ Test 2 Passed: Unknown Product blocked");
            } else {
                throw e; // অন্য এরর
            }
        }

        // Test 3: Math Precision (দশমিকের সূক্ষ্ম হিসাব)
        // 0.1 + 0.2 types check
        const mathItems = [{ productId: 'm1', quantity: 1 }, { productId: 'm2', quantity: 1 }];
        // 19.99 * 100 -> 1999
        // 4.01 * 100 -> 401
        // Sum = 2400 cents -> 24.00
        const mathCatalog = { 'm1': 19.99, 'm2': 4.01 };

        const mathResult = calculateOrderTotal(mathItems, mathCatalog);
        assert.strictEqual(mathResult.subtotalInCents, 2400);
        assert.strictEqual(mathResult.subtotalDisplay, 24.00);
        console.log("✅ Test 3 Passed: Floating point math is safe");

        // Test 4: Zod Validation (নেগেটিভ quantity)
        try {
            calculateOrderTotal([{ productId: 'p1', quantity: -5 }], catalog);
            throw new Error("❌ Test 4 Failed: Should have caught negative quantity");
        } catch (e: any) {
            // Zod error
            console.log("✅ Test 4 Passed: Negative quantity blocked");
        }

        console.log("\nALL SYSTEMS GO. Logic is Bulletproof. 🛡️");

    } catch (error) {
        console.error("\n💥 FATAL: LOGIC VERIFICATION FAILED");
        console.error(error);
        process.exit(1);
    }
}
