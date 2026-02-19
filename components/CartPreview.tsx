'use client';

import { useCart } from '@/context/CartContext';
import { useCartProducts } from '@/hooks/useCartProducts'; // New hook
import { Product } from '@/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';

export default function CartPreview({ onClose }: { onClose: () => void }) {
    const { items, removeFromCart, cartCount } = useCart();

    // Use the dedicated cart product fetcher instead of general cache
    // This ensures specific IDs in cart are fetched even if not in main list
    const { products, loading } = useCartProducts(items);
    const [cartItems, setCartItems] = useState<{ product: Product; qty: number }[]>([]);

    useEffect(() => {
        if (!loading && products.length > 0) {
            const mappedItems = items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return product ? { product, qty: item.qty } : null;
            }).filter(Boolean) as { product: Product; qty: number }[];
            setCartItems(mappedItems);
        } else if (!loading && products.length === 0) {
            setCartItems([]);
        }
    }, [products, items, loading]);

    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.product.salePrice || item.product.price;
        return acc + (price * item.qty);
    }, 0);

    return (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag size={18} /> My Cart ({cartCount})
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2 space-y-2">
                {cartItems.length > 0 ? (
                    cartItems.map(({ product, qty }) => (
                        <div key={product.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h4>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                                    <p className="text-sm font-bold text-orange-600">
                                        ৳{(product.salePrice || product.price) * qty}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFromCart(product.id)}
                                className="text-gray-300 hover:text-red-500 self-center p-1 transition-colors"
                                title="Remove Item"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Your cart is empty</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                <div className="flex justify-between items-center mb-4 text-sm font-bold text-gray-800">
                    <span>Subtotal:</span>
                    <span className="text-lg">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/cart"
                        onClick={onClose}
                        className="block w-full py-2.5 text-center text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        View Cart
                    </Link>
                    <Link
                        href="/checkout" // Assuming checkout route exists, otherwise /cart
                        onClick={onClose}
                        className="block w-full py-2.5 text-center text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 shadow-lg shadow-black/10 transition-all hover:scale-[1.02]"
                    >
                        Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}
