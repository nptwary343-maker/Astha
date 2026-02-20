export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Client SDK for DB updates (works in server actions too if rules allow, but ideally use Admin SDK for unrestricted access)
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
// Note: Real FCM sending requires firebase-admin. Since we are in an Edge/Node environment without the full Admin SDK setup in this file (simulated for now), 
// we will implement the LOIGC structure. In a real deployment, import 'firebase-admin' initialized with service-account.

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, actionBy, actionByRole, actionByPhone, method, secret } = body;
        const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

        // 🛡️ SECURITY CHECK
        if (secret !== INTERNAL_SECRET) {
            console.error("🚨 UNAUTHORIZED_PAYMENT_VERIFICATION_ATTEMPT");
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 1. ROLE CHECK (Secondary Guard)
        // Check if the user trying to verify is actually an Admin or Delivery Man
        // In a real production app, verify the 'Authorization' header ID Token via Admin SDK.
        // For this implementation, we trust the payload IF logic checks out (Zero Trust implies verifying the source).

        if (!['admin', 'super_admin', 'delivery_man'].includes(actionByRole)) {
            return NextResponse.json({ error: "Unauthorized: Invalid Role" }, { status: 403 });
        }

        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const orderData = orderSnap.data();

        // 2. FETCH TEMPLATE
        // Determine which template to use
        let templateTitle = '';
        if (actionByRole === 'delivery_man') {
            templateTitle = 'Delivery_Confirm'; // e.g. "Your order is confirmed by Delivery Man..."
        } else {
            templateTitle = 'Admin_Confirm'; // e.g. "Payment received via bKash..."
        }

        // Fetch Template from Firestore
        const templatesQuery = query(collection(db, 'message_templates'), where('title', '==', templateTitle));
        const templateSnap = await getDocs(templatesQuery);

        let messageBody = "Your order payment has been verified. Thank you!";
        if (!templateSnap.empty) {
            messageBody = templateSnap.docs[0].data().body;
        }

        // 3. DYNAMIC VARIABLE REPLACEMENT
        const variables = {
            '{{name}}': orderData.customer?.name || 'Customer',
            '{{total_money}}': `৳${orderData.totals?.total}`,
            '{{order_id}}': orderId.slice(0, 6),
            '{{processor_name}}': actionBy,
            '{{dm_phone}}': actionByPhone || 'Hotline',
            // Enhanced cart details with line breaks for better readability
            '{{cart_details}}': orderData.items?.map((i: any) => `${i.qty}x ${i.name}`).join('\n') || 'Items',
            '{{address_full}}': orderData.customer?.address || 'No Address',
            '{{customer_phone}}': orderData.customer?.phone || 'No Phone',
            '{{delivery_fee}}': `৳${orderData.totals?.tax || 0}`, // Assuming tax field might be used for delivery in this context, or 0 if not separate
            '{{subtotal}}': `৳${orderData.totals?.subtotal}`
        };

        let finalMessage = messageBody;
        Object.entries(variables).forEach(([key, value]) => {
            finalMessage = finalMessage.replace(new RegExp(key, 'g'), value);
        });

        // 4. UPDATE ORDER STATUS
        await updateDoc(orderRef, {
            'payment.status': 'Paid',
            'payment.method': method || orderData.payment?.method,
            'payment.verifiedBy': actionBy,
            'payment.verifiedAt': new Date().toISOString(),
            orderStatus: actionByRole === 'delivery_man' ? 'Delivered' : 'Processing' // If DM verifies, it's usually delivered
        });

        // 5. SEND NOTIFICATION (Simulated Log)
        console.log(`[FCM] Sending to ${orderData.fcmToken}: ${finalMessage}`);

        // TODO: Call actual FCM send here using Admin SDK
        // await admin.messaging().send({ token: orderData.fcmToken, notification: { title: 'Payment Verified', body: finalMessage } });

        return NextResponse.json({ success: true, message: finalMessage });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
