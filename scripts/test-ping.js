
/**
 * 🧪 SYSTEM PING TESTER
 * Run this script to simulate an admin ping and see if the frontend reflects it.
 */
async function triggerPing() {
    const SECRET = 'ah_prod_secure_2026_x86_z';
    const BASE_URL = 'http://localhost:3000'; // Adjust if running elsewhere

    console.log("📡 Triggering System Ping...");

    try {
        const res = await fetch(`${BASE_URL}/api/availability-ping`, {
            headers: {
                'Authorization': `Bearer ${SECRET}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log("✅ Ping Successful!");
            console.log("Signal Logged:", data.checks.cart_analysis.status);
        } else {
            console.error("❌ Ping Failed:", await res.text());
        }
    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

triggerPing();
