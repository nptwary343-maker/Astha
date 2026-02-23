'use server';

import { z } from 'zod';
import { db, collection, doc, runTransaction, increment, serverTimestamp } from '@/lib/firebase';
import { headers } from 'next/headers';
import { after } from 'next/server';
import { sendPixelEvent } from '@/lib/capi-bridge';

// ----------------------------------------------------------------------
// 1. Zod Schemas (Strict Input Validation)
// ----------------------------------------------------------------------

const OrderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
});

const CustomerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(11, "Valid phone is required"),
    address: z.string().min(5, "Address is required"),
});

const PaymentSchema = z.object({
    method: z.enum(['cod', 'bkash']),
    trxId: z.string().optional().nullable(),
});

const CheckoutPayload = z.object({
    items: z.array(OrderItemSchema).min(1, "Cart is empty"),
    customer: CustomerSchema,
    payment: PaymentSchema,
    couponCode: z.string().optional().nullable(),
    userEmail: z.string().optional().nullable(),
    userTags: z.array(z.string()).optional(),
    fcmToken: z.string().optional().nullable(),
});

type CheckoutResponse = { success: boolean; orderId?: string; error?: string };

// ----------------------------------------------------------------------
// 2. Server Action: The Single Source of Truth
// ----------------------------------------------------------------------

