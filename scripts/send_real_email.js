const nodemailer = require('nodemailer');

// Load Env from .env.local manually
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
const GMAIL_USER = env.GMAIL_USER_1;
const GMAIL_PASS = env.GMAIL_PASS_1;
const TARGET_EMAIL = "nptwary343@gmail.com";

async function sendTest() {
    console.log(`📧 Sending Test Email to: ${TARGET_EMAIL}`);
    console.log(`🔄 Using: Gmail (${GMAIL_USER})`);

    if (!GMAIL_USER || !GMAIL_PASS) {
        console.log("❌ Gmail Credentials Missing within script!");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: GMAIL_USER, pass: GMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Asthar Hat Admin" <${GMAIL_USER}>`,
            to: TARGET_EMAIL,
            subject: "Order Confirmation #TEST_123",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
                    <div style="background: #000; color: #fff; padding: 20px; text-align: center;"><h1>Asthar Hat</h1></div>
                    <div style="padding: 20px;">
                        <h2>Order Confirmed: #TEST_123</h2>
                        <p>Hello <strong>Valued Customer</strong>,</p>
                        <p>Thank you for your order! This implies your email system is 100% functional.</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <p><strong>Total:</strong> 1250 BDT</p>
                            <p><strong>Status:</strong> Processing</p>
                        </div>
                        <p>Regards,<br>Asthar Hat Team</p>
                    </div>
                </div>
            `,
        });

        console.log("✅ Email Sent Successfully via Gmail!");
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

sendTest();
