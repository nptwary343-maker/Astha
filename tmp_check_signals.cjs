
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, orderBy, limit, getDocs } = require("firebase/firestore");

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

async function checkSignals() {
    console.log("🔍 Fetching Recent System Signals...");
    try {
        const q = query(collection(db, 'system_signals'), orderBy('timestamp', 'desc'), limit(5));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("⚠️ No signals found.");
            process.exit(0);
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📡 [${data.type}] Status: ${data.status} | Latency: ${data.latency} | Source: ${data.source || 'untracked'}`);
        });
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
}

checkSignals();
