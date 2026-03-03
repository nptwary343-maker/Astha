export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { db, addDoc, collection, serverTimestamp, doc, getDoc } from '@/lib/firebase';
import { calculateCart } from '@/lib/cart-calculator';

/**
 * AVAILABILITY & ANALYSIS VERIFICATION
 * Sends a "Ping Mock Signal" across the entire system.
 * 1. Firebase Readiness
 * 2. Cart Logic Analysis Verification (Mock Signal)
 * 3. Hosting Environment Check
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const isLocal = process.env.NODE_ENV === 'development';

    // In production, we should protect this but allow easy monitoring
    const secret = process.env.INTERNAL_API_SECRET || '';
    // if (!isLocal && authHeader !== `Bearer ${secret}`) {
    //     return NextResponse.json({ status: "RESTRICTED", message: "Authorization required for full metrics" }, { status: 401 });
    // }

    const results: any = {
        timestamp: new Date().toISOString(),
        service: "ASTHAR HAT - CORE",
        environment: process.env.NODE_ENV,
        checks: {}
    };

    // 🧪 MOCK SCENARIO INJECTION (Dev Only)
    const { searchParams } = new URL(req.url);
    const mockId = searchParams.get('mock');
    if (isLocal && mockId) {
        if (mockId === 'critical_failure') {
            return NextResponse.json({
                ...results,
                checks: {
                    firebase: { status: "🔴 OFFLINE", error: "Connection timeout" },
                    cart_analysis: { status: "🔴 CRITICAL_FAILURE", error: "Logic error" },
                    search: { status: "🔴 ERROR" }
                },
                hosting_readiness: { status: "🟡 MISSING_CONFIG", missing_vars: ["SECRET"] },
                overall_status: "DEGRADED"
            });
        }
        if (mockId === 'all_healthy') {
            return NextResponse.json({
                ...results,
                checks: {
                    firebase: { status: "🟢 ONLINE", latency: "5ms" },
                    cart_analysis: { status: "🟢 VERIFIED", latency: "0.1ms" },
                    search: { status: "🟢 INDEXED", count: 100 }
                },
                hosting_readiness: { status: "🟢 READY_TO_HOST", missing_vars: [] },
                overall_status: "HEALTHY"
            });
        }
    }

    // 1. FIREBASE PING
    try {
        const start = Date.now();
        const settingsRef = doc(db, 'settings', 'siteSettings');
        await getDoc(settingsRef);
        results.checks.firebase = {
            status: "🟢 ONLINE",
            latency: `${Date.now() - start}ms`
        };
    } catch (e: any) {
        results.checks.firebase = { status: "🔴 OFFLINE", error: e.message };
    }

    // 2. MOCKED CART SIGNAL
    try {
        const mockCatalog = {
            "ping-test-1": { name: "Ping Pulse Item", price: 1000, stock: 50, category: "Test" }
        };
        const mockItems = [{ productId: "ping-test-1", qty: 2 }];

        const cartStart = performance.now();
        const calculation = calculateCart(mockItems, mockCatalog);
        const cartEnd = performance.now();

        const isValid = calculation.summary.finalTotal === 2000;

        if (isValid) {
            // 📡 PING SIGNAL: Log a heartbeat in Firestore for Admin visibility
            await addDoc(collection(db, 'system_signals'), {
                type: 'CART_ANALYSIS_PULSE',
                status: 'HEALTHY',
                latency: `${(cartEnd - cartStart).toFixed(4)}ms`,
                timestamp: serverTimestamp(),
                source: 'edge_availability_ping'
            });
        }

        results.checks.cart_analysis = {
            status: isValid ? "🟢 VERIFIED" : "🔴 CALCULATION_ERROR",
            latency: `${(cartEnd - cartStart).toFixed(4)}ms`,
            summary: calculation.summary
        };
    } catch (e: any) {
        results.checks.cart_analysis = { status: "🔴 CRITICAL_FAILURE", error: e.message };
    }

    // 3. SEARCH AVAILABILITY
    try {
        const { getSearchIndex } = await import('@/lib/db-utils');
        const index = await getSearchIndex();
        results.checks.search = { status: index.length > 0 ? "🟢 INDEXED" : "🟡 EMPTY", count: index.length };
    } catch (e) {
        results.checks.search = { status: "🔴 ERROR" };
    }

    // 4. HOSTING READINESS
    const requiredEnvs = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'INTERNAL_API_SECRET'
    ];
    const missing = requiredEnvs.filter(env => !process.env[env]);

    results.hosting_readiness = {
        status: missing.length === 0 ? "🟢 READY_TO_HOST" : "🟡 MISSING_CONFIG",
        missing_vars: missing
    };

    // Final Grade
    const allGreen = Object.values(results.checks).every((c: any) => c.status.includes('🟢') || c.status.includes('🟡'));
    results.overall_status = allGreen ? "HEALTHY" : "DEGRADED";

    return NextResponse.json(results);
}
