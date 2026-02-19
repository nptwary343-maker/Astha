/**
 * 🕵️‍♂️ PRIVACY FIRST: SHA-256 Hashing for PII (Personal Identifiable Information)
 * লিক প্রিভেনশন: কাস্টমারের ফোন বা ইমেল সরাসরি ফেসবুকে পাঠানো হয় না, হ্যাশ করে পাঠানো হয়।
 */
export async function hashData(data: string | null | undefined): Promise<string> {
    if (!data) return '';
    const msgBuffer = new TextEncoder().encode(data.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ⚡ FACEBOOK CONVERSION API (CAPI) BRIDGE
 * এই মিডল-লেয়ারটি ফায়ারবেস এবং ফেসবুক সার্ভারের মধ্যে দোভাষী হিসেবে কাজ করে।
 */
export async function sendPixelEvent(
    eventName: 'Purchase' | 'Delivery' | 'InitiateCheckout',
    userData: {
        phone?: string;
        email?: string;
        fbId?: string;
        ip?: string;
        userAgent?: string;
    },
    customData: {
        orderId: string;
        value: number;
        currency: string;
        items?: any[];
    },
    eventId: string // 🛡️ ডি-ডুপ্লিকেশনের জন্য বাধ্যতামূলক
) {
    const PIXEL_ID = process.env.FB_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
        console.warn("⚠️ FB_PIXEL_ID or FB_ACCESS_TOKEN missing. Skipping CAPI.");
        return;
    }

    const hashedPhone = await hashData(userData.phone);
    const hashedEmail = await hashData(userData.email);

    const payload = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_id: eventId, // 🛡️ Rule 2: ডি-ডুপ্লিকেশন
            user_data: {
                ph: [hashedPhone], // 🛡️ Rule 3: Privacy First (Hashing)
                em: [hashedEmail],
                client_ip_address: userData.ip,
                client_user_agent: userData.userAgent,
                fbc: userData.fbId,
                fbp: userData.fbId
            },
            custom_data: {
                value: customData.value,
                currency: customData.currency,
                order_id: customData.orderId,
                content_ids: customData.items?.map(i => i.productId) || []
            }
        }]
    };

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();
        console.log(`📡 CAPI_LOG: Sent '${eventName}' for Order ${customData.orderId}`, result);
        return result;
    } catch (error) {
        console.error("❌ CAPI_FAILURE:", error);
    }
}
