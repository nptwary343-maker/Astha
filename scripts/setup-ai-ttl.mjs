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

async function setOrderTTL() {
    console.log("🧹 SETTING UP AI DATA RETENTION POLICY (3 Days TTL)...");

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

        console.log("📡 Creating TTL Index on 'syncDate' field...");

        // 🚨 TTL Index: 3 Days = 3 * 24 * 60 * 60 seconds = 259,200 seconds
        const expireAfterSeconds = 3 * 24 * 60 * 60;

        const result = await col.createIndex(
            { syncDate: 1 },
            { expireAfterSeconds: expireAfterSeconds, name: "AI_FORGET_INDEX" }
        );

        console.log(`✅ SUCCESS: TTL Index '${result}' created.`);
        console.log(`⏱️ Data Retention: 3 Days (259,200 seconds).`);
        console.log("🛡️ POLICY ACTIVE: Daisy will only remember orders from the last 3 days.");
        console.log("📦 Permanent Data: Firebase will continue to store ALL orders forever.");

    } catch (err) {
        if (err.codeName === 'IndexOptionsConflict') {
            console.log("ℹ️ POLICY ALREADY EXISTS: The 3-day retention index is already active.");
        } else {
            console.error("❌ SETUP FAILED:", err.message);
        }
    } finally {
        await client.close();
        console.log("💤 Connection closed.");
    }
}

setOrderTTL();
