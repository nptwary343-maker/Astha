const admin = require('firebase-admin');
const { algoliasearch } = require('algoliasearch');
const fs = require('fs');
const path = require('path');

/**
 * 🚜 PRODUCT IMAGE UPDATER (ROBUST VERSION)
 * Updates Firestore and Algolia simultaneously with realistic images.
 */

// 1. Credentials
const APP_ID = '';
const ADMIN_API_KEY = '';
const INDEX_NAME = 'asthar_products';

const saPath = path.join(process.cwd(), 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const algoliaClient = algoliasearch(APP_ID, ADMIN_API_KEY);

async function runUpdate() {
    console.log('🔍 Fetching products from Firestore...');

    try {
        const snapshot = await db.collection('products').get();
        if (snapshot.empty) {
            console.log('❌ No products found.');
            return;
        }

        console.log(`📊 Found ${snapshot.size} products. Preparing batch...`);

        const batch = db.batch();
        const algoliaRecords = [];
        let count = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const name = data.name || 'Product';

            // Map keywords for better relevance
            let keyword = 'agriculture,food';
            if (/tea/i.test(name)) keyword = 'tea,plantation';
            else if (/milk|dairy|ghee/i.test(name)) keyword = 'cow,milk';
            else if (/mango|fruit/i.test(name)) keyword = 'mango,fruit';
            else if (/rice|paddy/i.test(name)) keyword = 'rice,paddy';
            else if (/snack|biscuit/i.test(name)) keyword = 'cookies,snacks';

            const sig = Math.floor(Math.random() * 5000);
            const url = `https://loremflickr.com/800/600/${encodeURIComponent(keyword)}?lock=${sig}`;

            // Firestore Update (Use set with merge for safety)
            batch.set(doc.ref, {
                imageUrl: url,
                images: [url]
            }, { merge: true });

            // Prepare Algolia Record
            algoliaRecords.push({
                objectID: doc.id,
                imageUrl: url,
                images: [url]
            });

            count++;
        });

        // 2. Commit Firestore
        console.log('📤 Committing Firestore batch...');
        await batch.commit();
        console.log('✅ Firestore updated.');

        // 3. Update Algolia
        console.log('📤 Syncing with Algolia...');
        await algoliaClient.partialUpdateObjects({
            indexName: INDEX_NAME,
            objects: algoliaRecords
        });
        console.log('✅ Algolia synced.');

        console.log(`\n✨ FINISHED: ${count} products now have realistic agricultural images.`);

    } catch (err) {
        console.error('❌ ERROR:', err);
    }
}

runUpdate();
