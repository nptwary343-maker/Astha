'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RefundPolicyContent() {
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const docRef = doc(db, 'settings', 'content');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setText(snap.data().refundPolicy || 'No policy content found.');
                } else {
                    setText('No policy content defined yet.');
                }
            } catch (e) {
                console.error(e);
                setText('Error loading policy.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
    );

    return (
        <div
            className="prose prose-lg prose-orange max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed"
        >
            {text}
        </div>
    );
}
