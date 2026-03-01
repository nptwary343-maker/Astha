export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 🤖 SAFE AI ASSISTANT BROKER
 * This API acts as an unbreakable bridge for AI requests.
 * 
 * STRATEGY:
 * 1. Primary: Cloudflare Workers AI (Llama 3) via REST API.
 * 2. Fallback: Hardcoded static fallback.
 * 
 * This guarantees the website NEVER breaks even if AI limits are reached.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { systemPrompt, userMessage } = body;

        if (!userMessage) {
            return NextResponse.json({ error: "No message provided." }, { status: 400 });
        }

        const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
        const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
        const CF_GLOBAL_KEY = process.env.CLOUDFLARE_GLOBAL_KEY;

        // --- 1. TRY CLOUDFLARE WORKERS AI ---
        if (CF_ACCOUNT_ID && (CF_API_TOKEN || CF_GLOBAL_KEY)) {
            try {
                const model = '@cf/meta/llama-3-8b-instruct';
                const headers: any = { 'Content-Type': 'application/json' };
                if (CF_API_TOKEN) {
                    headers['Authorization'] = `Bearer ${CF_API_TOKEN}`;
                } else if (CF_GLOBAL_KEY) {
                    headers['X-Auth-Email'] = 'astharhat310@gmail.com';
                    headers['X-Auth-Key'] = CF_GLOBAL_KEY;
                }

                const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: systemPrompt || "You are a helpful assistant for Asthar Hat, an e-commerce platform in Bangladesh." },
                            { role: 'user', content: userMessage }
                        ]
                    })
                });

                if (cfResponse.ok) {
                    const cfData = await cfResponse.json();
                    if (cfData.success && cfData.result && cfData.result.response) {
                        return NextResponse.json({ source: 'cloudflare', reply: cfData.result.response });
                    }
                } else {
                    console.warn(`[AI LIMIT] Cloudflare AI Failed: ${cfResponse.status}. Attempting Fallback...`);
                }
            } catch (err) {
                console.error("[AI ERROR] Cloudflare Request Error:", err);
            }
        }

        // --- 2. THE "INDESTRUCTIBLE" FALLBACK ---
        // If both APIs are exhausted or down, return a polite static response so the UX doesn't crash.
        return NextResponse.json({
            source: 'static_fallback',
            reply: "আপাতত আমাদের সিস্টেম অনেক বেশি রিকোয়েস্ট পাচ্ছে, তাই আমি আপনার প্রশ্নের উত্তর দিতে পারছি না। অনুগ্রহ করে আমাদের হেল্পলাইন নাম্বারে যোগাযোগ করুন বা কিছুক্ষণ পর আবার চেষ্টা করুন। ধন্যবাদ!"
        });

    } catch (globalError: any) {
        // Last line of defense against 500 server errors
        console.error("[FATAL AI ERROR]", globalError);
        return NextResponse.json({
            source: 'fatal_catch',
            reply: "সিস্টেমে সাময়িক সমস্যা হচ্ছে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।"
        }, { status: 200 }); // Return 200 so the front-end doesn't crash on parse!
    }
}
