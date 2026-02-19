
const fs = require('fs');
const path = require('path');

try {
    const saPath = path.join(process.cwd(), 'service-account.json');
    console.log("📂 Reading:", saPath);

    if (!fs.existsSync(saPath)) {
        console.error("❌ File not found!");
        process.exit(1);
    }

    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    let key = sa.private_key;

    console.log("----- ORIGINAL (Snippet) -----");
    console.log(JSON.stringify(key.substring(0, 50)));

    // Apply the logic from lib/firebase-admin.ts
    key = key.replace(/\\n/g, '\n');
    if (key.includes('\\r')) key = key.replace(/\\r/g, '');

    console.log("\n----- PROCESSED (Snippet) -----");
    console.log(JSON.stringify(key.substring(0, 50)));

    console.log("\n----- CHECKING LINE BREAKS -----");
    const lines = key.split('\n');
    console.log(`Total Lines: ${lines.length}`);
    console.log(`Header: ${lines[0]}`);
    console.log(`Line 2 (Length): ${lines[1]?.length}`);

    if (lines[0].trim() !== '-----BEGIN PRIVATE KEY-----') {
        console.error("❌ INVALID HEADER:", lines[0]);
    } else {
        console.log("✅ Header looks correct.");
    }

    console.log("\n----- TESTING ADMIN SDK PARSE -----");
    const admin = require('firebase-admin');
    try {
        const cert = admin.credential.cert({
            projectId: sa.project_id,
            clientEmail: sa.client_email,
            privateKey: key
        });
        console.log("✅ SDK ACCEPTED the key! (Cert object created)");
    } catch (certError) {
        console.error("❌ SDK REJECTED the key:", (certError as any).message);
    }

} catch (e) {
    console.error("CRASH:", e);
}
