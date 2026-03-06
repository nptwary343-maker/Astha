
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { productName, productDescription, availableCategories } = await req.json();

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiEmail = process.env.CLOUDFLARE_API_TOKEN; // Actually the API Token

        if (!accountId || !apiEmail) {
            return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
        }

        // System prompt for categorization
        const prompt = `You are an expert e-commerce catalog manager. 
        Categorize the following product into exactly ONE of these categories: [${availableCategories.join(', ')}].
        Product Name: ${productName}
        Product Description: ${productDescription || 'N/A'}
        
        Respond with ONLY the category name. If unsure, pick the closest match.`;

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiEmail}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that categorizes products.' },
                        { role: 'user', content: prompt }
                    ]
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('AI API failed:', errText);
            return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
        }

        const data = await response.json();

        if (data.success) {
            const predictedCategory = data.result.response.trim().replace(/[".]/g, '');
            return NextResponse.json({ category: predictedCategory });
        } else {
            return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
        }

    } catch (error) {
        console.error('AI Categorization Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
