'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, Image as ImageIcon, Zap, AlertTriangle, ShieldCheck, WifiOff, Coffee } from 'lucide-react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import Link from 'next/link';
import Image from 'next/image';
import debounce from 'lodash/debounce';

/**
 * 🛡️ SENIOR SYSTEM ARCHITECT: 100% Algolia Optimized Search
 * Logic:
 * 1. ZERO Firebase Hits (No Storage/Firestore Queries).
 * 2. Precision Syncing: Call API on even lengths (2, 4, 6), local filter on odd (3, 5).
 * 3. 500ms Stop-Sync: Final API call when typing stops.
 * 4. Personalization: Boosts last 10 clicked products from LocalStorage.
 * 5. Resiliency: Offline detection and meaningful error states.
 * 6. Guard: Strict 400ms API request throttling.
 */

const HISTORY_KEY = 'asthar_search_history';
const MAX_HISTORY = 10;
const GUARD_MS = 400;

// --- Algolia Setup (Search-Only) ---
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';
const algoliaClient = (appId && apiKey && !appId.includes('YOUR_')) ? algoliasearch(appId, apiKey) : null;

const SmartSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'online' | 'offline' | 'error'>('online');

    // Architect Refs
    const lastApiCallTime = useRef<number>(0);
    const lastSuccessfulResults = useRef<any[]>([]);
    const searchHistory = useRef<string[]>([]);

    // --- 1. Load Personalization History ---
    useEffect(() => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            try {
                searchHistory.current = JSON.parse(stored);
            } catch (e) {
                searchHistory.current = [];
            }
        }

        // Offline Global Listener
        const handleOffline = () => setStatus('offline');
        const handleOnline = () => setStatus('online');
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    const saveToHistory = (productId: string) => {
        let newHistory = [productId, ...searchHistory.current.filter(id => id !== productId)];
        newHistory = newHistory.slice(0, MAX_HISTORY);
        searchHistory.current = newHistory;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };

    // --- 2. Algolia Fetcher with Request Guard ---
    const fetchAlgolia = async (searchTerm: string) => {
        if (!algoliaClient || !searchTerm.trim()) return;

        const now = Date.now();
        if (now - lastApiCallTime.current < GUARD_MS) {
            console.log("🛡️ Request Guard: Throttling API Call");
            return;
        }

        lastApiCallTime.current = now;
        setIsLoading(true);

        try {
            // Retrieve Persona for Intelligent Filtering
            const persona = typeof window !== 'undefined' ? localStorage.getItem('fashion_persona') : null;
            const optionalFilters: string[] = [];

            if (persona === 'modern') {
                optionalFilters.push('tags:modern<score=3>', 'tags:trendy<score=2>');
            } else if (persona === 'heritage') {
                optionalFilters.push('tags:handloom<score=3>', 'tags:heritage<score=2>', 'tags:ethnic<score=2>');
            }

            const { results: algoliaResults } = await algoliaClient.search({
                requests: [{
                    indexName: 'asthar_products',
                    query: searchTerm,
                    hitsPerPage: 8,
                    optionalFilters: optionalFilters.length > 0 ? optionalFilters : undefined
                }]
            });

            let hits = algoliaResults[0] ? (algoliaResults[0] as any).hits : [];

            // Personalization: At length 2, boost history items
            if (searchTerm.length === 2 && searchHistory.current.length > 0) {
                const historyIds = new Set(searchHistory.current);
                const boosted = hits.filter((h: any) => historyIds.has(h.objectID || h.id));
                const others = hits.filter((h: any) => !historyIds.has(h.objectID || h.id));
                hits = [...boosted, ...others];
            }

            setResults(hits);
            lastSuccessfulResults.current = hits;
            setStatus('online');
        } catch (error: any) {
            console.error("❌ Algolia API Error:", error.message);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- 3. Local Filter Logic (For Odd Lengths) ---
    const runLocalFilter = (searchTerm: string) => {
        const filtered = lastSuccessfulResults.current.filter(p =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setResults(filtered);
    };

    // --- 4. Debounced Stop-Sync (Final Catch-up) ---
    const debouncedSync = useCallback(
        debounce((q: string) => {
            if (q.length >= 2) {
                fetchAlgolia(q);
            }
        }, 500),
        []
    );

    // --- 5. Main Search Orchestrator ---
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        // Logic: Call on even (2, 4, 6), Local on odd (3, 5)
        if (query.length % 2 === 0) {
            fetchAlgolia(query);
        } else {
            runLocalFilter(query);
        }

        // Always trigger a sync call after user stops typing
        debouncedSync(query);

        return () => debouncedSync.cancel();
    }, [query]);

    return (
        <div className="relative w-full max-w-xl mx-auto z-50">
            <div className="relative flex items-center group">
                <Search className={`absolute left-4 ${status === 'online' ? 'text-blue-500' : 'text-orange-500'}`} size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder="Search for premium products..."
                    className="w-full bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 focus:border-blue-500 rounded-2xl py-3 pl-12 pr-12 text-sm font-bold outline-none shadow-sm transition-all"
                />
                <div className="absolute right-4 flex items-center gap-2">
                    {isLoading && <Loader2 size={18} className="animate-spin text-blue-500" />}
                    {query && !isLoading && <X size={18} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setQuery('')} />}
                </div>
            </div>

            {/* Resiliency Toast */}
            {status !== 'online' && (
                <div className={`mt-2 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${status === 'offline' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                    {status === 'offline' ? <><WifiOff size={12} /> Offline: Showing cached results</> : <><Coffee size={12} /> Search is taking a nap (API Error)</>}
                </div>
            )}

            {/* Results UI */}
            {isOpen && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {results.length > 0 ? (
                        <div className="py-2">
                            <h3 className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-zinc-800 mb-1 flex justify-between items-center">
                                <span>Found Results</span>
                                {isLoading && <span className="text-blue-500 normal-case font-bold animate-pulse">Syncing...</span>}
                            </h3>
                            <ul className="max-h-[450px] overflow-y-auto">
                                {results.map((product) => (
                                    <li key={product.objectID || product.id}>
                                        <Link
                                            href={`/product/${product.objectID || product.id}`}
                                            onClick={() => {
                                                setIsOpen(false);
                                                saveToHistory(product.objectID || product.id);
                                            }}
                                            className="flex items-center gap-4 px-5 py-3 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors group"
                                        >
                                            <div className="relative w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 shrink-0 overflow-hidden">
                                                <Image
                                                    src={product.imageUrl || product.images?.[0] || 'https://placehold.co/100'}
                                                    alt={product.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    sizes="48px"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-gray-900 dark:text-gray-100 text-sm truncate group-hover:text-blue-600">
                                                    {product.name}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-bold uppercase">{product.category}</p>
                                            </div>
                                            <span className="font-black text-blue-600 text-sm">৳{product.price}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : !isLoading && (
                        <div className="p-12 text-center">
                            <Zap size={32} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-sm font-bold text-gray-500">No results found in premium index</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SmartSearch;
