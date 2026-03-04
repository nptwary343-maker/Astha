import { Product } from '@/types';

/**
 * 🧮 DOMAIN INVARIANT: calculateFinalPrice
 * Calculates the final price of a product, ensuring the price never goes negative.
 * Centralized logic protects the system from "Negative Price" bugs across all UI components.
 */
export function calculateFinalPrice(product: Partial<Product> & { price: number }): number {
    let finalPrice = product.price;

    // 1. Priority: Check 'discountType' & 'discountValue' first
    if (product.discountType && product.discountValue && product.discountValue > 0) {
        if (product.discountType === 'PERCENT') {
            finalPrice = product.price - (product.price * (product.discountValue / 100));
        } else if (product.discountType === 'FIXED') {
            finalPrice = product.price - product.discountValue;
        }
    }
    // 2. Fallback: Legacy 'discount' object support
    else if (product.discount && product.discount.value > 0) {
        if (product.discount.type === 'percent') {
            finalPrice = product.price - (product.price * (product.discount.value / 100));
        } else { // assumed 'flat' or 'fixed'
            finalPrice = product.price - product.discount.value;
        }
    }

    // 🛑 DOMAIN INVARIANT: Price cannot be negative
    return Math.max(0, finalPrice);
}

/**
 * 🧮 Helper to check if a product has an active discount
 */
export function hasActiveDiscount(product: Partial<Product>): boolean {
    return (
        (!!product.discountValue && product.discountValue > 0) ||
        (!!product.discount && !!product.discount.value && product.discount.value > 0)
    );
}
