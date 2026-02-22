'use server';

import { db, addDoc, collection, serverTimestamp } from '@/lib/firebase';

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const ADMIN_EMAIL = "nptwary343@gmail.com";

/**
 * 📡 SEND SYSTEM PING
 * Logs a signal to Firestore and optionally sends an email to the admin.
 */
export async function sendSystemPing(type: string, data: any, sendEmail = false) {
    try {
        // 1. Log to Firestore Signal Pulse
        await addDoc(collection(db, 'system_signals'), {
            type,
            data,
            timestamp: serverTimestamp(),
            source: 'system_action'
        });

        // 2. Send Email if requested and configured
        if (sendEmail && EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && EMAILJS_PRIVATE_KEY) {
            console.log(`📧 Attempting to send ${type} email to admin...`);

            const emailData = {
                service_id: EMAILJS_SERVICE_ID,
                template_id: "template_cay76pd",
                user_id: EMAILJS_PUBLIC_KEY,
                accessToken: EMAILJS_PRIVATE_KEY,
                template_params: {
                    to_email: ADMIN_EMAIL,
                    customer_name: "System Pulse",
                    order_id: type,
                    total_price: data.price || "N/A",
                    delivery_address: JSON.stringify(data),
                    status: "PING_ALERT",
                    subject: `🚨 SYSTEM SIGNAL: ${type}`
                }
            };

            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData)
            });
        }

        return { success: true };
    } catch (error) {
        console.error("❌ PING_ERROR:", error);
        return { success: false, error: "Failed to broadcast signal" };
    }
}
