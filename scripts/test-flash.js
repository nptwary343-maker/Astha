
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const path = require('path');

// 💡 INSTRUCTION: Point to your service account key
const serviceAccount = require(path.join(__dirname, '../service-account.json'));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function triggerFlashSalePulse() {
    console.log("🔥 Triggering Flash Sale Start Pulse...");

    const signal = {
        type: 'FLASH_SALE_STARTED',
        data: {
            title: 'MIDNIGHT FEAST: 50% OFF ALL MEAT',
            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        },
        timestamp: FieldValue.serverTimestamp(),
        source: 'admin_manual_test'
    };

    await db.collection('system_signals').add(signal);
    console.log("✅ Flash Sale Signal Sent! Check Front-end Toast.");
    process.exit(0);
}

triggerFlashSalePulse();
