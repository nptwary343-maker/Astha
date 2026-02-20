import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { unstable_cache } from 'next/cache';

export const runtime = 'edge';


// Standard Node.js runtime for Firebase compliance

// Cache the Facebook Config for 1 hour to save Firebase Reads
const getCachedFBConfig = unstable_cache(
    async () => {
        try {
            console.log("📡 FETCHING_FB_CONFIG: Loading from Firebase...");
            const settingsRef = doc(db, 'settings', 'fb_config');
            const snap = await getDoc(settingsRef);

            if (snap.exists()) {
                const data = snap.data();
                return {
                    pixelId: data.pixelId || null
                };
            }
            return { pixelId: null };
        } catch (error) {
            console.error("Error fetching settings:", error);
            return { pixelId: null };
        }
    },
    ['fb-config-settings'],
    { revalidate: 3600 }
);

export async function GET() {
    try {
        const config = await getCachedFBConfig();
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}
