// lib/cart-calculator.ts

// 1. Internal Product Catalog (The Source of Truth)
// In a real app, this might come from a DB, but we keep it here to ensure
// no client-side price manipulation is possible.

import { calculateFinalPrice } from '@/utils/price-calculator';
import { Product } from '@/types';

// Fallback for demo purposes if ID not found (optional, or throw error)
const DEFAULT_PRODUCT = { name: "Unknown Product", price: 0, discountPercent: 0, taxPercent: 0 };



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

        // Use the Centralized Domain Logic to get final unit price
        const finalUnitPrice = calculateFinalPrice(product as unknown as Partial<Product> & { price: number });

        // Calculate total discount for this item based on quantity
        const totalFinalPrice = finalUnitPrice * safeQty;
        let itemDiscount = grossPrice - totalFinalPrice;

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

    return {
        items: processedItems,
        summary: {
            subtotal: Number(summary.subtotal.toFixed(2)),
            totalDiscount: Number(summary.totalDiscount.toFixed(2)),
            totalTax: Number(summary.totalTax.toFixed(2)),
            finalTotal: Number(summary.finalTotal.toFixed(2))
        }
    };
}
