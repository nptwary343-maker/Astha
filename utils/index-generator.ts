import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🛠️ SEARCH INDEX GENERATOR (Senior Software Architect Edition)
 * Responsibility: Shard Firestore 'products' into 500-unit chunks for FlexSearch.
 * Flow: 
 * 1. Fetch all products.
 * 2. Split into shards.
 * 3. Generate Master Index.
 * 4. Save to public directory (Simulating Firebase Storage for Local Dev).
 */

const SHARD_SIZE = 500;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'search-index');

export async function generateSearchShards() {
    console.log('🏗️  Starting Scalable Search Sharding...');

    // 1. Ensure Output Dir
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 2. Initialize Firebase Admin (if not already done)
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
        const shardFiles: string[] = [];

        for (let i = 0; i < shardCount; i++) {
            const start = i * SHARD_SIZE;
            const end = start + SHARD_SIZE;
            const shardData = allProducts.slice(start, end).map(p => ({
                id: p.id,
                name: (p as any).name,
                category: (p as any).category,
                price: (p as any).price,
                imageUrl: (p as any).images?.[0] || (p as any).imageUrl || '',
                description: (p as any).description || ''
            }));

            const shardName = `shard-${i + 1}.json`;
            const shardPath = path.join(OUTPUT_DIR, shardName);
            fs.writeFileSync(shardPath, JSON.stringify(shardData));
            shardFiles.push(`/search-index/${shardName}`);
            console.log(`✅ Generated ${shardName} (${shardData.length} items)`);
        }

        // 3. Generate Master Index
        const masterIndex = {
            totalProducts: allProducts.length,
            shardCount: shardCount,
            shards: shardFiles,
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
        };

        fs.writeFileSync(path.join(OUTPUT_DIR, 'master-index.json'), JSON.stringify(masterIndex));
        console.log('✨ Master Index created successfully.');

        return masterIndex;

    } catch (error) {
        console.error('❌ Sharding Failed:', error);
        throw error;
    }
}
