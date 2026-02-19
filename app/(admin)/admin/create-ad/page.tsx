
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Target, Megaphone, Loader2, Link as LinkIcon, MapPin, Facebook, Globe, CheckCircle, Zap, Eye, TrendingUp, Cpu } from 'lucide-react';

// Dynamic import for Map Component (SSR false is critical for Leaflet)
const OSMMapPicker = dynamic(() => import('@/components/admin/OSMMapPicker'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
});

// Mock Data for Facebook Posts (Replace with real API later)
const MOCK_FACEBOOK_POSTS = [
    { id: '123456789_101', message: 'Big Sale! 50% Off on all Gadgets this weekend.', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', likes: 24, comments: 5, date: '2h ago' },
    { id: '123456789_102', message: 'New Arrival: Wireless Headphones Pro Max.', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', likes: 156, comments: 32, date: '1d ago' },
    { id: '123456789_103', message: 'Limited Stock Alert! Order now before it runs out.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', likes: 89, comments: 12, date: '2d ago' }
];

export default function CreateAdPage() {
    // Goals: 'engagement' = Viral (Comments/Reacts), 'views' = Awareness (Max Views)
    const [goal, setGoal] = useState<'engagement' | 'views'>('engagement');

    // Existing Post State
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Common State
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(1000); // Default 1KM
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const router = useRouter();

    const [optimizationTips, setOptimizationTips] = useState<string | null>(null);

    const handleLaunchAd = async () => {
        if (!location) {
            alert("Please select a location on the map.");
            return;
        }

        if (!selectedPostId) {
            alert("Please select a Facebook post to boost.");
            return;
        }

        setLoading(true);
        setStatus(null);
        setOptimizationTips(null);

        try {
            // Determine Payload
            const payload = {
                lat: location.lat,
                lng: location.lng,
                radius: radius,
                type: 'existing', // Always existing post now
                postId: selectedPostId,
                goal: goal // New field for backend optimization
            };

            const res = await fetch('/api/create-radius-ad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle Specific Quota Error
                if (data.error === "AI_QUOTA_EXCEEDED" || res.status === 429) {
                    setStatus({
                        type: 'error',
                        text: data.message || "AI Usage Limit Reached.",
                        action: 'settings'
                    } as any);
                    return;
                }
                throw new Error(data.error || 'Failed to create ad');
            }

            setStatus({ type: 'success', text: `Campaign Launched! ID: ${data.campaignId}` });
            if (data.aiOptimization) {
                setOptimizationTips(data.aiOptimization);
            }

            // Reset
            setSelectedPostId(null);
            setLocation(null);

        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ... [keep existing JSX until status section] ...



    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Megaphone className="text-blue-600" /> Launch Radius Ad
                </h1>
                <p className="text-gray-500">Boost your best Facebook posts to a local audience.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Inputs */}
                <div className="space-y-6">

                    {/* 1. Goal Selection (Viral vs Views) */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">Select Campaign Goal</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setGoal('engagement')}
                                className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center group ${goal === 'engagement' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-white text-gray-500 hover:border-orange-200'}`}
                            >
                                <div className={`p-3 rounded-full ${goal === 'engagement' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'} transition-colors`}>
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">Go Viral</div>
                                    <div className="text-[10px] opacity-80 uppercase tracking-wide font-semibold mt-1">Reactions & Comments</div>
                                </div>
                                {goal === 'engagement' && <div className="absolute top-3 right-3 text-orange-500"><CheckCircle size={18} /></div>}
                            </button>

                            <button
                                onClick={() => setGoal('views')}
                                className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center group ${goal === 'views' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200'}`}
                            >
                                <div className={`p-3 rounded-full ${goal === 'views' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'} transition-colors`}>
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">Max Views</div>
                                    <div className="text-[10px] opacity-80 uppercase tracking-wide font-semibold mt-1">Reach & Brand Awareness</div>
                                </div>
                                {goal === 'views' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle size={18} /></div>}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">

                        {/* 2. Algorithm AI Box */}
                        <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><Cpu size={100} /></div>
                            <div className="relative z-10 flex gap-4">
                                <div className="mt-1"><Zap className="text-yellow-400" size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-yellow-400 text-sm mb-1 uppercase tracking-wider">AI Optimizer Engine</h3>
                                    <p className="text-gray-300 text-xs leading-relaxed">
                                        {goal === 'engagement'
                                            ? "Algorithm set to prioritize high-intent users likely to comment and share. Optimizing bid placement for maximum viral coefficient."
                                            : "Algorithm set to maximize impressions per 1000 users (CPM). Targeting widest possible audience within radius for brand dominance."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Post Selection */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">Select Post to Boost</label>
                            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {MOCK_FACEBOOK_POSTS.map(post => (
                                    <div
                                        key={post.id}
                                        onClick={() => setSelectedPostId(post.id)}
                                        className={`flex gap-4 p-3 rounded-xl border cursor-pointer transition-all ${selectedPostId === post.id ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                                            <img src={post.image} alt="post" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-800 text-sm font-medium line-clamp-2">{post.message}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span>{post.date}</span>
                                                <span>• {post.likes} Likes</span>
                                            </div>
                                        </div>
                                        {selectedPostId === post.id && (
                                            <div className="shrink-0 text-blue-600">
                                                <CheckCircle size={20} className="fill-blue-100" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Location & Radius Summary (Editable) */}
                        {location && (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3 relative group">
                                <button
                                    onClick={() => setLocation(null)}
                                    className="absolute top-2 right-2 text-blue-300 hover:text-red-500 transition-colors p-1"
                                    title="Clear Location"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>

                                <div className="flex items-center gap-3 text-sm text-blue-700">
                                    <MapPin size={18} />
                                    <span className="font-bold">Target Center Details</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={location.lat}
                                            onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
                                            className="w-full text-sm font-bold text-blue-900 outline-none bg-transparent"
                                        />
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={location.lng}
                                            onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
                                            className="w-full text-sm font-bold text-blue-900 outline-none bg-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">
                                        Radius: {(radius / 1000).toFixed(1)} KM
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleLaunchAd}
                            disabled={loading}
                            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${goal === 'engagement' ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-200 hover:shadow-orange-300' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:shadow-blue-300'}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Megaphone />}
                            {loading ? 'Launching Algorithm...' : `Boost for ${goal === 'engagement' ? 'Virality' : 'Views'}`}
                        </button>

                        {status && (
                            <div className={`p-4 rounded-xl text-sm border flex flex-col gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                <div className="font-bold flex items-center gap-2">
                                    {status.type === 'success' ? <CheckCircle size={18} /> : <Zap size={18} className="rotate-180" />}
                                    {status.text}
                                </div>

                                {/* Action Button for Settings */}
                                {(status as any).action === 'settings' && (
                                    <button
                                        onClick={() => router.push('/admin/settings')}
                                        className="mt-2 text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-bold w-fit hover:bg-red-700 transition-colors"
                                    >
                                        Manage AI Keys in Settings
                                    </button>
                                )}
                            </div>
                        )}

                        {optimizationTips && (
                            <div className="bg-slate-900 rounded-2xl p-6 text-white animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-2 mb-3 text-yellow-400">
                                    <Zap size={20} />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">AI Targeting Optmization</h3>
                                </div>
                                <div className="text-sm font-mono opacity-80 leading-relaxed bg-black/30 p-4 rounded-xl">
                                    {optimizationTips}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-right">Applied automatically to your campaign.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Map & Radius Control */}
                <div className="space-y-6">
                    <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 h-fit">
                        <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200">
                            <OSMMapPicker
                                onLocationSelect={setLocation}
                                radius={radius} // Pass dynamic radius
                            />
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-2">Click on the map or use the search bar to locate your audience.</p>
                    </div>

                    {/* Radius Slider */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Globe className="text-blue-600" size={20} />
                                <h3 className="font-bold text-gray-800">Target Radius</h3>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                                {(radius / 1000).toFixed(1)} KM
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="50000"
                            step="500"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span>1 KM</span>
                            <span>25 KM</span>
                            <span>50 KM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
