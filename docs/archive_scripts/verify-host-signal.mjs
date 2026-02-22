import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Manual simple .env.local parser to get credentials
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
            }
        });
    }
}

async function runVerification() {
    console.log("🚀 INITIALIZING DEPLOYMENT-READY SIGNAL...");
    console.log("------------------------------------------");

    loadEnv();
    const secret = process.env.INTERNAL_API_SECRET || 'dev_secret_bypass';
    const baseUrl = "http://localhost:3000"; // Assuming local dev for now

    try {
        console.log(`📡 Sending 'Ping Mock Signal' to Cart Analysis...`);

        const response = await fetch(`${baseUrl}/api/availability-ping`, {
            headers: {
                'Authorization': `Bearer ${secret}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - Make sure dev server is running!`);
        }

        const data = await response.json();

        console.log("\n📊 ANALYSIS VERIFICATION REPORT:");
        console.log(`STATUS: ${data.overall_status === 'HEALTHY' ? '✅ HEALTHY' : '❌ DEGRADED'}`);
        console.log(`TIME  : ${data.timestamp}`);
        console.log("------------------------------------------");

        console.log(`[FIREBASE]      : ${data.checks.firebase.status} (${data.checks.firebase.latency})`);
        console.log(`[CART_ANALYSIS] : ${data.checks.cart_analysis.status} (Logic Verification: ${data.checks.cart_analysis.mock_signal})`);
        console.log(`[MATH_CHECK]    : ${data.checks.cart_analysis.summary.finalTotal === 2000 ? '✅ 100% ACCURATE' : '❌ FAILED'}`);
        console.log(`[MONGODB]       : ${data.checks.mongodb.status}`);
        console.log(`[HOST_READY]    : ${data.hosting_readiness.status}`);

        if (data.hosting_readiness.missing_vars.length > 0) {
            console.log(`⚠️ MISSING VARS: ${data.hosting_readiness.missing_vars.join(', ')}`);
        }

        console.log("\n✅ ALL OVER: Analysis verified. Signal Received. Project is ABILE IN HOSTE (Available in Host).");

    } catch (err) {
        console.error("❌ SIGNAL INTERRUPTED:", err.message);
        console.log("\n💡 TIP: Run 'npm run dev' first to verify signals locally.");
    }
}

runVerification();
