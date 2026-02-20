'use client';
export const runtime = 'edge';;

import ProductGrid from '@/components/ProductGrid';

export default function BestSellersPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-gray-900">Best Sellers</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Our most popular products loved by thousands of customers.
                    </p>
                </div>

                {/* Reusing ProductGrid for now - in production this would take a "sort" prop */}
                <ProductGrid />
            </div>
        </div>
    );
}
