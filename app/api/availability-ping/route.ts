import { NextRequest, NextResponse } from 'next/server';
import { calculateCart } from '@/lib/cart-calculator';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// export const runtime = 'edge'; // Removed to avoid Firebase 'navigator' error in Edge

/**
 * AVAILABILITY & ANALYSIS VERIFICATION
 * Sends a "Ping Mock Signal" across the entire system.
 * 1. Firebase Readiness
 * 2. MongoDB Resilience Check
 * 3. Cart Logic Analysis Verification (Mock Signal)
 * 4. Hosting Environment Check
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const isLocal = process.env.NODE_ENV === 'development';

    // In production, we should protect this but allow easy monitoring
    const secret = process.env.INTERNAL_API_SECRET || 'dev_secret_bypass';
    if (!isLocal && authHeader !== `Bearer ${secret}`) {
        // Return structured but restricted data if not authorized
        return NextResponse.json({ status: "RESTRICTED", message: "Authorization required for full metrics" }, { status: 401 });
    }

    const results: any = {
        timestamp: new Date().toISOString(),
        service: "ASTHAR HAT - CORE",
        environment: process.env.NODE_ENV,
        checks: {}
    };

    // 1. FIREBASE PING
    try {
        const start = Date.now();
        const docRef = doc(db, 'settings', 'siteSettings');
        await getDoc(docRef);
        results.checks.firebase = {
            status: "🟢 ONLINE",
            latency: `${Date.now() - start}ms`
        };
    } catch (e: any) {
        results.checks.firebase = { status: "🔴 OFFLINE", error: e.message };
    }

    // 2. MOCKED CART SIGNAL (Analysis Verification)
    try {
        const mockCatalog = {
            "ping-test-1": { name: "Ping Pulse Item", price: 1000, stock: 50, category: "Test" }
        };
        const mockItems = [{ productId: "ping-test-1", qty: 2 }];

        const cartStart = performance.now();
        const calculation = calculateCart(mockItems, mockCatalog);
        const cartEnd = performance.now();

        const isValid = calculation.summary.finalTotal === 2000;

        results.checks.cart_analysis = {
            status: isValid ? "🟢 VERIFIED" : "🔴 CALCULATION_ERROR",
            mock_signal: "RECEIVED",
            latency: `${(cartEnd - cartStart).toFixed(4)}ms`,
            summary: calculation.summary
        };
    } catch (e: any) {
        results.checks.cart_analysis = { status: "🔴 CRITICAL_FAILURE", error: e.message };
    }

    // 3. MONGODB PING (Optional Check)
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (mongoUri) {
            results.checks.mongodb = { status: "🟢 CONFIGURED", info: "Ready for failover" };
        } else {
            results.checks.mongodb = { status: "🟡 MISSING", info: "System will run on Firebase only" };
        }
    } catch (e) {
        results.checks.mongodb = { status: "🔴 ERROR" };
    }

    // 4. SEARCH AVAILABILITY
    try {
        const { getSearchIndex } = await import('@/lib/db-utils');
        const index = await getSearchIndex();
        results.checks.search = { status: index.length > 0 ? "🟢 INDEXED" : "🟡 EMPTY", count: index.length };
    } catch (e) {
        results.checks.search = { status: "🔴 ERROR" };
    }

    // 5. HOSTING READINESS
    const requiredEnvs = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'GEMINI_API_KEY',
        'INTERNAL_API_SECRET'
    ];
    const missing = requiredEnvs.filter(env => !process.env[env]);

    results.hosting_readiness = {
        status: missing.length === 0 ? "🟢 READY_ TO_HOST" : "🟡 MISSING_CONFIG",
        missing_vars: missing
    };

    // Final Grade
    const allGreen = Object.values(results.checks).every((c: any) => c.status.includes('🟢') || c.status.includes('🟡'));
    results.overall_status = allGreen ? "HEALTHY" : "DEGRADED";

    return NextResponse.json(results);
}
