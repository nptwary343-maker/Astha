// import clientPromise from './mongodb-client'; // REMOVED for Edge Compatibility

export class AIConfigManager {
    static async getConfig() {
        // Edge Optimization: Return default config directly since MongoDB is disabled
        return this.getDefaultConfig();
    }

    static getKey(config: any, attempt: number): string {
        if (!config.activeKeys || config.activeKeys.length === 0) {
            return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        }
        return config.activeKeys[attempt % config.activeKeys.length];
    }

    private static getDefaultConfig() {
        return {
            systemInstruction: "You are Daisy, a helpful shopping assistant.",
            activeKeys: [] as string[],
            modelName: "gemini-1.5-flash",
            nsfwFilter: true,
            searchConfig: { provider: "none" }
        };
    }
}
