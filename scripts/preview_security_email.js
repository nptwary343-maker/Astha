const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

// Load Env
const fs = require('fs');
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
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                env[key] = val;
            }
        });
        return env;
    } catch (e) { return {}; }
}
const env = loadEnv();

// Config
const uri = "mongodb+srv://aidadmin:Bangladesh247152%40@cluster0.yzro6ml.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function sendPreview() {
    try {
        await client.connect();
        const db = client.db('astharhat_analytics');

        // 1. Fetch the Template we just saved
        const template = await db.collection('email_templates').findOne({ name: 'order_update' });

        if (!template) {
            console.log("❌ Template not found!");
            return;
        }

        // 2. Prepare Dummy Data
        const orderId = "AH-DEMO-7721";
        const securityKey = "SECURE-XA90";

        // 3. Render HTML
        let html = template.body
            .replace('{{customerName}}', "Valued Customer")
            .replace('{{orderId}}', orderId)
            .replace('{{orderId}}', orderId) // Replace twice if needed
            .replace('{{totalPrice}}', "2550")
            .replace('{{address}}', "Gulshan 1, Dhaka")
            .replace('{{status}}', "Confirmed")
            .replace('{{securityKey}}', securityKey);

        // 4. Send via Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: env.GMAIL_USER_1, pass: env.GMAIL_PASS_1 },
        });

        console.log("📧 Sending Security Preview...");
        await transporter.sendMail({
            from: `"Asthar Security" <${env.GMAIL_USER_1}>`,
            to: "nptwary343@gmail.com",
            subject: template.subject.replace('{{orderId}}', orderId).replace('{{securityKey}}', securityKey),
            html: html,
        });

        console.log("✅ Preview Sent! Check Inbox for the 'Secret Key' box.");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

sendPreview();
