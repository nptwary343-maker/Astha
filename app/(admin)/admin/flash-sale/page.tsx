'use client';
export const runtime = 'edge';;

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Save, Trash2, Zap, Clock, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

export default function FlashSaleManager() {
    const [title, setTitle] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const docRef = doc(db, 'site_config', 'flash_sale');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTitle(data.title || '');
                // Format for datetime-local: YYYY-MM-DDTHH:mm
                if (data.targetDate) {
                    const date = new Date(data.targetDate);
                    const formattedDate = date.toISOString().slice(0, 16);
                    setTargetDate(formattedDate);
                }
                setIsActive(data.isActive || false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async (activeStatus: boolean) => {
        if (!title || !targetDate) {
            alert("Please fill in both title and target date.");
            return;
        }

        try {
            setSaving(true);
            await setDoc(doc(db, 'site_config', 'flash_sale'), {
                title,
                targetDate: new Date(targetDate).toISOString(),
                isActive: activeStatus,
                updatedAt: serverTimestamp()
            });
            setIsActive(activeStatus);
            alert(activeStatus ? "Flash Sale Started!" : "Flash Sale Progress Saved.");
        } catch (error) {
            console.error("Error saving flash sale:", error);
            alert("Failed to save flash sale.");
        } finally {
            setSaving(false);
        }
    };

    const handleStop = async () => {
        try {
            setSaving(true);
            await setDoc(doc(db, 'site_config', 'flash_sale'), {
                isActive: false,
                updatedAt: serverTimestamp()
            }, { merge: true });
            setIsActive(false);
            alert("Flash Sale Stopped.");
        } catch (error) {
            console.error("Error stopping flash sale:", error);
            alert("Failed to stop flash sale.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
            <div className="mb-8 border-b border-gray-100 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Zap className="text-orange-500" fill="currentColor" />
                        Flash Sale Manager
                    </h1>
                    <p className="text-gray-500 mt-1">Schedule and control urgent countdown banners across your site.</p>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
                    {isActive ? 'Live Now' : 'Off Air'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Configuration Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Sale Headline</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium"
                                    placeholder="e.g. MEGA EID FLASH SALE"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Target End Date & Time</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full px-5 py-3 pl-12 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all font-mono"
                                    />
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col md:flex-row gap-4">
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
                                Start / Update Flash Sale
                            </button>
                            <button
                                onClick={handleStop}
                                disabled={saving || !isActive}
                                className="bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600"
                            >
                                <Trash2 size={18} />
                                Stop Sale
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status & Help Card */}
                <div className="space-y-6">
                    <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
                        <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-4">
                            <AlertTriangle size={18} />
                            How it works
                        </h3>
                        <ul className="text-sm text-orange-700 space-y-3">
                            <li className="flex gap-2">
                                <span className="font-bold">1.</span>
                                Set the title and target end time.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">2.</span>
                                Click "Start Sale" to show the banner.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">3.</span>
                                The banner appears instantly on the frontend.
                            </li>
                            <li className="flex gap-2 font-bold">
                                <span className="font-bold">4.</span>
                                When the timer hits 0, the banner hides itself automatically.
                            </li>
                        </ul>
                    </div>

                    {isActive && (
                        <div className="bg-green-50 rounded-3xl p-8 border border-green-100 flex items-center gap-4">
                            <div className="bg-green-600 text-white p-3 rounded-2xl shadow-lg shadow-green-100">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-800 uppercase tracking-wider">Live Preview</p>
                                <p className="text-xs text-green-600">The banner is currently broadcasting to all users.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
