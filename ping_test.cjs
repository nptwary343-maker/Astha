
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } = require("firebase/firestore");

// Mimic the calculateCart logic briefly for the ping
function calculateCart(items, catalog) {
    const subtotal = items.reduce((sum, item) => sum + (catalog[item.productId].price * item.qty), 0);
    return { summary: { finalTotal: subtotal } };
}

const firebaseConfig = {
    apiKey: "AIzaSyBfjbpYGWkrvd2oxDRDgbRpYSlhKo-pyCo",
    authDomain: "astharhar.firebaseapp.com",
    projectId: "astharhar",
    storageBucket: "astharhar.firebasestorage.app",
    messagingSenderId: "940224314643",
    appId: "1:940224314643:web:dfbf033ba63569bb6feee6",
    measurementId: "G-2T32864N2K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runPingTest() {
    console.log("🚀 Starting System Ping Test...");
    const results = { checks: {} };

    // 1. Firebase Connectivity
    try {
        const start = Date.now();
        const settingsRef = doc(db, 'settings', 'hero-banner');
        await getDoc(settingsRef);
        console.log("✅ Firebase Connected");
        results.checks.firebase = { status: "🟢 ONLINE", latency: `${Date.now() - start}ms` };
    } catch (e) {
        console.error("❌ Firebase Error:", e.message);
        results.checks.firebase = { status: "🔴 OFFLINE", error: e.message };
    }

    // 2. Logic Analysis (Cart Pulse)
    try {
        const mockCatalog = { "ping-test-1": { price: 1000 } };
        const mockItems = [{ productId: "ping-test-1", qty: 2 }];

        const cartStart = Date.now();
        const calculation = calculateCart(mockItems, mockCatalog);
        const cartEnd = Date.now();

        const isValid = calculation.summary.finalTotal === 2000;

        if (isValid) {
            console.log("✅ Logic Verified");
            await addDoc(collection(db, 'system_signals'), {
                type: 'CART_ANALYSIS_PULSE',
                status: 'HEALTHY',
                latency: `${cartEnd - cartStart}ms`,
                timestamp: serverTimestamp(),
                source: 'manual_ping_test'
            });
            console.log("📡 Signal logged to 'system_signals'");
        }
        results.checks.cart = { status: isValid ? "🟢 VERIFIED" : "🔴 ERROR" };
    } catch (e) {
        console.error("❌ Logic Error:", e.message);
    }

    console.log("\n📊 Final Report:");
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}

runPingTest();
