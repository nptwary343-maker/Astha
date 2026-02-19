const { MongoClient } = require('mongodb');

// URI manually constructed for test (matching the one in .env.local)
const uri = "mongodb+srv://asthar_admin:AstharHat%402026@cluster0.fcqn4v6.mongodb.net/astharhat_agri_fund?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
    const client = new MongoClient(uri);
    try {
        console.log("⏳ Connecting to NEW Agri-Fund DB...");
        await client.connect();
        const db = client.db('astharhat_agri_fund');

        // Create a dummy project for testing
        const projects = db.collection('projects');
        await projects.insertOne({
            name: "Initial Agri Project",
            type: "Carbon Trading",
            farmerCount: 0,
            totalInvestment: 0,
            createdAt: new Date()
        });

        console.log("✅ SUCCESS: Connected to Agri-Fund DB and inserted initial data!");
    } catch (e) {
        console.error("❌ CONNECTION FAILED:", e.message);
    } finally {
        await client.close();
    }
}

testConnection();
