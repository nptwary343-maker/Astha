'use client';

import { Search, X, Loader2, ChevronRight, Image as ImageIcon, Mic } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// -------------------------------------------------------------
// 🧠 ZERO-COST SEARCH ENGINE (Replaces Algolia)
// Uses /api/search endpoint with Fuse.js + Vercel Cache
// -------------------------------------------------------------

export default function SearchWithSuggestions() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Debounce Timer
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // 🔍 Search Logic (Debounced API Call)
    const handleSearch = (value: string) => {
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                } else {
                    setResults([]);
                }
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 400); // 400ms debounce
    };

    // 🎤 Voice Search Handler
    const startListening = () => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'bn-BD'; // Bangla Support
            recognition.continuous = false;
            recognition.interimResults = false;

            setIsListening(true);
            recognition.start();

            recognition.onresult = (event: any) => {
                const spokenText = event.results[0][0].transcript;
                const cleanText = spokenText.replace(/[.,!?;:]$/, '');
                handleSearch(cleanText);
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech error", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert("Microphone access denied.");
                }
            };

            recognition.onend = () => setIsListening(false);
        } else {
            alert("This browser doesn't support voice search. Try Chrome.");
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto">
            <div className="relative group/search">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-orange-500 transition-colors pointer-events-none">
                    <Search size={20} />
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => {
                        if (query.length > 0) setIsOpen(true);
                    }}
                    placeholder={isListening ? "Listening..." : "Search for Saree, Panjabi..."}
                    className={`w-full bg-gray-50 border border-gray-200 pl-12 pr-24 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all placeholder:text-gray-400 font-medium z-20 relative shadow-sm hover:border-gray-300 ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="animate-spin text-orange-500 mr-1">
                            <Loader2 size={16} />
                        </div>
                    )}

                    <button
                        onClick={startListening}
                        className={`p-2 rounded-full transition-all active:scale-90 ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400 hover:text-orange-500'}`}
                        title="Voice Search"
                    >
                        <Mic size={20} />
                    </button>

                    {query.length > 0 && (
                        <button
                            onClick={clearSearch}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (query.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {!isLoading && results.length > 0 ? (
                        <div className="py-2">
                            <h3 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Results</h3>
                            <ul>
                                {results.map((product) => (
                                    <li key={product.id}>
                                        <Link
                                            href={`/product/${product.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50 transition-colors group"
                                        >
                                            <div className="relative w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                {product.image ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                        <ImageIcon size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-blue-600 text-sm">৳{product.price}</span>
                                                <span className="text-[10px] text-gray-400">In Stock</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5">
                                <Link href={`/shop?search=${query}`} className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                                    View all results for "{query}" <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ) : !isLoading && (
                        <div className="p-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <p>No products found for "{query}"</p>
                                <p className="text-xs mt-1">Try checking your spelling.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
