export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { prompt, secret } = await req.json();
        const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

        // 🛡️ SECURITY CHECK
        if (secret !== INTERNAL_SECRET) {
            return NextResponse.json({ error: "Unauthorized access detected." }, { status: 403 });
        }

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Fetch Gemini Config from Firestore
        const settingsRef = doc(db, 'settings', 'gemini_config');
        const geminiSnap = await getDoc(settingsRef);

        let apiKey = process.env.GEMINI_API_KEY; // Default Fallback (SECURED)
        let usedKey = "Env";

        if (geminiSnap.exists()) {
            const g = geminiSnap.data();

            // Logic: Use Failover if 'useFailover' is true, otherwise Primary
            if (g.useFailover && g.failoverKey) {
                apiKey = g.failoverKey;
                usedKey = "Failover";
            } else if (g.primaryKey) {
                apiKey = g.primaryKey;
                usedKey = "Primary";
            }
        }

        if (!apiKey) {
            return NextResponse.json({
                error: "Configuration Error",
                message: "No Gemini API Key found. Please configure it in Settings."
            }, { status: 500 });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use 'gemini-1.5-flash' for faster, smarter JSON handling if available, else standard
        // Note: 'gemini-pro' (1.0) is often stable. Let's stick to standard but prompt for JSON.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Check Mode
        if (prompt.type === 'smartProduct') {
            const { title, category, price } = prompt;

            const smartPrompt = `
            You are an expert SEO E-commerce Assistant.
            
            Task: Analyze this product and provide structured data.
            Product: "${title}"
            Category: "${category}"
            Price: "${price}"

            Please generate a JSON object with the following fields using this EXACT schema:
            {
                "slug": "string (URL-friendly, lowercase, english only, no special chars, max 5-6 words)",
                "description": "string (Compelling, SEO-friendly, sales-focused, paragraphs with unicode support for Bangla if needed)",
                "seoRisk": "string (Analyze keywords in title vs slug vs category. 'Safe' or 'Warning: ...')",
                "metaTitle": "string (SEO Optimized Title)",
                "metaDescription": "string (150-160 chars max)"
            }

            STRICT: Return ONLY the raw JSON string. No markdown formatting like \`\`\`json.
            `;

            const result = await model.generateContent(smartPrompt);
            const response = await result.response;
            let text = response.text();

            // Cleanup standard markdown if AI adds it
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const json = JSON.parse(text);
                return NextResponse.json({ data: json, usedKey });
            } catch (e) {
                // Fallback if JSON parsing fails
                return NextResponse.json({
                    data: { description: text, slug: "", seoRisk: "JSON_PARSE_ERROR" },
                    usedKey
                });
            }
        }

        // Standard Text Mode (Legacy Backwards Compatibility)
        else {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                return NextResponse.json({ text, usedKey });
            } catch (aiError: any) {
                console.error("AI Generation Error:", aiError);

                // Check for Quota Exceeded (429)
                if (aiError.message?.includes('429') || aiError.message?.includes('quota')) {
                    return NextResponse.json({
                        error: "AI_QUOTA_EXCEEDED",
                        message: "Active Gemini Key Quota Exceeded. Please switch to Failover Key in Settings."
                    }, { status: 429 });
                }
                throw aiError;
            }
        }
    } catch (error: any) {
        console.error("General API Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}
