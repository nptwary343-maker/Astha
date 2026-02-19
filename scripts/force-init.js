const { algoliasearch } = require('algoliasearch');

// Credentials (Directly using authorized keys)
const APP_ID = 'NS1FPYWGCF';
const ADMIN_API_KEY = '9b26b0fba76a8a5dec5112a2cab3d493';
const INDEX_NAME = 'asthar_products';

async function forceInitializeIndex() {
    console.log(`🚀 Forcing initialization of index: ${INDEX_NAME}...`);

    try {
        const client = algoliasearch(APP_ID, ADMIN_API_KEY);

        const dummyObject = {
            objectID: "init_1",
            name: "System Initialization Item",
            category: "System",
            price: 0,
            imageUrl: "https://placehold.co/100"
        };

        // Saving an object creates the index if it doesn't exist
        await client.saveObject({
            indexName: INDEX_NAME,
            body: dummyObject
        });

        console.log(`✅ Success: Index '${INDEX_NAME}' has been initialized.`);
        console.log(`🎉 Index created! Please refresh the website.`);

    } catch (error) {
        console.error('❌ Failed to initialize index:', error.message);
    }
}

forceInitializeIndex();
