// import clientPromise from "./mongodb-client"; // REMOVED for Edge Compatibility

interface AIInteractionData {
    message: string;
    reply: string;
    type: 'chat' | 'chart' | 'image' | string;
    userId?: string;
    timestamp: Date;
    metadata?: any;
}

/**
 * 📊 EDGE COMPATIBLE LOGGER
 * Logs AI interactions to Cloudflare Logs (Console)
 * MongoDB Direct Write removed to prevent Edge Runtime crashes.
 */
export async function logAIInteraction(data: AIInteractionData) {
    try {
        const logEntry = {
            level: 'INFO',
            event: 'AI_INTERACTION',
            timestamp: data.timestamp.toISOString(),
            userId: data.userId || 'anonymous',
            type: data.type,
            action: getActionFromMessage(data.message),
            metadata: data.metadata || {},
            // We log the visual structure but keep sensitive text out if needed, 
            // but for debugging we'll keep it standard.
            interaction: {
                user: data.message,
                ai: data.reply.substring(0, 100) + "..." // Truncate for logs
            }
        };

        // Cloudflare/Vercel Logs capture stdout
        console.log(JSON.stringify(logEntry));

    } catch (error) {
        console.error("Failed to log AI interaction:", error);
    }
}

// Helper to categorize user intent for analytics
function getActionFromMessage(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('price') || lower.includes('dam') || lower.includes('koto')) return 'price_check';
    if (lower.includes('buy') || lower.includes('kinbo') || lower.includes('cart')) return 'purchase_intent';
    if (lower.includes('chart') || lower.includes('stats')) return 'analytics_request';
    if (lower.includes('search') || lower.includes('find')) return 'search';
    return 'general_chat';
}

export async function getAIStats() {
    // Stub for Edge - Retrieve via Analytics API if needed
    return [];
}
