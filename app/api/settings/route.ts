export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const getCachedFBConfig = async () => {
    try {
        const settingsRef = doc(db, 'settings', 'fb_config');
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
            return { pixelId: snap.data().pixelId || null };
        }
        return { pixelId: null };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { pixelId: null };
    }
};

export async function GET() {
    try {
        const config = await getCachedFBConfig();
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}
