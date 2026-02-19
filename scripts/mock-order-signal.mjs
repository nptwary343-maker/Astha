import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Manual simple .env.local parser
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

async function sendMockOrder() {
    console.log("🛰️ INITIALIZING MOCK DATA SIGNAL (Order Sync Test)...");

    loadEnv();

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || "astharhat_analytics";

    if (!uri) {
        console.error("❌ ERROR: MONGODB_URI not found");
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection("orders");

        const mockOrderId = `MOCK-AH-${Date.now()}`;
        const mockOrder = {
            orderId: mockOrderId,
            total: 2450.00,
            status: "New",
            paymentMethod: "bKash",
            customerName: "Test User (Daisy)",
            createdAt: new Date().toISOString(),
            isMock: true
        };

        console.log(`📡 Sending Signal for Order: ${mockOrderId}...`);

        const result = await col.updateOne(
            { orderId: mockOrderId },
            { $set: mockOrder },
            { upsert: true }
        );

        if (result.acknowledged) {
            console.log("✅ DATA SIGNAL RECEIVED! MongoDB successfully stored the mock order.");
            console.log("📈 AI ANALYTICS READY: Daisy can now see this test order.");
            console.log(`📦 Order Details: ৳${mockOrder.total} via ${mockOrder.paymentMethod}`);
        }

    } catch (err) {
        console.error("❌ SIGNAL FAILED:", err.message);
    } finally {
        await client.close();
        console.log("💤 Signal complete. Connection closed.");
    }
}

sendMockOrder();
