'use client';
export const runtime = 'edge';;

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Eye, AlertTriangle, CheckCircle, Code } from 'lucide-react';

export default function BannerInjectorPage() {
    const [config, setConfig] = useState({
        html: '',
        css: '',
        js: '',
        isActive: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, 'site_config', 'hero_banner');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setConfig({
                        html: data.html || '',
                        css: data.css || '',
                        js: data.js || '',
                        isActive: data.isActive ?? true
                    });
                }
            } catch (error) {
                console.error("Error loading banner config:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const docRef = doc(db, 'site_config', 'hero_banner');
            await setDoc(docRef, {
                ...config,
                updatedAt: serverTimestamp()
            }, { merge: true });
            setMessage({ type: 'success', text: 'Banner configuration published successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Error saving: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete the whole banner configuration? This cannot be undone.")) return;

        setSaving(true);
        try {
            const docRef = doc(db, 'site_config', 'hero_banner');
            await setDoc(docRef, {
                html: '',
                css: '',
                js: '',
                isActive: false,
                updatedAt: serverTimestamp()
            });
            setConfig({ html: '', css: '', js: '', isActive: false });
            setMessage({ type: 'success', text: 'Banner configuration deleted successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Error deleting: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen bg-[#1e1e2d] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1e1e2d] text-gray-200 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <Code className="text-blue-500" />
                            Dynamic Banner Injector
                        </h1>
                        <p className="text-gray-400 mt-1">Zero Trust Sandboxed Code Injection Engine</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-[#2a2a3c] px-4 py-2 rounded-xl border border-gray-700">
                            <input
                                type="checkbox"
                                checked={config.isActive}
                                onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                                className="w-5 h-5 accent-blue-500"
                            />
                            <span className="font-bold">Active</span>
                        </label>
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 border-2 border-red-500/20 text-red-400 hover:bg-red-500/10 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Delete
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg ${saving ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                                } text-white`}
                        >
                            {saving ? 'Publishing...' : <><Save size={20} /> Publish Changes</>}
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                {/* Editor Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {/* HTML Input */}
                        <div className="bg-[#2a2a3c] rounded-2xl p-6 border border-gray-700 shadow-xl">
                            <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <html></html> HTML Structure
                            </h2>
                            <textarea
                                value={config.html}
                                onChange={(e) => setConfig({ ...config, html: e.target.value })}
                                placeholder="<div>Your banner content</div>"
                                className="w-full h-[200px] bg-[#1e1e2d] border border-gray-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* CSS Input */}
                        <div className="bg-[#2a2a3c] rounded-2xl p-6 border border-gray-700 shadow-xl">
                            <h2 className="text-sm font-black text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span>{ }</span> CSS Styles
                            </h2>
                            <textarea
                                value={config.css}
                                onChange={(e) => setConfig({ ...config, css: e.target.value })}
                                placeholder=".banner { background: red; }"
                                className="w-full h-[200px] bg-[#1e1e2d] border border-gray-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* JS Input */}
                        <div className="bg-[#2a2a3c] rounded-2xl p-6 border border-gray-700 shadow-xl">
                            <h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span>( )</span> JS Interactions
                            </h2>
                            <textarea
                                value={config.js}
                                onChange={(e) => setConfig({ ...config, js: e.target.value })}
                                placeholder="console.log('Banner loaded');"
                                className="w-full h-[300px] bg-[#1e1e2d] border border-gray-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Security Warning */}
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="text-orange-500 shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-orange-500 mb-1">Zero Trust Sandboxing Active</h3>
                                    <p className="text-sm text-gray-400">
                                        Your code will run in a strictly isolated &lt;iframe&gt;. It cannot access main site cookies, localStorage, or user sessions.
                                        Use <code className="bg-black/30 px-1 rounded text-orange-300">target="_parent"</code> for any links.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
