
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

const mockBot = {
    handleUpdate: async (update: any) => {
        console.log("Mock: Handling update", update);
    },
    telegram: {
        setWebhook: async (url: string, opts: any) => {
            console.log("Mock: Setting webhook", url);
        }
    }
};

export default mockBot;
