import { NextResponse } from 'next/server';
// import bot from '@/services/telegramBot';


export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
        const configuredToken = process.env.TELEGRAM_SECRET_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

        // Security Check (Optional but recommended by Telegram)
        if (configuredToken && secretToken !== configuredToken && secretToken !== process.env.TELEGRAM_BOT_TOKEN) {
            // For strict webhook security
            // console.warn("Unauthorized webhook request");
            // return new NextResponse('Unauthorized', { status: 401 });
        }

        const update = await req.json();

        // Dynamic import to avoid build-time issues with telegraf
        const { default: botInstance } = await import('@/services/telegramBot');

        // Let Telegraf handle the update
        await botInstance.handleUpdate(update);


        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error("WEBHOOK_ERROR:", error);
        return new NextResponse('Error handling update', { status: 500 });
    }
}

// Endpoint to manually set the webhook (optional convenience)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('url');

    if (!domain) {
        return new NextResponse("Please provide a domain using ?url=https://your-domain.com", { status: 400 });
    }

    try {
        const webhookUrl = `${domain.replace(/\/$/, '')}/api/telegram-webhook`;

        const { default: botInstance } = await import('@/services/telegramBot');

        // Setup Webhook with secret token for extra security
        await botInstance.telegram.setWebhook(webhookUrl, {
            secret_token: process.env.TELEGRAM_BOT_TOKEN
        });


        return NextResponse.json({
            success: true,
            message: `Webhook successfully set to: ${webhookUrl}`
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
