const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Load URI from environment variable
const uri = process.env.MONGODB_AGRI_URI;

if (!uri) {
    console.error("❌ ERROR: MONGODB_AGRI_URI is not defined in .env.local");
    process.exit(1);
}

async function testConnection() {
    // Remove the hardcoded password logic for safety
    const client = new MongoClient(uri);
    try {
        console.log("⏳ Connecting to Agri-Fund DB...");
        await client.connect();
        const db = client.db('astharhat_agri_fund');

        // Create a dummy project for testing
        const projects = db.collection('projects');
        await projects.insertOne({
            name: "Initial Agri Project (Secure)",
            type: "Carbon Trading",
            farmerCount: 0,
            totalInvestment: 0,
            createdAt: new Date()
        });

        console.log("✅ SUCCESS: Connected to Agri-Fund DB and inserted initial data securely!");
    } catch (e) {
        console.error("❌ CONNECTION FAILED:", e.message);
    } finally {
        await client.close();
    }
}

testConnection();
