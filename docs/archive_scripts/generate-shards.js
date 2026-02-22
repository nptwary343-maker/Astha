const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * 🛠️ SEARCH INDEX GENERATOR (Senior Software Architect Edition - JS Runtime)
 */

const SHARD_SIZE = 500;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'search-index');

async function generateSearchShards() {
    console.log('🏗️  Starting Scalable Search Sharding...');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    if (admin.apps.length === 0) {
        const saPath = path.join(process.cwd(), 'service-account.json');
        const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(sa) });
    }

    const db = admin.firestore();

    try {
        const snapshot = await db.collection('products').get();
        const allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`📦 Found ${allProducts.length} products. Partitioning into shards...`);

        const shardCount = Math.ceil(allProducts.length / SHARD_SIZE);
        const shardFiles = [];

        for (let i = 0; i < shardCount; i++) {
            const start = i * SHARD_SIZE;
            const end = start + SHARD_SIZE;
            const shardData = allProducts.slice(start, end).map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.price,
                imageUrl: p.images?.[0] || p.imageUrl || '',
                description: p.description || ''
            }));

            const shardName = `shard-${i + 1}.json`;
            const shardPath = path.join(OUTPUT_DIR, shardName);
            fs.writeFileSync(shardPath, JSON.stringify(shardData));
            shardFiles.push(`/search-index/${shardName}`);
            console.log(`✅ Generated ${shardName} (${shardData.length} items)`);
        }

        const masterIndex = {
            totalProducts: allProducts.length,
            shardCount: shardCount,
            shards: shardFiles,
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
        };

        fs.writeFileSync(path.join(OUTPUT_DIR, 'master-index.json'), JSON.stringify(masterIndex));
        console.log('✨ Master Index created successfully.');

    } catch (error) {
        console.error('❌ Sharding Failed:', error);
        process.exit(1);
    }
}

generateSearchShards().then(() => {
    console.log('✅ Index Generation Completed.');
    process.exit(0);
});
