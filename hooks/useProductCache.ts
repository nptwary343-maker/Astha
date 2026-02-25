
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { Product } from '@/types';

const CACHE_KEY = 'asthar_hat_products_v2';
const CACHE_DURATION = 10 * 60 * 1000; // 10 Minutes

export const useProductCache = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // 1. Initial Load from Cache (Instant UI)
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            try {
                const { timestamp, data } = JSON.parse(cachedData);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setProducts(data);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // 2. Spark-Safe Real-time Sync (onSnapshot)
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];

            setProducts(items);
            setLoading(false);

            // 3. Update Cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: items
            }));
        }, (error) => {
            console.error("Firestore real-time error:", error);
            setLoading(false);
        });

        unsubscribeRef.current = unsubscribe;

        // 4. Staged Detach (Spark Plan Optimization)
        // We listen for 5 seconds to catch initial batch + any immediate updates, then detach to save on connections
        const timer = setTimeout(() => {
            if (unsubscribeRef.current) {
                console.log("⚡ Spark Detach: Closing real-time connection to save resources.");
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        }, 5000);

        return () => {
            clearTimeout(timer);
            if (unsubscribeRef.current) unsubscribeRef.current();
        };
    }, []);

    return { products, loading };
};
