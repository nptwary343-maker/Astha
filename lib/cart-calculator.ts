// lib/cart-calculator.ts

// 1. Internal Product Catalog (The Source of Truth)
// In a real app, this might come from a DB, but we keep it here to ensure
// no client-side price manipulation is possible.

// Fallback for demo purposes if ID not found (optional, or throw error)
const DEFAULT_PRODUCT = { name: "Unknown Product", price: 0, discountPercent: 0, taxPercent: 0 };

export interface CouponData {
    code: string;
    type: 'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING';
    value: number;
    maxDiscountAmount?: number;
    minOrderValue: number;
    isActive: boolean;
    expiryDate: string;
    usageLimit: number;
    usedCount: number;
    targeting: {
        userTags?: string[];
        allowedEmails?: string[];
        excludedEmails?: string[];
        targetSellers?: string[];
        targetCategories?: string[];
        minCartItems?: number;
    };
}

export interface UserContext {
    email?: string;
    tags?: string[];
}

interface CartItemInput {
    productId: string;
    qty: number;
    category?: string; // Should be part of trusted catalog data
}

export interface CartCalculationResult {
    items: {
        productId: string;
        name: string;
        unitPrice: number;
        qty: number;
        subtotal: number;
        discountAmount: number;
        taxAmount: number;
        total: number;
    }[];
    summary: {
        subtotal: number;
        totalDiscount: number;
        totalTax: number;
        finalTotal: number;
        couponDiscount?: number;
        couponCode?: string;
        couponError?: string;
    };
}

/**
 * ZERO TRUST CALCULATOR
 * Analyzes cart items against a trusted server catalog.
 * Ignores any price/name sent by client.
 */
