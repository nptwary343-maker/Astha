import { db } from './firebase';
// Step 4b Fix: nodemailer (TCP/SMTP) fully removed — Edge Runtime incompatible.
// Email is handled via Resend API (HTTP) → EmailJS (HTTP) fallback only.

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

interface OrderEmailData {
    orderId: string;
    customerName: string;
    totalPrice: number;
    address: string;
    userEmail: string;
    status: string;
    securityKey?: string;
}

/**
 * 📧 INTELLIGENT MAIL ROUTER (Edge Compatible)
 * Supports: Resend, EmailJS (HTTP based)
 * Removed: Nodemailer (SMTP/TCP not supported on Edge)
 */
export async function sendOrderEmail(data: OrderEmailData) {
    const { orderId, customerName, totalPrice, address, userEmail, status, securityKey } = data;

    let subject = `Order Update: ${orderId}`;
    let htmlBody = getDefaultOrderHtml(data);
    let provider = "auto";

    // DB Fetch for Templates removed for Edge Safety. 
    // TODO: Re-implement using Edge-compatible KV or HTTP API if dynamic templates are needed.

    console.log(`📡 [MAIL] Sending via: ${provider.toUpperCase()}`);

    // --- ROUTING LOGIC ---
    if (provider === 'resend') return await sendViaResend(userEmail, subject, htmlBody);
    if (provider === 'emailjs') return await sendViaEmailJS(data, subject);

    // DEFAULT: AUTO FAILOVER (Resend -> EmailJS)
    return await sendAutoFailover(data, subject, htmlBody);
}

// --- FAILOVER STRATEGY ---
async function sendAutoFailover(data: OrderEmailData, subject: string, html: string) {
    // 1. Try Resend
    const resend = await sendViaResend(data.userEmail, subject, html);
    if (resend.success) return resend;

    // 2. Try EmailJS (Fallback)
    console.warn("⚠️ Resend failed, failing over to EmailJS...");
    const emailjs = await sendViaEmailJS(data, subject);
    if (emailjs.success) return emailjs;

    return { success: false, error: "All providers failed (Resend & EmailJS)" };
}

// --- PROVIDERS ---

async function sendViaResend(to: string, subject: string, html: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) return { success: false, error: "Resend Key Missing" };

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Asthar Hat <orders@astharhat.com>', // Ensure you have a verified domain on Resend
                to: [to],
                subject: subject,
                html: html
            })
        });

        if (res.ok) {
            // await trackMailSuccess('resend'); // Disabled direct DB tracking from Edge
            return { success: true, provider: 'resend' };
        } else {
            const err = await res.text();
            console.warn(`⚠️ Resend Failed: ${err}`);
            return { success: false, error: err };
        }
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

async function sendViaEmailJS(data: OrderEmailData, subject: string) {
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) return { success: false, error: "EmailJS Keys Missing" };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID || "order_confirmation",
                user_id: EMAILJS_PUBLIC_KEY,
                accessToken: EMAILJS_PRIVATE_KEY,
                template_params: {
                    to_email: data.userEmail,
                    customer_name: data.customerName,
                    order_id: data.orderId,
                    total_price: data.totalPrice,
                    delivery_address: data.address,
                    status: data.status,
                    subject: subject
                }
            }),
        });

        if (!response.ok) throw new Error(await response.text());

        // await trackMailSuccess('emailjs');
        return { success: true, provider: 'emailjs' };
    } catch (e: any) {
        // await logFailedEmail(data.orderId, "N/A", e.message);
        console.error("❌ EmailJS Failed:", e.message);
        return { success: false, error: 'EmailJS failed' };
    }
}

// --- UTILS ---

function getDefaultOrderHtml(data: OrderEmailData) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
            <div style="background: #000; color: #fff; padding: 20px; text-align: center;"><h1>Asthar Hat</h1></div>
            <div style="padding: 20px;">
                <h2>Order Update: ${data.orderId}</h2>
                <p>Hello ${data.customerName},</p>
                <p>Status: <strong>${data.status}</strong></p>
                <p>Total: ${data.totalPrice} BDT</p>
                <p>Address: ${data.address}</p>
                <hr/>
                <p style="font-size: 10px; color: #888;">Security Key: ${data.securityKey || 'N/A'}</p>
            </div>
        </div>
    `;
}

// Stub functions for logging - in Edge, we should likely fire-and-forget to a logging endpoint
/*
async function trackMailSuccess(provider: string) {
    // Implementation would need HTTP API, not direct DB
}

async function logFailedEmail(orderId: string, gmailErr: string, fallbackErr: string) {
   // Implementation would need HTTP API, not direct DB
}
*/
