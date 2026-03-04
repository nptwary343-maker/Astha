
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { productName, productCategory, weightOptions } = await req.json();

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            return NextResponse.json({ error: 'AI credentials not configured' }, { status: 500 });
        }

        const prompt = `You are a professional digital marketing expert. Generate a compelling Facebook/Instagram ad copy for this product.
        Product Name: ${productName}
        Category: ${productCategory}
        Weight/Variants: ${weightOptions?.map((o: any) => o.label).join(', ') || 'Standard'}
        
        Requirements:
        1. Write in a mix of Bengali and English (Hinglish/Banglish style) that appeals to Bangladeshi customers.
        2. Use exciting emojis.
        3. Highlight the trust and quality of "Astha".
        4. Include a clear Call to Action.
        
        Respond with ONLY the ad copy text.`;

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a helpful marketing assistant.' },
                        { role: 'user', content: prompt }
                    ]
                }),
            }
        );

        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ adCopy: data.result.response.trim() });
        } else {
            return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
        }

    } catch (error) {
        console.error('Marketing AI Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
