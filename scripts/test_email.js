require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const TO_EMAIL = "astharhat310@gmail.com"; // Testing with own email

async function testResend() {
    console.log("\n🚀 TEST 1: Testing RESEND API...");
    if (!process.env.RESEND_API_KEY) {
        console.log("❌ Resend API Key Missing");
        return;
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Asthar Hat <onboarding@resend.dev>', // Default testing domain
                to: [TO_EMAIL],
                subject: "Resend Test Warning",
                html: "<h1>Resend is Working!</h1>"
            })
        });

        if (res.ok) console.log("✅ Resend Success!");
        else console.log("❌ Resend Failed:", await res.text());
    } catch (e) {
        console.log("❌ Resend Error:", e.message);
    }
}

async function testGmail() {
    console.log("\n📧 TEST 2: Testing GMAIL Sent...");
    if (!process.env.GMAIL_USER_1 || !process.env.GMAIL_PASS_1) {
        console.log("❌ Gmail Creds Missing");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER_1,
                pass: process.env.GMAIL_PASS_1,
            },
        });

        await transporter.sendMail({
            from: `"Asthar Test" <${process.env.GMAIL_USER_1}>`,
            to: TO_EMAIL,
            subject: "Gmail Test",
            html: "<b>Gmail SMTP Working!</b>",
        });
        console.log("✅ Gmail Success!");
    } catch (e) {
        console.log("❌ Gmail Failed:", e.message);
    }
}

async function runTests() {
    console.log("🚦 STARTING EMAIL DIAGNOSTIC...");
    console.log("Target Email:", TO_EMAIL);

    await testResend();
    await testGmail();

    console.log("\n🏁 Diagnostic Complete.");
}

runTests();
