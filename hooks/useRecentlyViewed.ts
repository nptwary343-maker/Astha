'use client';

import { useState, useEffect } from 'react';

export interface ViewedProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    slug?: string;
    discountValue?: number;
    discountType?: string;
}

const STORAGE_KEY = 'astharhat_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
    const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setViewedProducts(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to parse recently viewed items', e);
        }
    }, []);

    const addProduct = (product: Omit<ViewedProduct, 'timestamp'>) => {
        try {
            const current = [...viewedProducts];
            // Remove if exists to push it to the front
            const filtered = current.filter(p => p.id !== product.id);
            const newList = [product, ...filtered].slice(0, MAX_ITEMS);

            setViewedProducts(newList);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
        } catch (e) {
            console.error('Failed to add recently viewed item', e);
        }
    };

    const clearRecentlyViewed = () => {
        setViewedProducts([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { viewedProducts, addProduct, clearRecentlyViewed };
}
