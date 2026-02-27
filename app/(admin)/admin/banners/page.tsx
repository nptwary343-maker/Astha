'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Layout, Type, UploadCloud, X, Link as LinkIcon, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Loader2 } from 'lucide-react';

export default function BannersPage() {
    const [title, setTitle] = useState('AstharHat Biggest Sale');
    const [subtitle, setSubtitle] = useState('Up to 50% off on all Premium Electronics');
    const [gradientFrom, setGradientFrom] = useState('orange-600');
    const [gradientTo, setGradientTo] = useState('purple-900');
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [bgOpacity, setBgOpacity] = useState(0.5);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'hero-banner');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title || '');
                    setSubtitle(data.subtitle || '');
                    setGradientFrom(data.gradientFrom || 'orange-600');
                    setGradientTo(data.gradientTo || 'purple-900');
                    setBackgroundImage(data.backgroundImage || null);
                    if (data.bgOpacity) setBgOpacity(data.bgOpacity);
                }
            } catch (error) {
                console.error("Error fetching banner settings:", error);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, "settings", "hero-banner"), {
                title,
                subtitle,
                gradientFrom,
                gradientTo,
                backgroundImage, // Saves null if removed
                bgOpacity
            });

            alert('Banner settings updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("📂 [BANNER_UPLOAD_START]", file.name);
        setIsUploading(true);
        try {
            // 🚀 Actual Cloudinary Upload
            const secureUrl = await uploadToCloudinary(file);
            setBackgroundImage(secureUrl);
            console.log("✅ [BANNER_UPLOAD_SUCCESS]", secureUrl);
        } catch (error: any) {
            console.error("🚨 [BANNER_UPLOAD_ERROR]", error);
            alert(`Upload Failed: ${error.message || "Unknown Error"}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ads & Banners</h1>
                    <p className="text-gray-500">Customize the homepage hero section and promotional banners.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2"><Layout size={18} /> Live Preview</h2>
                    <div
                        className={`relative rounded-2xl overflow-hidden bg-gradient-to-r from-${gradientFrom} to-${gradientTo} p-12 flex flex-col items-center justify-center text-center min-h-[350px] shadow-2xl transition-all duration-500 group`}
                    >
                        {/* Background Image Layer */}
                        {backgroundImage && (
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={backgroundImage}
                                    alt="Banner Background"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: bgOpacity }}></div>
                            </div>
                        )}

                        {/* Content Layer */}
                        <div className="relative z-10">
                            <h1 className="text-white text-4xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
                                {title || 'Banner Title'}
                            </h1>
                            <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-8 drop-shadow-md">
                                {subtitle || 'Banner Subtitle'}
                            </p>
                            <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 duration-200">
                                Shop Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">Content Settings</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Type size={16} /> Headline Text
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. Big Summer Sale"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle / Description</label>
                            <textarea
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                placeholder="e.g. Up to 50% off..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">Background & Style</h3>

                    <div className="space-y-6">
                        {/* Background Image Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <ImageIcon size={16} /> Banner Background Image
                            </label>

                            <div className="space-y-3">
                                {/* URL Input */}
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={backgroundImage || ''}
                                        onChange={(e) => setBackgroundImage(e.target.value)}
                                        placeholder="Paste image URL here..."
                                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    {backgroundImage && (
                                        <button
                                            onClick={() => setBackgroundImage('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="text-center text-xs text-gray-400 font-bold uppercase">OR</div>

                                {/* File Upload */}
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all bg-gray-50/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                                <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">Processing...</p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-xs text-gray-500 font-medium">Click to upload image</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                </label>

                                {backgroundImage && (
                                    <button
                                        onClick={() => setBackgroundImage(null)}
                                        className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
                                    >
                                        <Trash2 size={16} /> Remove Background Image
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Opacity Control (Only if image exists) */}
                        {backgroundImage && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                                    <span>Image Overlay Darkness</span>
                                    <span>{(bgOpacity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="0.9"
                                    step="0.1"
                                    value={bgOpacity}
                                    onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        )}

                        <div className="w-full h-px bg-gray-100 my-4"></div>

                        {/* Fallback Gradient */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fallback Gradient</label>
                            <p className="text-xs text-gray-500 mb-3">Visible if image fails to load or while loading.</p>
                            <div className="flex gap-2">
                                <button onClick={() => { setGradientFrom('orange-600'); setGradientTo('purple-900'); }} className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-purple-900 border-2 border-white shadow-sm ring-1 ring-gray-200"></button>
                                <button onClick={() => { setGradientFrom('blue-600'); setGradientTo('purple-900'); }} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-900 border-2 border-white shadow-sm ring-1 ring-gray-200"></button>
                                <button onClick={() => { setGradientFrom('red-600'); setGradientTo('orange-500'); }} className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 border-2 border-white shadow-sm ring-1 ring-gray-200"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
