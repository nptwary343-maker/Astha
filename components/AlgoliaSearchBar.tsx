'use client';

import React from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Configure, Highlight } from 'react-instantsearch';
import { Search } from 'lucide-react';

// Initialize Algolia Client - Robust Implementation
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

// Strict check: Must be string, min length, and not a placeholder pattern
const isValid = (val: string | undefined): val is string =>
    typeof val === 'string' &&
    val.length > 5 &&
    !/placeholder|TODO|your_|YOUR_|_HERE/i.test(val);

const searchClient = (isValid(appId) && isValid(apiKey))
    ? algoliasearch(appId, apiKey)
    : {
        search: (_requests: any) => Promise.resolve({
            results: Array.isArray(_requests) ? _requests.map(() => ({
                hits: [],
                nbHits: 0,
                nbPages: 0,
                page: 0,
                processingTimeMS: 0,
                hitsPerPage: 0,
                exhaustiveNbHits: false,
                query: '',
                params: '',
            })) : []
        }),
        searchForFacetValues: () => Promise.resolve([{ facetHits: [], exhaustiveFacetsCount: true, processingTimeMS: 0 }])
    } as any;

// Hit Component to display each result
const Hit = ({ hit }: { hit: any }) => {
    return (
        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-gray-100 mb-2">
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {hit.imageUrl ? (
                    <img src={hit.imageUrl} alt={hit.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Search size={16} />
                    </div>
                )}
            </div>
            <div>
                <h4 className="font-bold text-gray-900 text-sm">
                    <Highlight attribute="name" hit={hit} classNames={{ highlighted: 'bg-yellow-200 text-gray-900 px-0.5 rounded' }} />
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{hit.category}</span>
                    <span>৳ {hit.price}</span>
                </div>
            </div>
        </div>
    );
};

export default function AlgoliaSearchBar() {
    return (
        <div className="w-full max-w-md mx-auto">
            {/* Helper message for setup */}
            {(!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) && (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-200">
                    ⚠️ Algolia keys missing in .env.local
                </div>
            )}

            <InstantSearch searchClient={searchClient} indexName="asthar_products" future={{ preserveSharedStateOnUnmount: true }}>
                <Configure hitsPerPage={5} />

                <div className="relative">
                    <SearchBox
                        classNames={{
                            root: 'relative',
                            form: 'relative',
                            input: 'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm',
                            submit: 'absolute left-3 top-1/2 -translate-y-1/2 p-0 border-none bg-transparent',
                            reset: 'hidden',
                            loadingIndicator: 'hidden'
                        }}
                        placeholder="Search for products..."
                        submitIconComponent={() => <Search className="text-gray-400" size={18} />}
                    />

                    {/* Results Wrapper */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto empty:hidden">
                        <Hits hitComponent={Hit} classNames={{ list: 'p-2' }} />
                    </div>
                </div>
            </InstantSearch>
        </div>
    );
}
