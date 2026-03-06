'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';

export default function DebugFirebasePage() {
    const [heroBanner, setHeroBanner] = useState<any>(null);
    const [homeBanners, setHomeBanners] = useState<any[]>([]);
    const [status, setStatus] = useState('Loading...');
    const [writeStatus, setWriteStatus] = useState('');

    const fetchAll = async () => {
        setStatus('Fetching from Firebase...');
        try {
            // 1. Read settings/hero-banner
            const heroSnap = await getDoc(doc(db, 'settings', 'hero-banner'));
            setHeroBanner(heroSnap.exists() ? { id: heroSnap.id, ...heroSnap.data() } : null);

            // 2. Read homeBanners collection
            const bannersSnap = await getDocs(collection(db, 'homeBanners'));
            setHomeBanners(bannersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            setStatus(`✅ Done! Found: hero-banner=${heroSnap.exists() ? 'YES' : 'NO'}, homeBanners count=${bannersSnap.size}`);
        } catch (e: any) {
            setStatus(`❌ Error: ${e.message}`);
        }
    };

    const fixNow = async () => {
        setWriteStatus('Writing test banner to both locations...');
        try {
            const testData = {
                title: 'TEST BANNER - Admin Working!',
                subtitle: 'If you see this on homepage, the fix worked!',
                backgroundImage: '',
                imageUrl: '',
                active: true,
                order: 0,
                buttonText: 'Shop Now',
                buttonLink: '/shop',
            };

            // Write to settings/hero-banner (for HeroBanner on shop page)
            await setDoc(doc(db, 'settings', 'hero-banner'), testData, { merge: true });

            // Write to homeBanners/primary (for homepage)
            await setDoc(doc(db, 'homeBanners', 'primary'), testData);

            setWriteStatus('✅ Written! Now refresh homepage to check.');
            fetchAll();
        } catch (e: any) {
            setWriteStatus(`❌ Write failed: ${e.message} - Are you logged in as admin?`);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    return (
        <div style={{ fontFamily: 'monospace', padding: '2rem', background: '#0f172a', color: '#e2e8f0', minHeight: '100vh' }}>
            <h1 style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '1rem' }}>🔥 Firebase Debug Panel</h1>

            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{status}</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={fetchAll} style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                    🔄 Refresh Data
                </button>
                <button onClick={fixNow} style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                    🚀 Write Test Banner (Fix Now)
                </button>
            </div>

            {writeStatus && (
                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #f59e0b' }}>
                    <p>{writeStatus}</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.75rem' }}>
                    <h2 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>settings/hero-banner</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Used by: Shop page (/shop)</p>
                    {heroBanner ? (
                        <pre style={{ fontSize: '0.7rem', color: '#86efac', overflow: 'auto', maxHeight: '300px' }}>
                            {JSON.stringify(heroBanner, null, 2)}
                        </pre>
                    ) : (
                        <p style={{ color: '#ef4444' }}>❌ Document does NOT exist in Firebase!</p>
                    )}
                </div>

                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.75rem' }}>
                    <h2 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>homeBanners collection</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Used by: Homepage (/)</p>
                    {homeBanners.length === 0 ? (
                        <p style={{ color: '#ef4444' }}>❌ Collection is EMPTY! Homepage has no banners.</p>
                    ) : (
                        homeBanners.map(b => (
                            <div key={b.id} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                                <p style={{ color: '#60a5fa', fontWeight: 'bold' }}>ID: {b.id} | active: {String(b.active)}</p>
                                <p style={{ color: '#86efac', fontSize: '0.7rem' }}>title: {b.title || '(empty)'}</p>
                                <p style={{ color: '#86efac', fontSize: '0.7rem' }}>imageUrl: {b.imageUrl || b.backgroundImage || '(no image)'}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem', background: '#1e293b', padding: '1rem', borderRadius: '0.75rem' }}>
                <h2 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>📋 What this means:</h2>
                <ul style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.8' }}>
                    <li>• Admin → Banners page saves to: <span style={{ color: '#86efac' }}>settings/hero-banner</span> → Visible on <b>/shop</b></li>
                    <li>• Homepage (/) reads from: <span style={{ color: '#86efac' }}>homeBanners collection</span></li>
                    <li>• Admin → Settings → Home Content saves to: <span style={{ color: '#86efac' }}>settings/hero-banner</span> only</li>
                    <li>• <span style={{ color: '#f59e0b' }}>Fix:</span> Click "Write Test Banner" above to sync both</li>
                </ul>
            </div>
        </div>
    );
}
