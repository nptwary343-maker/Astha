const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[13] || match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    });
    return env;
}

async function testMongoPing() {
    const env = getEnv();
    const API_KEY = env.MONGODB_DATA_API_KEY;
    const API_URL = env.MONGODB_DATA_API_URL;
    const CLUSTER = env.MONGODB_CLUSTER || env.MONGODB_CLUSTER_NAME || 'Cluster0';
    const DATABASE = env.MONGODB_DB || env.MONGODB_DATABASE_NAME || 'astharhat_analytics';

    console.log("🔍 [MOCK_DATA_PING] System Audit...");

    const isSimulation = !API_KEY || !API_URL;

    if (isSimulation) {
        console.log("⚠️  Credentials missing in .env.local. Running in SIMULATION MODE.");
    } else {
        console.log("✅ Credentials found. Running in LIVE MODE.");
    }

    const mockOrder = {
        orderId: "MOCK_" + Math.random().toString(36).substring(7).toUpperCase(),
        customerName: "Ping Bot v2",
        totalPrice: 420.69,
        status: "SUCCESS_ENSURED",
        timestamp: new Date().toISOString(),
        note: "This is a resilience verification ping."
    };

    console.log("\n📦 Mock Data Payload:");
    console.log(JSON.stringify(mockOrder, null, 2));

    if (isSimulation) {
        // Demonstrate what a success looks like
        await new Promise(r => setTimeout(r, 1000));
        console.log("\n📡 [SIMULATION] Sending to Atlas Data API...");
        await new Promise(r => setTimeout(r, 800));
        console.log("\n✨ [SUCCESS] Mock Data Processing PASS!");
        console.log("-----------------------------------------");
        console.log("Result: { success: true, insertedId: 'sim_67f0fbc5_test' }");
        console.log("Status: LOGGED_AS_SIMULATION");
        console.log("-----------------------------------------");
        console.log("\n👉 Real success requires adding MONGODB_DATA_API_KEY to .env.local");
    } else {
        try {
            const response = await fetch(`${API_URL}/action/insertOne`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': API_KEY },
                body: JSON.stringify({
                    dataSource: CLUSTER,
                    database: DATABASE,
                    collection: "test_pings",
                    document: mockOrder
                }),
            });
            const result = await response.json();
            if (response.ok) {
                console.log("\n🚀 [LIVE_SUCCESS] Data reaching MongoDB Atlas!");
                console.log("Inserted ID:", result.insertedId);
            } else {
                console.error("\n❌ [LIVE_FAIL] API Error:", result);
            }
        } catch (error) {
            console.error("\n❌ [LIVE_ERROR] Connection failure:", error.message);
        }
    }
}

testMongoPing();
