'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Layout } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import MarqueeBar from '@/components/MarqueeBar';

export default function BulletinManager() {
    const [messages, setMessages] = useState<any[]>([{ text: '', icon: 'flash' }]);
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchBulletin = async () => {
            const docRef = doc(db, 'settings', 'marquee');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.items) setMessages(data.items);
                if (data.isActive !== undefined) setIsActive(data.isActive);
            }
        };
        fetchBulletin();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Clean empty messages
        const validMessages = messages.filter(m => m.text.trim().length > 0);

        try {
            await setDoc(doc(db, "settings", "marquee"), {
                items: validMessages,
                isActive
            });
            alert('Bulletin settings updated successfully!');
            setMessages(validMessages.length > 0 ? validMessages : [{ text: '', icon: 'zap' }]);
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const addMessage = () => {
        setMessages([...messages, { text: '', icon: 'zap' }]);
    };

    const updateMessage = (index: number, field: string, value: string) => {
        const newMessages = [...messages];
        newMessages[index] = { ...newMessages[index], [field]: value };
        setMessages(newMessages);
    };

    const removeMessage = (index: number) => {
        const newMessages = messages.filter((_, i) => i !== index);
        setMessages(newMessages);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Top Bulletin / Marquee</h1>
                    <p className="text-gray-500">Manage the scrolling text bar at the top of the website.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            <div className="space-y-8">
                {/* Live Preview */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4"><Layout size={18} /> Live Preview</h2>
                    <div className="border-4 border-gray-100 rounded-xl overflow-hidden relative" style={{ minHeight: '60px' }}>
                        {isActive ? (
                            <div className="pointer-events-none">
                                <MarqueeBar />
                            </div>
                        ) : (
                            <div className="w-full h-10 bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400">
                                Bulletin is Currently Hidden
                            </div>
                        )}
                    </div>
                </div>

                {/* Configuration */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Scrolling Messages</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-600">Visible on Site:</span>
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <select
                                    className="p-3 rounded-lg border border-gray-200 bg-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                                    value={msg.icon}
                                    onChange={(e) => updateMessage(idx, 'icon', e.target.value)}
                                >
                                    <option value="zap">Flash (⚡)</option>
                                    <option value="truck">Truck (🚚)</option>
                                    <option value="sparkles">Sparkles (✨)</option>
                                    <option value="shopping-bag">Bag (🛍️)</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Enter bulletin text... e.g. 'Flash Sale: 50% Off'"
                                    className="flex-1 p-3 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                                    value={msg.text}
                                    onChange={(e) => updateMessage(idx, 'text', e.target.value)}
                                />

                                <button
                                    onClick={() => removeMessage(idx)}
                                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addMessage}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add New Message
                    </button>
                </div>
            </div>
        </div>
    );
}
