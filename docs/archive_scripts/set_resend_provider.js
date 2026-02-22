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

        // Update the email provider to 'resend'
        await collection.updateOne(
            { _id: 'email_settings' },
            { $set: { provider: 'resend', updatedAt: new Date() } },
            { upsert: true }
        );

        console.log("✅ Successfully switched email provider to RESEND (Waiting for your Domain)");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
