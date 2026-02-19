const { MongoClient } = require('mongodb');

// Get URI from environment variable or hardcode for this script execution
const uri = process.env.MONGODB_URI || "mongodb+srv://aidadmin:Bangladesh247152%40@cluster0.yzro6ml.mongodb.net/?appName=Cluster0";

async function setupTTL() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB...");
        const db = client.db("astharhat_analytics");

        // 1. Setup 'temp_chats' with 7-Day TTL
        // Create collection if not exists (implicit in createIndex usually, but let's be safe)
        try {
            await db.createCollection("temp_chats");
            console.log("Created 'temp_chats' collection");
        } catch (e) {
            // Collection might already exist
            console.log("'temp_chats' might already exist or error:", e.codeName);
        }

        const chatsCollection = db.collection("temp_chats");

        // Create TTL Index: expireAfterSeconds = 7 days * 24 hours * 60 mins * 60 secs = 604,800
        await chatsCollection.createIndex(
            { "createdAt": 1 },
            { expireAfterSeconds: 604800, name: "auto_delete_7_days" }
        );
        console.log("✅ Created 7-Day TTL Index on 'temp_chats'");

        // 2. Setup 'business_analytics' (No TTL, Permanent)
        try {
            await db.createCollection("business_analytics");
            console.log("Created 'business_analytics' collection");
        } catch (e) {
            console.log("'business_analytics' might already exist or error:", e.codeName);
        }

        const analyticsCollection = db.collection("business_analytics");
        await analyticsCollection.createIndex({ "timestamp": 1 });
        await analyticsCollection.createIndex({ "userId": 1 });
        console.log("✅ Created Indexes for 'business_analytics'");

    } catch (error) {
        console.error("Error setting up indexes:", error);
    } finally {
        await client.close();
    }
}

setupTTL();
