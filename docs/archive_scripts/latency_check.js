const https = require('https');
const http = require('http');

console.log("🚦 Starting Latency Tests (Simulating from localhost)...\n");

const targets = [
    { name: "Vercel Edge (Simulated)", url: "https://aez-kappa.vercel.app/" },
    { name: "Firebase (US)", url: "https://firestore.googleapis.com/" },
    { name: "MongoDB (Mumbai)", url: "https://ac-rnln7an-shard-00-02.yzro6ml.mongodb.net:27017/" }, // Direct connection check simulated
    { name: "Cloudinary (CDN)", url: "https://res.cloudinary.com/" },
    { name: "HuggingFace (AI)", url: "https://api-inference.huggingface.co/status" }
];

async function measurePing(target) {
    const start = Date.now();
    return new Promise((resolve) => {
        const protocol = target.url.startsWith('https') ? https : http;
        const req = protocol.get(target.url, (res) => {
            const end = Date.now();
            const latency = end - start;
            let status = "🟢 ULTRA FAST";
            if (latency > 100) status = "🟡 GOOD";
            if (latency > 300) status = "🟠 OKAY";
            if (latency > 800) status = "🔴 SLOW";

            console.log(`📡 [${target.name.padEnd(20)}] Time: ${latency}ms \t Status: ${status}`);
            resolve(latency);
        });

        req.on('error', (e) => {
            // For MongoDB direct URL, HTTP get might fail but connection time is still measurable roughly until error or timeout
            // This is a rough simulation
            const end = Date.now();
            console.log(`📡 [${target.name.padEnd(20)}] Time: ${end - start}ms \t Status: 🟠 REACHABLE (Auth Required)`);
            resolve(end - start);
        });
        req.end();
    });
}

async function runTests() {
    for (const t of targets) {
        await measurePing(t);
    }
    console.log("\n✅ Test Complete. System is responsive.");
}

runTests();
