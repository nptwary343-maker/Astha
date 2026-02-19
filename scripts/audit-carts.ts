/**
 * 🕵️ FIRESTORE CART AUDIT SCRIPT
 * ----------------------------
 * Run this to inspect current active carts in your database.
 */

import { adminDb, initAdmin } from '../lib/firebase-admin';

async function auditCarts() {
    initAdmin(); // Initialize Admin SDK

    console.log("🔍 FETCHING_CARTS: Scanning 'carts' collection...");

    try {
        const cartsSnap = await adminDb.collection('carts').get();

        if (cartsSnap.empty) {
            console.log("ℹ️ RESULT: No active carts found in 'carts' collection.");
            return;
        }

        console.log(`📊 FOUND: ${cartsSnap.size} user carts.\n`);

        for (const doc of cartsSnap.docs) {
            const userId = doc.id;
            const meta = doc.data();
            console.log("-----------------------------------------");
            console.log(`👤 User ID: ${userId}`);
            console.log(`🕒 Last Active: ${meta.lastActive || 'N/A'}`);

            // Fetch Sub-collection 'items'
            const itemsSnap = await adminDb.collection('carts').doc(userId).collection('items').get();

            if (itemsSnap.empty) {
                console.log("   [Empty Cart or Logic Gap]");
                continue;
            }

            console.log("🛒 Products:");
            itemsSnap.docs.forEach((itemDoc: any, index: number) => {
                const item = itemDoc.data();
                console.log(`   [${index + 1}] ${item.name}`);
                console.log(`       Qty: ${item.quantity} | Unit: ৳${item.price}`);
                console.log(`       Total: ৳${item.totalPrice}`);
            });
        }

    } catch (error) {
        console.error("❌ AUDIT_ERROR:", error);
    }
}

auditCarts();
