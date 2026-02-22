const { generateSearchShards } = require('./utils/index-generator');

async function run() {
    try {
        await generateSearchShards();
        console.log('✅ Index Generation Completed.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
