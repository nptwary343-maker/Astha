import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Mock Telegram Bot Service to bypass telegraf build issues
export const sendOrderToTelegram = async (order: any) => {
    console.log("Mock: Sending order to Telegram", order.orderId);

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

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
        // Use Fetch instead of Telegraf for building
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Accept', callback_data: `accept_${order.orderId}` },
                            { text: '❌ Reject', callback_data: `reject_${order.orderId}` }
                        ]
                    ]
                }
            })
        });
    } catch (err) {
        console.error("TELEGRAM_FETCH_ERROR:", err);
    }
};

const sendTelegramApi = async (method: string, payload: any) => {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) return;
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error(`Telegram API Error (${method}):`, error);
    }
};

const mockBot = {
    handleUpdate: async (update: any) => {
        console.log("Handling Webhook Update", JSON.stringify(update, null, 2));

        if (update.callback_query) {
            const callbackQuery = update.callback_query;
            const data = callbackQuery.data as string;
            const chatId = callbackQuery.message?.chat?.id;
            const messageId = callbackQuery.message?.message_id;
            const text = callbackQuery.message?.text || "Order Data";

            if (!data || !chatId || !messageId) {
                return;
            }

            try {
                if (data.startsWith('accept_') || data.startsWith('reject_')) {
                    const action = data.split('_')[0]; // 'accept' or 'reject'
                    const orderId = data.split('_')[1];

                    // 1. Acknowledge callback query
                    await sendTelegramApi('answerCallbackQuery', {
                        callback_query_id: callbackQuery.id,
                        text: `Executing ${action.toUpperCase()} for Order ${orderId}...`,
                    });

                    // 2. Update Firebase automatically for Order Status
                    const orderRef = doc(db, "orders", orderId);
                    const newStatus = action === 'accept' ? 'Processing' : 'Cancelled';
                    const adminName = callbackQuery.from?.first_name || callbackQuery.from?.username || 'Unknown Admin';
                    const adminUsername = callbackQuery.from?.username ? `(@${callbackQuery.from.username})` : '';

                    await updateDoc(orderRef, {
                        orderStatus: newStatus,
                        status: newStatus,
                        updatedAt: serverTimestamp(),
                        logs: [
                            {
                                status: newStatus,
                                timestamp: new Date().toISOString(),
                                note: `Order ${newStatus} via Telegram Bot by ${adminName} ${adminUsername}`
                            }
                        ]
                    });

                    // 3. Update the original message
                    const statusText = action === 'accept' ? '✅ *ACCEPTED*' : '❌ *REJECTED*';
                    const lines = text.split('\n');
                    const updatedText = lines.slice(0, -1).join('\n') + `\n---------------------------------------\nStatus: ${statusText} by *${adminName}* ${adminUsername}`;

                    await sendTelegramApi('editMessageText', {
                        chat_id: chatId,
                        message_id: messageId,
                        text: updatedText,
                        parse_mode: 'Markdown'
                    });

                    // 4. Send a distinct new message to notify everyone (since edits don't trigger push notifications)
                    const actionEmoji = action === 'accept' ? '✅' : '❌';
                    const actionWord = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
                    const notifyText = `${actionEmoji} *Order \`${orderId}\`* has been *${actionWord}* by ${adminName} ${adminUsername}`;

                    await sendTelegramApi('sendMessage', {
                        chat_id: chatId,
                        text: notifyText,
                        parse_mode: 'Markdown',
                        reply_to_message_id: messageId
                    });

                }
            } catch (error) {
                console.error("Error processing callback query:", error);
                await sendTelegramApi('answerCallbackQuery', {
                    callback_query_id: callbackQuery.id,
                    text: 'Error processing request!',
                    show_alert: true
                });
            }
        } else if (update.message && update.message.text) {
            const text = update.message.text.trim();
            const chatId = update.message.chat.id;

            if (text === '/start' || text === '/help') {
                const instructionsBn = `
🤖 *অ্যাস্থাহাট অ্যাডমিন গাইড: টেলিগ্রাম বট*

এই বটটি আপনার ওয়েবসাইটের ডেটাবেসের একটি রিমোট কন্ট্রোল হিসেবে কাজ করে।

*কীভাবে কাজ করে?*
১. যখন কেউ ওয়েবসাইটে অর্ডার করবে, আপনি এখানে একটি মেসেজ পাবেন।
২. মেসেজে অর্ডারের বিস্তারিত ও নিচে দুটি বাটন থাকবে: [ ✅ Accept ] এবং [ ❌ Reject ]

*✅ Accept (অর্ডার গ্রহণ):*
যদি পেমেন্ট বা কনফার্মেশন ঠিক থাকে, Accept এ ক্লিক করুন। 
আপনার ওয়েবসাইটের ডেটাবেসে অর্ডারটি স্বয়ংক্রিয়ভাবে *'Processing'* হয়ে যাবে!

*❌ Reject (অর্ডার বাতিল):*
যদি ভুয়া অর্ডার হয় বা স্টক না থাকে, Reject এ ক্লিক করুন। 
ডেটাবেসে অর্ডারটি স্বয়ংক্রিয়ভাবে *'Cancelled'* হয়ে যাবে।

*💳 পেমেন্ট স্ট্যাটাস (গুরুত্বপূর্ণ):*
টেলিগ্রাম থেকে Accept/Reject করলে শুধু "অর্ডার স্ট্যাটাস" পরিবর্তন হবে। কিন্তু *পেমেন্ট স্ট্যাটাস* (Paid/Unpaid) স্বয়ংক্রিয়ভাবে পাল্টাবে না। পেমেন্ট আপডেট করার জন্য আপনাকে ওয়েবসাইটের অ্যাডমিন প্যানেল থেকে ম্যানুয়ালি আপডেট করে দিতে হবে।

*⚠️ সতর্কতা:*
বাটনগুলো শুধু একবার কাজ করবে! ক্লিক করার পর বাটন মুছে যাবে যাতে দ্বিতীয়বার ক্লিক না পড়ে।
                `;

                await sendTelegramApi('sendMessage', {
                    chat_id: chatId,
                    text: instructionsBn.trim(),
                    parse_mode: 'Markdown'
                });
            }
        }
    },
    telegram: {
        setWebhook: async (url: string, opts: any) => {
            await sendTelegramApi('setWebhook', {
                url,
                secret_token: opts.secret_token
            });
            console.log("Mock: Setting webhook", url);
        }
    }
};

export default mockBot;
