const { algoliasearch } = require('algoliasearch');

// Credentials
const APP_ID = '';
const ADMIN_API_KEY = '';

// INDEX TO KEEP
const PROTECTED_INDICES = ['products', 'asthar_hat_products', 'asthar_products'];

async function cleanupAlgolia() {
    console.log('🚀 Starting Algolia Cleanup Protocol...');

    try {
        const client = algoliasearch(APP_ID, ADMIN_API_KEY);

        // 1. List all indices
        const { items: indices } = await client.listIndices();

        if (indices.length === 0) {
            console.log('✅ No indices found. Application is already clean.');
            return;
        }

        console.log(`🔍 Found ${indices.length} total indices.`);

        let deletedCount = 0;

        for (const indexInfo of indices) {
            const indexName = indexInfo.name;

            if (PROTECTED_INDICES.includes(indexName)) {
                console.log(`🛡️  SKIPPING PROTECTED INDEX: ${indexName}`);
                continue;
            }

            // 2. Delete junk index
            console.log(`🗑️  DELETING JUNK INDEX: ${indexName}...`);
            await client.deleteIndex({ indexName });
            console.log(`✅ Deleted: ${indexName}`);
            deletedCount++;
        }

        console.log(`\n✨ CLEANUP COMPLETE!`);
        console.log(`📊 Summary: Deleted ${deletedCount} junk indices. Kept ${indices.length - deletedCount} protected indices.`);

    } catch (error) {
        console.error('❌ FATAL ERROR DURING CLEANUP:', error.message);
        if (error.message.includes('403')) {
            console.error('💡 Hint: Check if the Admin/Write API key has permission to delete indices.');
        }
    }
}

cleanupAlgolia();
