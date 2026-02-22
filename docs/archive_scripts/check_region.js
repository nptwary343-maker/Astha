const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://aidadmin:Bangladesh247152%40@cluster0.yzro6ml.mongodb.net/?appName=Cluster0";

async function run() {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const adminDb = client.db().admin();
        const info = await adminDb.command({ hello: 1 });
        console.log("--- MongoDB Info ---");
        console.log("Hosts:", JSON.stringify(info.hosts));
        console.log("Primary:", info.me);
        console.log("Region Hint (from tags):", info.tags);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}
run();
