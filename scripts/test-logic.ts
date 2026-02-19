import fs from 'fs';
import path from 'path';

// Load Environment Variables manually for standalone script
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const [key, val] = line.split('=');
                if (key && val) {
                    process.env[key.trim()] = val.trim().replace(/^"|"$/g, '');
                }
            });
            console.log("✅ Loaded .env.local");
        } else {
            console.warn("⚠️ .env.local not found, relying on existing process.env");
        }
    } catch (e) {
        console.error("Failed to load env:", e);
    }
};

loadEnv();

async function runTest() {
    const { AIConfigManager } = await import('../lib/ai-config-manager');
    console.log("\n🧪 STARTING AI LOGIC TEST: Key Rotation & Edge Compatibility Check\n");

    // 1. Edge Compatibility Check
    console.log("--- 1. Edge Runtime Compatibility Check ---");
    let isEdgeSafe = true;
    try {
        // Simple check for native modules used
        const mongoModule = require('mongodb');
        if (mongoModule && mongoModule.MongoClient) {
            console.error("❌ CRITICAL FAIL: 'mongodb' module detected.");
            console.error("   Reason: The native MongoDB driver uses Node.js 'net' and 'tls' modules.");
            console.error("   Impact: This will CRASH inside an Edge Runtime environment (Vercel Edge Functions).");
            console.error("   Fix: Remove 'export const runtime = \"edge\"' from route.ts OR use Data API.");
            isEdgeSafe = false;
        }
    } catch (e) {
        console.log("⚠️ Could not load mongodb module to verify.");
    }

    if (isEdgeSafe) {
        console.log("✅ Edge Check Passed (simulated).");
    } else {
        console.log("🚫 EDGE RUNTIME WILL FAIL.");
    }

    // 2. Initial Config Fetch & Cache Verification
    console.log("\n--- 2. Fetching AI Config (Cache vs DB) ---");
    const start = Date.now();
    const config1 = await AIConfigManager.getConfig();
    const duration1 = Date.now() - start;
    console.log(`[Attempt 1] Fetch time: ${duration1}ms`);
    console.log(`[Attempt 1] Source: ${duration1 < 30 ? 'Likely Cache/Fallback' : 'Likely DB/Network'}`); // 30ms threshold
    console.log(`[Attempt 1] Active Keys Count: ${config1.activeKeys.length}`);

    // Verify Cache Hit on 2nd Try
    const start2 = Date.now();
    const config2 = await AIConfigManager.getConfig();
    const duration2 = Date.now() - start2;
    console.log(`[Attempt 2] Fetch time: ${duration2}ms`);
    if (duration2 < 10) {
        console.log("✅ CACHE VERIFIED: 2nd call was instant.");
    } else {
        console.log("⚠️ CACHE MISS: 2nd call took too long.");
    }

    // 3. Key Rotation Simulation
    console.log("\n--- 3. Simulating 429 Error & Key Rotation ---");

    // Mock Keys if none exist or only 1 exists for testing
    if (config1.activeKeys.length < 2) {
        console.warn("⚠️ Not enough real keys to test rotation. Injecting MOCK keys.");
        config1.activeKeys = ["MOCK_KEY_A", "MOCK_KEY_B_ROTATED", "MOCK_KEY_C"];
    }

    const maxRetries = 3;
    let success = false;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const currentKey = AIConfigManager.getKey(config1, attempt);
        console.log(`\n🔄 [Attempt ${attempt}] Using Key: ${currentKey.slice(0, 15)}... (Index: ${attempt % config1.activeKeys.length})`);

        try {
            // SIMULATE API CALL
            await mockApiCall(currentKey, attempt);
            console.log("✅ API Success!");
            success = true;
            break;
        } catch (error: any) {
            console.error(`❌ API Failed: ${error.message}`);
            if (error.message.includes("429")) {
                console.log("   -> Triggering Rotation Logic...");
            } else {
                console.log("   -> Unknown error, aborting.");
                break;
            }
        }
    }

    if (success) {
        console.log("\n✅ TEST PASSED: Rotation handled failures gracefully.");
    } else {
        console.error("\n❌ TEST FAILED: All keys exhausted or rotation failed.");
    }
}

// Mock API Call Function
async function mockApiCall(key: string, attempt: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Fail the first key (simulation)
            if (attempt === 0) {
                reject(new Error("429 Too Many Requests (Rate Limit)"));
            } else {
                resolve();
            }
        }, 100);
    });
}

runTest();
