'use client';

import ProductGrid from '@/components/ProductGrid';

export default function WeeklyHotPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold">Trending Now</span>
                    <h1 className="text-4xl font-black text-gray-900">Weekly Hot Picks</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        The hottest items flying off the shelves this week!
                    </p>
                </div>

                <ProductGrid />
            </div>
        </div>
    );
}
