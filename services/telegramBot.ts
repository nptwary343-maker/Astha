import { Telegraf, Scenes, session, Markup, Context } from 'telegraf';
import { db, doc, updateDoc, addDoc, serverTimestamp, collection, getDoc } from '../lib/firebase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (!BOT_TOKEN) {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN is missing in .env");
}

interface MySceneSession extends Scenes.WizardSessionData {
    orderId: string;
    adminMessage: string;
}

interface MyContext extends Context {
    session: Scenes.SceneSession<MySceneSession>;
    scene: Scenes.SceneContextScene<MyContext, MySceneSession>;
    wizard: Scenes.WizardContextWizard<MyContext>;
}

const bot = new Telegraf<MyContext>(BOT_TOKEN || '');

// 🛡️ SECURITY MATCH: Verify Admin ID
bot.use((ctx, next) => {
    if (ctx.from?.id.toString() !== ADMIN_CHAT_ID) {
        console.warn(`🕵️ Unauthorized access attempt by ID: ${ctx.from?.id}`);
        return ctx.reply("🔴 এরর: আপনার এই বট ব্যবহার করার অনুমতি নেই।");
    }
    return next();
});

// 🎭 SCENE: Accept Order Workflow
const acceptWizard = new Scenes.WizardScene<MyContext>(
    'ACCEPT_ORDER_WIZARD',
    async (ctx) => {
        await ctx.reply("📝 গ্রাহকের জন্য একটি কনফার্মেশন মেসেজ লিখুন (এটি গ্রাহকের ড্যাশবোর্ড এ দেখানো হবে):");
        return ctx.wizard.next();
    },
    async (ctx) => {
        const text = (ctx.message as any)?.text;
        if (!text) return ctx.reply("মেসেজটি টেক্সট আকারে দিন।");

        const wordCount = text.trim().split(/\s+/).length;
        if (wordCount <= 4) {
            return ctx.reply('🔴 এরর: আপনার মেসেজটি অবশ্যই ৪ শব্দের বেশি হতে হবে! দয়া করে আবার লিখুন।');
        }

        ctx.scene.session.adminMessage = text;
        await ctx.reply("🔢 এখন ডেলিভারি ম্যানের ৩-ডিজিটের আইডি দিন (যেমন: 102):");
        return ctx.wizard.next();
    },
    async (ctx) => {
        const deliveryId = (ctx.message as any)?.text;
        if (!/^\d{3}$/.test(deliveryId)) {
            return ctx.reply("🔴 এরর: আইডিটি অবশ্যই ৩টি সংখ্যার হতে হবে। আবার ট্রাই করুন:");
        }

        const { orderId, adminMessage } = ctx.scene.session;

        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);

            if (!orderSnap.exists()) {
                await ctx.reply("🔴 অর্ডারটি খুঁজে পাওয়া যায়নি।");
                return ctx.scene.leave();
            }

            const orderData = orderSnap.data();

            // 1. Update Firestore Order Status
            await updateDoc(orderRef, {
                orderStatus: 'Accepted',
                admin_message: adminMessage,
                delivery_boy_id: deliveryId,
                acceptedAt: serverTimestamp()
            });

            // 2. Trigger In-site Notification for User
            if (orderData.userEmail || orderData.customer?.phone) {
                const notifRef = collection(db, 'notifications');
                const paymentMethod = orderData.payment?.method || 'cod';

                const instruction = paymentMethod === 'bkash'
                    ? "আপনার বিকাশ পেমেন্ট ভেরিফাই করা হয়েছে। শীঘ্রই পার্সেলটি হাতে পাবেন।"
                    : "দয়া করে ডেলিভারির সময় ক্যাশ টাকা প্রস্তুত রাখুন।";

                await addDoc(notifRef, {
                    userId: orderData.userEmail || orderData.customer?.phone,
                    orderId: orderId,
                    title: '🚚 আপনার অর্ডারটি গ্রহণ করা হয়েছে!',
                    message: `${adminMessage}\n\n💡 নির্দেশনাবলী: ${instruction}`,
                    type: 'success',
                    icon: '🚚',
                    createdAt: serverTimestamp(),
                    read: false
                });
            }

            await ctx.reply(`✅ অর্ডার #${orderId} সফলভাবে আপডেট করা হয়েছে।\n📍 মেসেজ: ${adminMessage}\n👤 ডেলিভারি বয় আইডি: ${deliveryId}`);
        } catch (err) {
            console.error("FIREBASE_UPDATE_ERROR:", err);
            await ctx.reply("🔴 ডাটাবেস আপডেট করতে সমস্যা হয়েছে।");
        }

        return ctx.scene.leave();
    }
);

const stage = new Scenes.Stage<MyContext>([acceptWizard]);
bot.use(session());
bot.use(stage.middleware());

// ⚡ BOT ACTIONS
bot.command('start', (ctx) => ctx.reply("🚀 Asthar Hat Admin Bot is Active. Waiting for orders..."));

bot.action(/accept_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    ctx.scene.session.orderId = orderId;
    await ctx.answerCbQuery();
    return ctx.scene.enter('ACCEPT_ORDER_WIZARD');
});

bot.action(/reject_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            orderStatus: 'Cancelled',
            cancelledAt: serverTimestamp()
        });
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🔴 অর্ডার #${orderId} বাতিল করা হয়েছে।`);
    } catch (err) {
        await ctx.reply("অর্ডারটি বাতিল করতে সমস্যা হয়েছে।");
    }
});

// 📤 EXPORT: Function to send notification
export const sendOrderToTelegram = async (order: any) => {
    if (!BOT_TOKEN || !ADMIN_CHAT_ID) return;

    const itemsTable = order.items.map((i: any) =>
        `• ${i.name}\n  Qty: ${i.quantity} | Price: ৳${i.total}`
    ).join('\n\n');

    const message = `
🔔 *NEW ORDER FROM ASTHAR HAT*
---------------------------------------
🆔 Order ID: \`${order.orderId}\`

🛒 *Product Details:*
${itemsTable}

💰 *Financial Summary:*
Subtotal: ৳${order.totals.subtotal}
Vat/Tax: ৳${order.totals.tax}
Coupon: -৳${order.totals.couponDiscount}
*Grand Total: ৳${order.totals.total}*

👤 *Customer Info:*
Name: ${order.customer.name}
Phone: ${order.customer.phone}
Address: ${order.customer.address}

💳 *Payment:*
Method: ${order.payment.method.toUpperCase()}
${order.payment.trxId ? `TxnID: \`${order.payment.trxId}\`` : 'Status: Cash on Delivery'}

---------------------------------------
*Process this order?*
`;

    try {
        await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [
                    Markup.button.callback('✅ Accept', `accept_${order.orderId}`),
                    Markup.button.callback('❌ Reject', `reject_${order.orderId}`)
                ]
            ])
        });
    } catch (err) {
        console.error("TELEGRAM_SEND_ERROR:", err);
    }
};

export default bot;
