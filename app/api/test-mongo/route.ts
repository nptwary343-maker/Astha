export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Since direct MongoDB TCP is disabled for Edge, 
        // this route now just pings the Data API status (mocked)
        return NextResponse.json({
            success: true,
            status: "REACHABLE",
            engine: "Edge/HTTP",
            message: "MongoDB Data API is simulated/reachable."
        });
    } catch (error: any) {
        console.error("❌ MONGO_TEST_ERROR:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            message: "MongoDB connection failed. Check MONGODB_URI."
        }, { status: 500 });
    }
}
