'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sendSystemPing } from '@/actions/system';

/**
 * 🛒 COOKIE CART STRATEGY (GOOD FORMATION):
 * Items are stored in Cookies for cross-request stability and server-side visibility.
 * No server-side synchronization for maximum simplicity.
 */

// Simple Cookie Helpers
const setCookie = (name: string, value: string, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

// Define the shape of a cart item
export interface CartItem {
    productId: string;
    qty: number;
}

// Define the shape of the context
interface CartContextType {
    items: CartItem[];
    addToCart: (productId: string, qty?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQty: (productId: string, delta: number) => void;
    clearCart: () => void;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'aez_cart_v2'; // Bumped version for cookies

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial Load from Cookies
    useEffect(() => {
        try {
            const stored = getCookie(STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load cart from cookies", error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Sync state to Cookies
    useEffect(() => {
        if (isInitialized) {
            setCookie(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isInitialized]);

    // Cart Handlers
    const addToCart = (productId: string, qty: number = 1) => {
        // 📡 ADD_TO_CART PING (Zero Trust Activity Tracker)
        sendSystemPing('PRODUCT_ADD_TO_CART', { productId, qty });

        setItems(prev => {
            const existing = prev.find(item => item.productId === productId);
            if (existing) {
                return prev.map(item => item.productId === productId ? { ...item, qty: item.qty + qty } : item);
            }
            return [...prev, { productId, qty }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQty = (productId: string, delta: number) => {
        setItems(prev => prev.map(item => item.productId === productId ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
