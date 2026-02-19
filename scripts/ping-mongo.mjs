import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Manual simple .env.local parser to avoid extra dependencies
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

async function runPing() {
    console.log("🛰️ Initializing MOCK SIGNAL (Ping Test)...");

    loadEnv();

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || "astharhat_analytics";

    if (!uri) {
        console.error("❌ ERROR: MONGODB_URI not found in .env.local");
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        console.log("📡 Connecting to MongoDB Atlas...");
        await client.connect();

        const db = client.db(dbName);
        console.log(`🏠 Database: ${dbName}`);

        console.log("⚡ Sending PING command...");
        const result = await db.command({ ping: 1 });

        if (result.ok === 1) {
            console.log("✅ PONG! Signal received successfully.");

            const stats = await db.collection("products").countDocuments();
            console.log(`📦 AI Cache Status: ${stats} products found.`);

            console.log("🚀 CONCLUSION: MongoDB is REAL and ACTIVE.");
        } else {
            console.log("⚠️ Signal sent but response was unclear.");
        }
    } catch (err) {
        console.error("❌ SIGNAL INTERRUPTED: Connection failed.");
        console.error(err.message);
    } finally {
        await client.close();
        console.log("💤 Connection closed.");
    }
}

runPing();
