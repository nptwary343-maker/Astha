import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/types';
import { CartItem } from '@/context/CartContext';

// Simple in-memory cache to avoid re-fetching same product in session
const productCache = new Map<string, Product>();

export function useCartProducts(cartItems: CartItem[]) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCartProducts = async () => {
            if (cartItems.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const newProducts: Product[] = [];
            const fetchPromises: Promise<void>[] = [];

            for (const item of cartItems) {
                // Check cache first
                if (productCache.has(item.productId)) {
                    newProducts.push(productCache.get(item.productId)!);
                } else {
                    // Fetch if missing
                    const p = getDoc(doc(db, 'products', item.productId))
                        .then((snap) => {
                            if (snap.exists()) {
                                const data = snap.data();
                                const product = {
                                    id: snap.id,
                                    name: data.name,
                                    price: data.price,
                                    salePrice: data.salePrice,
                                    category: data.category,
                                    images: data.images,
                                    description: data.description,
                                    tags: data.tags,
                                    stock: data.stock,
                                    discount: data.discount
                                } as Product;
                                productCache.set(item.productId, product);
                                newProducts.push(product);
                            }
                        })
                        .catch((err) => console.error(`Error fetching product ${item.productId}`, err));

                    fetchPromises.push(p);
                }
            }

            await Promise.all(fetchPromises);

            // Sort by order in cart if needed, or keeping it loose
            // Ensuring we only return products that were successfully fetched
            const validProducts = cartItems
                .map(item => productCache.get(item.productId))
                .filter(Boolean) as Product[];

            setProducts(validProducts);
            setLoading(false);
        };

        fetchCartProducts();
    }, [cartItems]);

    return { products, loading };
}
