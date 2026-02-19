'use client';

import AlgoliaSearchBar from '@/components/AlgoliaSearchBar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SearchTestPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} /> Back to Products
                </Link>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-gray-900">Search Verification</h1>
                    <p className="text-gray-500">Test the real-time Algolia integration here.</p>
                </div>

                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 min-h-[400px]">
                    <AlgoliaSearchBar />

                    <div className="mt-12 text-center">
                        <p className="text-xs text-gray-400">
                            If results don't appear:<br />
                            1. Check if products exist in Algolia Index 'asthar_products'<br />
                            2. Verify NEXT_PUBLIC_ALGOLIA_APP_ID in .env.local<br />
                            3. Ensure SEARCH_KEY (not Write Key) is set.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
