'use client';
export const runtime = 'edge';;

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save, Loader2, AlertCircle } from 'lucide-react';

export default function AdminRefundPolicyPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const docRef = doc(db, 'settings', 'content');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setContent(docSnap.data().refundPolicy || '');
                }
            } catch (error) {
                console.error("Error fetching content:", error);
                setMessage({ type: 'error', text: 'Failed to load content.' });
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const docRef = doc(db, 'settings', 'content');
            await setDoc(docRef, { refundPolicy: content }, { merge: true });
            setMessage({ type: 'success', text: 'Refund Policy updated successfully!' });
        } catch (error) {
            console.error("Error saving content:", error);
            setMessage({ type: 'error', text: 'Failed to save changes.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-orange-600" size={32} />
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Refund Policy Editor</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage the content of your public Refund Policy page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'error' && <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <label className="block font-bold text-gray-700">Policy Content</label>
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[500px] p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-mono text-sm leading-relaxed resize-none"
                        placeholder="Type your refund policy here..."
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                        {content.length} characters
                    </div>
                </div>
                <p className="text-sm text-gray-500 italic">
                    Tip: You can simple plain text here. Paragraphs will be preserved.
                </p>
            </div>
        </div>
    );
}
