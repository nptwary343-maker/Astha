export const runtime = 'edge';
import { AIConfigManager } from '@/lib/ai-config-manager';
import AISettingsForm from '@/components/admin/AISettingsForm';
import { WisdomVault } from '@/lib/wisdom-vault';
import { mongoDataApi } from '@/lib/mongo-data-api';

export const dynamic = 'force-dynamic';
export default async function AISettingsPage() {
    const config = await AIConfigManager.getConfig();

    // Fetch all wisdom from DB to show in a list
    const MONGODB_URI = process.env.MONGODB_URI;
    let wisdomEntries: any[] = [];

    if (MONGODB_URI) {
        try {
            const response = await mongoDataApi.find("wisdom_vault", {}, 100);
            wisdomEntries = response?.documents || [];
        } catch (e) {
            console.error("Wisdom fetch failed:", e);
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-800">AI Intelligence Command Center</h1>
                <p className="text-sm text-gray-500 italic">"Technology is just a tool. Wisdom is the hand that guides it."</p>
            </div>

            <AISettingsForm
                initialConfig={JSON.parse(JSON.stringify(config))}
                wisdomEntries={JSON.parse(JSON.stringify(wisdomEntries))}
            />
        </div>
    );
}
