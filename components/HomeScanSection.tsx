'use client';

import { useState, useEffect } from 'react';
import { ScanLine } from 'lucide-react';
import Image from 'next/image';

export default function HomeScanSection() {
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        const fetchQr = async () => {
            try {
                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');
                const docRef = doc(db, 'settings', 'general');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setQrUrl(snap.data().homeQr || '');
                }
            } catch (error) {
                console.error("Error fetching Home QR:", error);
            }
        };
        fetchQr();
    }, []);

    if (!qrUrl) return null;

    return (
        <section className="px-4 py-8 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-6 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-blue-700/50 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-500/30">
                        <ScanLine size={16} className="animate-pulse" />
                        <span>Scan & Pay</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                        Exclusive Offer!<br />
                        <span className="text-blue-300">Scan to Order Instantly</span>
                    </h2>
                    <p className="text-blue-200 max-w-lg mx-auto md:mx-0">
                        Use your camera to scan the QR code and get exclusive deals or pay directly.
                    </p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300">
                    {/* Use standard img for external URLs or dynamic user input to avoid Next.js domain config issues for now, or just handle it if it's local */}
                    <img
                        src={qrUrl}
                        alt="Scan QR Code"
                        className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-lg border-2 border-dashed border-gray-200"
                    />
                </div>
            </div>
        </section>
    );
}
