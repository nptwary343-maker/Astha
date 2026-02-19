
// Use CommonJS check for better compatibility with ts-node
const { initAdmin, adminDb } = require('../lib/firebase-admin');

async function testConnection() {
    console.log("🧪 TESTING_ADMIN_SDK: Initializing...");

    try {
        initAdmin();
        console.log("✅ SDK Initialized. Attempting Firestore connection...");

        const testDoc = await adminDb.collection('products').limit(1).get();
        console.log(`✅ CONNECTION_SUCCESS: Found ${testDoc.size} products.`);

        if (!testDoc.empty) {
            console.log("📄 Sample Product:", testDoc.docs[0].id);
        } else {
            console.log("⚠️ Products collection is empty, but connection works.");
        }

    } catch (error: any) {
        console.error("❌ TEST_FAILED:", error.message);
        if (error.errorInfo) {
            console.error("🔍 Error Info:", JSON.stringify(error.errorInfo, null, 2));
        }
    }
}

testConnection();
