export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getSearchIndex } from '@/lib/db-utils';
import Fuse from 'fuse.js';

export const runtime = 'edge';

// 🚀 EDGE_COMPATIBLE: Vercel can cache this
// This endpoint returns search suggestions quickly using Fuse.js on the server-side cache.
// It completely replaces Algolia, saving $0.00 since it uses existing memory.

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        console.log(`🔎 SEARCH: "${query}"`);

        // 1. Get Cached Index (Zero Cost)
        const products = await getSearchIndex();

        // 2. Fuzzy Search Logic
        const fuse = new Fuse(products, {
            keys: ['name', 'category'],
            threshold: 0.3, // Match sensitivity
            distance: 100, // Search distance within string
            minMatchCharLength: 2,
            shouldSort: true,
            includeScore: true
        });

        const results = fuse.search(query);

        // 3. Transform to Lightweight Response
        const suggestions = results.slice(0, 10).map(({ item }) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            image: item.image, // Single image for preview
            score: (item as any).score // Optional debug
        }));

        return NextResponse.json(suggestions);

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
