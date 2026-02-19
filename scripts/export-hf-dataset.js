const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (assuming service-account.json is in the root)
const serviceAccount = require('../service-account.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function exportDataset() {
    console.log("📂 Starting Dataset Export for Ayesha AI Brain...");

    try {
        const productsSnapshot = await db.collection('products').get();
        const products = [];

        productsSnapshot.forEach(doc => {
            const data = doc.data();
            products.push({
                name: data.name,
                category: data.category,
                price: `৳${data.price}`,
                description: data.description ? data.description.substring(0, 150) + "..." : "No description",
                stock: data.stock > 0 ? "Available" : "Stock Out"
            });
        });

        const outputData = {
            store: "AstharHat",
            lastUpdate: new Date().toISOString(),
            dataset: products
        };

        const outputDir = path.join(__dirname, '../hf_space');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        fs.writeFileSync(
            path.join(outputDir, 'knowledge_base.json'),
            JSON.stringify(outputData, null, 2)
        );

        console.log(`✅ Success! Exported ${products.length} products to hf_space/knowledge_base.json`);
    } catch (error) {
        console.error("❌ Export Failed:", error);
    }
}

exportDataset();
