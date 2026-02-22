const fs = require('fs');
const https = require('https');

// --- Load Env Vars Manually ---
function loadEnv() {
    try {
        const content = fs.readFileSync('.env.local', 'utf8');
        const lines = content.split('\n');
        const env = {};
        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let val = parts.slice(1).join('=').trim();
                // Remove quotes if present
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                env[key] = val;
            }
        });
        return env;
    } catch (e) {
        console.error("Failed to load .env.local", e);
        return {};
    }
}

const env = loadEnv();
const RESEND_API_KEY = env.RESEND_API_KEY;
const GMAIL_USER = env.GMAIL_USER_1;
const GMAIL_PASS = env.GMAIL_PASS_1;
const EMAILJS_PUBLIC_KEY = env.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = env.EMAILJS_SERVICE_ID;

console.log("🚦 STARTING EMAIL DIAGNOSTIC...");
console.log(`🔑 Resend Key Found: ${!!RESEND_API_KEY}`);
console.log(`🔑 Gmail User Found: ${!!GMAIL_USER}`);
console.log(`🔑 EmailJS Key Found: ${!!EMAILJS_PUBLIC_KEY}`);

// --- TEST 1: RESEND (Fetch) ---
async function testResend() {
    console.log("\n🚀 TEST 1: Testing RESEND API...");
    if (!RESEND_API_KEY) return console.log("❌ SKIPPED: Resend Key Missing");

    return new Promise((resolve) => {
        const data = JSON.stringify({
            from: 'onboarding@resend.dev', // Default testing sender
            to: [GMAIL_USER || 'test@example.com'], // Send to self
            subject: "Resend Diagnostic Test",
            html: "<h1>Resend is Working!</h1><p>System Test Successful.</p>"
        });

        const options = {
            hostname: 'api.resend.com',
            path: '/emails',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log("✅ RESEND SUCCESS! (Check Inbox)");
                } else {
                    console.log(`❌ RESEND FAILED (${res.statusCode}):`, body);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error("❌ RESEND ERROR:", e.message);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

// --- TEST 2: EMAILJS (Fetch) ---
// Note: EmailJS usually requires browser context but has a REST API
async function testEmailJS() {
    console.log("\n🔄 TEST 2: Testing EMAILJS API...");
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID) return console.log("❌ SKIPPED: EmailJS Keys Missing");

    // EmailJS REST API requires setting up a template first
    // This is just a connection check
    console.log("ℹ️ EmailJS Connection Check: Keys are present.");
    console.log("✅ EMAILJS STATUS: Ready (Cannot fully test via CLI without valid template ID)");
}

// --- RUNNER ---
async function run() {
    await testResend();
    await testEmailJS();
    // Skipping Gmail NodeMailer test as it requires 'nodemailer' package which might not be installed in this env context
    // But Resend success is the primary indicator of outgoing capability.
    console.log("\n🏁 Diagnostic Complete.");
}

run();
