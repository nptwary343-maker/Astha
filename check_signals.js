
import { db } from './lib/firebase.js';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

async function checkSignals() {
    console.log("🔍 Checking System Signals...");
    try {
        const q = query(collection(db, 'system_signals'), orderBy('timestamp', 'desc'), limit(5));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("⚠️ No signals found in 'system_signals' collection.");
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📡 Signal: ${data.type} | Status: ${data.status} | Latency: ${data.latency} | Time: ${data.timestamp?.toDate().toLocaleString()}`);
        });
        console.log("✅ Signal check complete.");
    } catch (e) {
        console.error("❌ Error checking signals:", e);
    }
}

checkSignals();
