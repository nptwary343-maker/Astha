const { MongoClient } = require('mongodb');

// Connection URL
const uri = "mongodb+srv://aidadmin:Bangladesh247152%40@cluster0.yzro6ml.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db('astharhat_analytics');
        const collection = db.collection('system_config');

        // Update the email provider to 'auto'
        await collection.updateOne(
            { _id: 'email_settings' },
            { $set: { provider: 'auto', updatedAt: new Date() } },
            { upsert: true }
        );

        console.log("✅ Checkmate! Switched to 'AUTO' Mode.");
        console.log("👉 Strategy: Resend -> (fails) -> Gmail -> (fails) -> EmailJS");
        console.log("📧 Result: Emails will be sent via Gmail/EmailJS until Domain is ready!");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
