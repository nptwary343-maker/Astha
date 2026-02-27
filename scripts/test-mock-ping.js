
/**
 * 🧪 QUICK MOCK TESTER
 * Run this to check if the mock injection is working.
 */
async function testMocks() {
    const BASE_URL = 'http://localhost:3000';

    console.log("🚀 Testing HEALTHY Mock...");
    try {
        const resHealthy = await fetch(`${BASE_URL}/api/availability-ping?mock=all_healthy`);
        const dataHealthy = await resHealthy.json();
        console.log("Result:", dataHealthy.overall_status === 'HEALTHY' ? "✅ OK" : "❌ FAILED");

        console.log("\n🚀 Testing CRITICAL FAILURE Mock...");
        const resFailure = await fetch(`${BASE_URL}/api/availability-ping?mock=critical_failure`);
        const dataFailure = await resFailure.json();
        console.log("Result:", dataFailure.overall_status === 'DEGRADED' ? "✅ OK (System correctly identified as DEGRADED)" : "❌ FAILED");
        console.log("Firebase Status:", dataFailure.checks.firebase.status);
    } catch (e) {
        console.log("⚠️ Make sure the dev server is running at", BASE_URL);
        console.error("Error:", e.message);
    }
}

testMocks();