export function calculateCart(
    items: CartItemInput[],
    catalog: Record<string, any>,
    coupon?: CouponData,
    user?: UserContext
): CartCalculationResult {

    // 1. Calculate Items & Subtotal
    const processedItems = items.map(item => {
        const product = catalog[item.productId] || {
            ...DEFAULT_PRODUCT,
            name: `Product ${item.productId} (Not Found)`,
            stock: 0,
            category: 'Unknown'
        };

        let requestedQty = Math.max(1, Math.floor(item.qty || 1));
        if (typeof product.stock === 'number') {
            requestedQty = Math.min(requestedQty, product.stock);
        }
        const safeQty = Math.min(requestedQty, 450);

        const grossPrice = product.price * safeQty;

        // Base Product Discount
        let itemDiscount = 0;

        // Priority 1: New Standard (PERCENT/FIXED)
        if (product.discountType && product.discountValue) {
            if (product.discountType === 'PERCENT') {
                itemDiscount = grossPrice * (product.discountValue / 100);
            } else if (product.discountType === 'FIXED') {
                itemDiscount = product.discountValue * safeQty;
            }
        }
        // Priority 2: Legacy Fallback
        else if (product.discountFlat && product.discountFlat > 0) {
            itemDiscount = product.discountFlat * safeQty;
        } else {
            itemDiscount = grossPrice * ((product.discountPercent || 0) / 100);
        }

        // Sanity Check: Discount cannot exceed price (Prevent negative money)
        itemDiscount = Math.min(itemDiscount, grossPrice);

        // Anti-Floating Point: Force 2 decimals at each step
        itemDiscount = Number(itemDiscount.toFixed(2));
        const priceAfterDiscount = Number((grossPrice - itemDiscount).toFixed(2));

        // Tax Calculation (on discounted price)
        const taxAmount = Number((priceAfterDiscount * ((product.taxPercent || 0) / 100)).toFixed(2));

        const total = Number((priceAfterDiscount + taxAmount).toFixed(2));

        return {
            productId: item.productId,
            name: product.name,
            category: product.category, // Used for coupon targeting
            unitPrice: product.price,
            qty: safeQty,
            stock: product.stock,
            subtotal: Number(grossPrice.toFixed(2)),
            discountAmount: Number(itemDiscount.toFixed(2)),
            taxAmount: Number(taxAmount.toFixed(2)),
            total: Number(total.toFixed(2))
        };
    });

    const summary = processedItems.reduce(
        (acc, item) => ({
            subtotal: Number((acc.subtotal + item.subtotal).toFixed(2)),
            totalDiscount: Number((acc.totalDiscount + item.discountAmount).toFixed(2)),
            totalTax: Number((acc.totalTax + item.taxAmount).toFixed(2)),
            finalTotal: Number((acc.finalTotal + item.total).toFixed(2))
        }),
        { subtotal: 0, totalDiscount: 0, totalTax: 0, finalTotal: 0 }
    );

    // 2. Coupon Layer
    let couponDiscount = 0;
    let couponError = '';

    if (coupon) {
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);

        // Validation Checks
        if (!coupon.isActive) {
            couponError = 'Coupon is inactive.';
        } else if (now > expiry) {
            couponError = 'Coupon has expired.';
        } else if (coupon.usedCount >= coupon.usageLimit) {
            couponError = 'Coupon usage limit reached.';
        } else if (summary.subtotal < coupon.minOrderValue) {
            couponError = `Minimum order of ৳${coupon.minOrderValue} required.`;
        } else if (coupon.targeting.minCartItems && processedItems.length < coupon.targeting.minCartItems) {
            couponError = `Minimum ${coupon.targeting.minCartItems} different items required.`;
        }
        // User Targeting
        else if (user?.email && coupon.targeting.excludedEmails?.includes(user.email)) {
            couponError = 'Your account is not eligible for this coupon.';
        } else if (coupon.targeting.allowedEmails && coupon.targeting.allowedEmails.length > 0 && (!user?.email || !coupon.targeting.allowedEmails.includes(user.email))) {
            couponError = 'Your email is not in the allowed list for this coupon.';
        } else if (coupon.targeting.userTags && coupon.targeting.userTags.length > 0) {
            const hasTag = coupon.targeting.userTags.some(tag => user?.tags?.includes(tag));
            if (!hasTag) couponError = 'You do not have the required user group for this coupon.';
        }

        // If no errors, calculate discount
        if (!couponError) {
            let eligibleSubtotal = 0;
            const targetCategories = coupon.targeting.targetCategories || [];

            if (targetCategories.length > 0) {
                // Apply ONLY to specific categories
                eligibleSubtotal = processedItems
                    .filter(item => targetCategories.includes(item.category || ''))
                    .reduce((sum, item) => sum + (item.subtotal - item.discountAmount), 0);
            } else {
                eligibleSubtotal = summary.subtotal - summary.totalDiscount;
            }

            if (eligibleSubtotal > 0) {
                if (coupon.type === 'PERCENTAGE') {
                    couponDiscount = eligibleSubtotal * (coupon.value / 100);
                    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
                        couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
                    }
                } else if (coupon.type === 'FLAT') {
                    couponDiscount = Math.min(coupon.value, eligibleSubtotal);
                } else if (coupon.type === 'FREE_SHIPPING') {
                    // Handled in total shipping logic elsewhere, but we can mark it
                    couponDiscount = 0; // Or specific shipping value if passed
                }
            } else {
                couponError = 'No eligible items in cart for this coupon.';
            }
        }
    }

    const finalTotal = Math.max(0, summary.finalTotal - couponDiscount);

    return {
        items: processedItems,
        summary: {
            subtotal: Number(summary.subtotal.toFixed(2)),
            totalDiscount: Number(summary.totalDiscount.toFixed(2)),
            totalTax: Number(summary.totalTax.toFixed(2)),
            couponDiscount: Number(couponDiscount.toFixed(2)),
            couponCode: coupon?.code,
            couponError: couponError || undefined,
            finalTotal: Number(finalTotal.toFixed(2))
        }
    };
}
