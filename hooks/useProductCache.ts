import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Product } from '@/types';

const CACHE_KEY = 'aez_products_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minutes


export const useProductCache = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            // 1. Check Local Storage
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { timestamp, data } = JSON.parse(cachedData);
                const age = Date.now() - timestamp;

                if (age < CACHE_DURATION) {
                    console.log(`⚡ Using Cached Products (${data.length} items)`);
                    setProducts(data);
                    setLoading(false);
                    return;
                }
            }

            // 2. Fetch from Firebase if cache missing or stale
            console.log("🔥 Fetching Products from Firestore...");
            try {
                // OPTIMIZATION: Limit increased to 50 to meet easy "10-15 product" visibility requirements
                // REMOVING orderBy('createdAt') TEMPORARILY because existing products might lack this field
                const q = query(collection(db, 'products'), limit(60));
                const snapshot = await getDocs(q);

                const items = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        price: data.price,
                        salePrice: data.salePrice,
                        category: data.category,
                        images: data.images,
                        description: data.description,
                        tags: data.tags,
                        stock: data.stock,
                        discount: data.discount
                    };
                }) as Product[];

                setProducts(items);

                // 3. Save to Cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: items
                }));

            } catch (error) {
                console.error("Error fetching products:", error);
                // Fallback to cache even if stale on error
                if (cachedData) {
                    setProducts(JSON.parse(cachedData).data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return { products, loading };
};
