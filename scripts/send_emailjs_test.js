// EmailJS Test Sender
const fs = require('fs');
const https = require('https');

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
                // Remove quotes
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                env[key] = val;
            }
        });
        return env;
    } catch (e) { return {}; }
}

const env = loadEnv();
const EMAILJS_PUBLIC_KEY = env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = env.EMAILJS_PRIVATE_KEY;
const EMAILJS_SERVICE_ID = env.EMAILJS_SERVICE_ID;
const TARGET_EMAIL = "nptwary343@gmail.com";

async function sendEmailJs() {
    console.log(`🔄 Sending Test Email via EMAILJS...`);
    console.log(`🎯 To: ${TARGET_EMAIL}`);

    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
        console.log("❌ EmailJS Keys Missing!");
        return;
    }

    const data = JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: "template_cay76pd", // Updated Template ID
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
            to_email: TARGET_EMAIL,
            customer_name: "Test Customer",
            order_id: "EMAILJS_TEST_001",
            total_price: "1500",
            delivery_address: "Dhaka, Bangladesh",
            status: "Testing",
            subject: "EmailJS Test Confirmation"
        }
    });

    const options = {
        hostname: 'api.emailjs.com',
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log("✅ EmailJS SENT SUCCESSFULLY!");
            } else {
                console.log(`❌ EmailJS FAILED (${res.statusCode}):`, body);
                console.log("ℹ️ Note: If template ID is wrong, create 'order_confirmation' in EmailJS dashboard.");
            }
        });
    });

    req.on('error', (e) => {
        console.error("❌ Network Error:", e.message);
    });

    req.write(data);
    req.end();
}

sendEmailJs();
