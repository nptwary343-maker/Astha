import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ valid: false, message: "Token is required" }, { status: 400 });
        }

        // Fetch Dev Config
        const devRef = doc(db, 'settings', 'dev_config');
        const devSnap = await getDoc(devRef);

        if (!devSnap.exists()) {
            return NextResponse.json({ valid: false, message: "Developer API not configured" }, { status: 404 });
        }

        const data = devSnap.data();

        // 1. Check if Enabled
        if (!data.isEnabled) {
            return NextResponse.json({ valid: false, message: "Developer Access is DISABLED by Super Admin" }, { status: 403 });
        }

        // 2. Check Expiration
        const now = new Date();
        const expiry = new Date(data.expiresAt);
        if (now > expiry) {
            return NextResponse.json({ valid: false, message: "Token EXPIRED. Generate a new one in Admin Settings." }, { status: 401 });
        }

        // 3. Check Token Value
        if (data.token !== token) {
            return NextResponse.json({ valid: false, message: "Invalid Developer Token" }, { status: 403 });
        }

        // 4. Update Usage Count
        await updateDoc(devRef, {
            usageCount: increment(1)
        });

        return NextResponse.json({
            valid: true,
            message: "Access Granted",
            remainingMinutes: Math.floor((expiry.getTime() - now.getTime()) / 60000)
        });

    } catch (error: any) {
        console.error("Token Verification Error:", error);
        return NextResponse.json({ valid: false, message: error.message }, { status: 500 });
    }
}