export async function placeOrderAction(rawPayload: unknown): Promise<CheckoutResponse> {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || 'unknown';
    const userAgent = headerList.get('user-agent') || 'unknown';

    try {
        // A. Validate Payload Structure
        const { items, customer, payment, couponCode, userEmail, userTags, fcmToken } = CheckoutPayload.parse(rawPayload);

        console.log(`🔒 START TRANSACTION: User=${userEmail || 'Guest'}, Items=${items.length}`);

        // B. Run Atomic Transaction (Zero Trust - Edge Compatible)
        const result = await runTransaction(db, async (transaction) => {

            // 1. Fetch High-Fidelity Data (Products & Coupon)
            const itemsWithData = await Promise.all(items.map(async (item) => {
                const productRef = doc(db, 'products', item.productId);
                const snap = await transaction.get(productRef);
                return { item, snap, productRef };
            }));

            let couponData: any = null;
            let couponRef: any = null;

            if (couponCode) {
                couponRef = doc(db, 'coupons', couponCode.toUpperCase().trim());
                const couponSnap = await transaction.get(couponRef);
                if (couponSnap.exists()) {
                    couponData = couponSnap.data();
                }
            }

            // 2. Calculation Engine (Strict Order: Gross -> Discount -> Tax)
            const calculatedItems: any[] = [];
            let subtotal = 0;
            let totalDiscount = 0;
            let totalTax = 0;

            for (let i = 0; i < itemsWithData.length; i++) {
                const { item, snap, productRef } = itemsWithData[i];

                if (!snap.exists()) {
                    throw new Error(`PRODUCT_NOT_FOUND: Product ID ${item.productId} is missing.`);
                }

                const data: any = snap.data();
                const stock = Number(data?.stock || 0);
                const price = Number(data?.price || 0); // Unit Price

                // Stock Check
                if (stock < item.quantity) {
                    throw new Error(`OUT_OF_STOCK: ${data?.name || 'Product'} is out of stock.`);
                }

                // --- MATH LOGIC STARTED ---

                // Step 1: Gross Price (Unit * Qty)
                const grossPrice = price * item.quantity;

                // Step 2: Item Level Discount
                let itemDiscount = 0;

                // Priority: Check 'discountType' & 'discountValue' first
                if (data?.discountType && data?.discountValue) {
                    const val = Number(data.discountValue);
                    if (data.discountType === 'PERCENT') {
                        itemDiscount = grossPrice * (val / 100);
                    } else if (data.discountType === 'FIXED') {
                        itemDiscount = val * item.quantity;
                    }
                }
                // Fallback: Legacy 'discount' object support
                else if (data?.discount) {
                    if (data.discount.type === 'percent') {
                        itemDiscount = grossPrice * (Number(data.discount.value) / 100);
                    } else if (data.discount.type === 'flat') {
                        itemDiscount = Number(data.discount.value) * item.quantity;
                    }
                }

                // Sanity Check: Discount cannot exceed Gross
                itemDiscount = Math.min(itemDiscount, grossPrice);

                // Step 3: Net Price
                const netPrice = grossPrice - itemDiscount;

                // Step 4: Tax Calculation (on Net Price)
                const taxRate = Number(data?.taxPercent || 0);
                const itemTax = netPrice * (taxRate / 100);

                // Step 5: Final Item Total
                const itemTotal = netPrice + itemTax;

                // --- MATH LOGIC ENDED ---

                subtotal += grossPrice;
                totalDiscount += itemDiscount;
                totalTax += itemTax;

                calculatedItems.push({
                    productId: item.productId,
                    name: data?.name || "Product",
                    quantity: item.quantity,
                    unitPrice: price,




                    subtotal: Number(grossPrice.toFixed(2)),
                    discount: Number(itemDiscount.toFixed(2)),
                    tax: Number(itemTax.toFixed(2)),
                    total: Number(itemTotal.toFixed(2))
                });

                // Deduct Stock immediately
                transaction.update(productRef, {
                    stock: increment(-item.quantity),
                    lastSoldAt: new Date().toISOString()
                });
            }

            // 3. Coupon Application (Global)
            let couponDiscount = 0;
            if (couponData) {
                // Basic Validation
                const now = new Date();
                const expiry = new Date(couponData.expiryDate);

                let isValid = true;
                if (!couponData.isActive) isValid = false;
                if (now > expiry) isValid = false;
                if (couponData.usageLimit > 0 && (couponData.usedCount || 0) >= couponData.usageLimit) isValid = false;
                if (subtotal < (couponData.minOrderValue || 0)) isValid = false;

                // User Validations
                if (userEmail && couponData.targeting?.excludedEmails?.includes(userEmail)) isValid = false;

                if (isValid) {
                    // Apply Coupon
                    const currentNetTotal = (subtotal - totalDiscount); // Net before tax

                    if (couponData.type === 'PERCENTAGE') {
                        couponDiscount = currentNetTotal * (couponData.value / 100);
                        if (couponData.maxDiscountAmount) {
                            couponDiscount = Math.min(couponDiscount, couponData.maxDiscountAmount);
                        }
                    } else if (couponData.type === 'FLAT') {
                        couponDiscount = Math.min(couponData.value, currentNetTotal);
                    }

                    // Increment Coupon Usage
                    transaction.update(couponRef!, {
                        usedCount: increment(1),
                        usedBy: [userEmail || 'Guest'] // Simplification for Standard SDK arrayUnion if needed, using standard proxy
                    });
                }
            }

            // 4. Final Aggregation
            const finalTotal = (subtotal - totalDiscount - couponDiscount) + totalTax;

            // 5. Create Order
            const orderId = `AH-${Date.now()}`;
            const orderRef = doc(db, 'orders', orderId);

            const newOrder = {
                orderId,
                customer,
                items: calculatedItems,
                totals: {
                    subtotal: Number(subtotal.toFixed(2)),
                    discount: Number(totalDiscount.toFixed(2)),
                    couponDiscount: Number(couponDiscount.toFixed(2)),
                    tax: Number(totalTax.toFixed(2)),
                    total: Number(finalTotal.toFixed(2)),
                    couponCode: couponDiscount > 0 ? couponCode : null
                },
                payment: {
                    ...payment,
                    status: 'Pending',
                    isVerified: false
                },
                status: 'New',
                orderStatus: 'Pending',
                createdAt: new Date().toISOString(),
                source: 'server_action_v2',
                fcmToken: fcmToken || null,
                userEmail: userEmail || null,
                security_meta: {
                    ip,
                    userAgent
                }
            };

            transaction.set(orderRef, newOrder);

            return { orderId, finalTotal, currency: 'BDT' };
        });

        // C. Offload Post-Transaction Tasks (Next.js 15 Background Execution)
        // This ensures the user gets a response immediately without waiting for slow APIs.
        after(async () => {
            console.log(`⏳ [BACKGROUND_TASK] Running post-checkout logic for ${result.orderId}`);

            await Promise.allSettled([
                // 1. Pixel Tracking
                sendPixelEvent('Purchase', {
                    phone: customer.phone,
                    ip,
                    userAgent,
                    userId: userEmail || undefined
                } as any, {
                    orderId: result.orderId,
                    value: result.finalTotal,
                    currency: 'BDT',
                    items: items
                }, `PUR-${result.orderId}`),

                // 2. Stock Revalidation (Global Cache Flush)
                (async () => {
                    try {
                        const { revalidatePath } = await import('next/cache');
                        revalidatePath('/', 'layout');
                    } catch (e) {
                        console.warn("Stock revalidation failed", e);
                    }
                })(),

                // 3. Email Confirmation
                (async () => {
                    if (userEmail) {
                        try {
                            const { sendOrderEmail } = await import('@/lib/mail-service');
                            await sendOrderEmail({
                                orderId: result.orderId,
                                customerName: customer.name,
                                totalPrice: result.finalTotal,
                                address: customer.address,
                                userEmail: userEmail,
                                status: 'Processing',
                                securityKey: result.orderId
                            });
                        } catch (e) {
                            console.error("📧 Email Confirmation Error:", e);
                        }
                    }
                })()
            ]);

            console.log(`✅ [BACKGROUND_TASK] Completed post-checkout logic for ${result.orderId}`);
        });

        return { success: true, orderId: result.orderId };

    } catch (error: any) {
        console.error("❌ ORDER FAILED:", error.code || error.message);

        // 🛡️ EMERGENCY FAILOVER: If Firebase quota is hit, don't lose the order!
        if (error.code === 'resource-exhausted' || error.message?.includes('quota')) {
            console.error("🚨 [QUOTA_EXCEEDED_FAILOVER] Redirecting order to Resilience Manager...");

            try {
                const { safeStoreOrder } = await import('@/lib/resilience-manager');
                const recoveryResult = await safeStoreOrder(rawPayload);

                if (recoveryResult.success) {
                    return {
                        success: true,
                        orderId: recoveryResult.id,
                        error: "System under high load. Order saved to backup. Our team will contact you soon."
                    };
                }
            } catch (recoveryErr) {
                console.error("Critical Failover Failure:", recoveryErr);
            }

            return {
                success: false,
                error: "System is under high load (Quota Reached). Please contact us on WhatsApp to confirm your order."
            };
        }

        return { success: false, error: error.message || "Checkout failed." };
    }
}
