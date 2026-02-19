'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * 🛒 FIREBASE CART STRATEGY:
 * 1. Guests: Items are stored only in LocalStorage.
 * 2. Logged-in Users: Items are synced in real-time with Firestore (collection: 'carts', docId: uid).
 * 3. Migration: When a user logs in, any existing Guest Items are merged into their Cloud Cart.
 */

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

const STORAGE_KEY = 'aez_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const isUpdatingFromRemote = useRef(false);

    // 1. Initial Load (Guest Mode)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load local cart", error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // 2. Firebase Sync & Listener (User Mode)
    useEffect(() => {
        if (!user || !isInitialized) return;

        const cartRef = doc(db, 'carts', user.uid);

        // 🛡️ MIGRATION: Combine guest cart with cloud cart
        const migrateCart = async () => {
            try {
                const { getDoc } = await import('firebase/firestore');
                const snap = await getDoc(cartRef);
                const localItems: CartItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

                let cloudItems: CartItem[] = [];
                if (snap.exists()) {
                    cloudItems = snap.data().items || [];
                }

                // Merge
                const merged = [...cloudItems];
                localItems.forEach(li => {
                    const ex = merged.find(ci => ci.productId === li.productId);
                    if (ex) ex.qty += li.qty;
                    else merged.push(li);
                });

                if (merged.length > 0) {
                    await setDoc(cartRef, { items: merged, updatedAt: new Date().toISOString() }, { merge: true });
                }
            } catch (e) { console.error("Migration failed", e); }
        };

        migrateCart();

        // Listener
        const unsubscribe = onSnapshot(cartRef, (docSnap) => {
            if (docSnap.exists()) {
                const cloudData = docSnap.data().items || [];
                isUpdatingFromRemote.current = true;
                setItems(cloudData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
                setTimeout(() => { isUpdatingFromRemote.current = false; }, 100);
            }
        });

        return () => unsubscribe();
    }, [user, isInitialized]);

    // 3. Sync to Cloud
    const syncCart = async (newItems: CartItem[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        if (user && !isUpdatingFromRemote.current) {
            try {
                const cartRef = doc(db, 'carts', user.uid);
                await setDoc(cartRef, { items: newItems, updatedAt: new Date().toISOString() }, { merge: true });
            } catch (e) { console.error("Firestore sync failed", e); }
        }
    };

    // 4. Cart Handlers
    const addToCart = (productId: string, qty: number = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.productId === productId);
            const updated = existing
                ? prev.map(item => item.productId === productId ? { ...item, qty: item.qty + qty } : item)
                : [...prev, { productId, qty }];
            syncCart(updated);
            return updated;
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => {
            const updated = prev.filter(item => item.productId !== productId);
            syncCart(updated);
            return updated;
        });
    };

    const updateQty = (productId: string, delta: number) => {
        setItems(prev => {
            const updated = prev.map(item => item.productId === productId ? { ...item, qty: Math.max(1, item.qty + delta) } : item);
            syncCart(updated);
            return updated;
        });
    };

    const clearCart = () => {
        setItems([]);
        syncCart([]);
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
