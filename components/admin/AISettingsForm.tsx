'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    Brain,
    Search,
    ShieldAlert,
    Sparkles,
    Plus,
    Trash2,
    CheckCircle2,
    RotateCcw,
    Key,
    MessageSquare,
    Eye
} from 'lucide-react';
import { updateAIConfig, addWisdomEntry } from '../../lib/actions/ai-settings';

interface AISettingsFormProps {
    initialConfig: any;
    wisdomEntries: any[];
}

export default function AISettingsForm({ initialConfig, wisdomEntries }: AISettingsFormProps) {
    const [activeTab, setActiveTab] = useState('core');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const tabs = [
        { id: 'core', name: 'AI Core', icon: Brain },
        { id: 'search', name: 'Search Service', icon: Search },
        { id: 'wisdom', name: 'Wisdom Vault', icon: Sparkles },
        { id: 'security', name: 'Security & Safety', icon: ShieldAlert },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus('idle');

        const formData = new FormData(e.currentTarget);
        const result = await updateAIConfig(formData);

        if (result.success) {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } else {
            setSaveStatus('error');
        }
        setIsSaving(false);
    };

    const handleWisdomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const result = await addWisdomEntry(formData);
        if (result.success) {
            setSaveStatus('success');
            (e.target as HTMLFormElement).reset();
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-medium'
                            : 'text-gray-500 hover:bg-white hover:text-blue-600'
                            }`}
                    >
                        <tab.icon size={20} />
                        <span>{tab.name}</span>
                    </button>
                ))}

                <div className="mt-auto pt-10 px-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                            <RotateCcw size={14} />
                            Vercel Warmth
                        </div>
                        <p className="text-[10px] text-blue-600 leading-relaxed italic">
                            Config changes might take up to 5 minutes to propagate across all edge regions due to hot-RAM caching.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-10 relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'core' && (
                        <motion.form
                            key="core"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Brain className="text-blue-600" />
                                    AI Brain Configuration
                                </h2>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <RotateCcw className="animate-spin" size={18} /> : <Save size={18} />}
                                    {saveStatus === 'success' ? 'Saved!' : 'Save Controls'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MessageSquare size={16} className="text-blue-500" />
                                        Primary System Persona (Master Instruction)
                                    </label>
                                    <textarea
                                        name="systemInstruction"
                                        defaultValue={initialConfig.systemInstruction}
                                        rows={8}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed"
                                        placeholder="Enter the base personality for Daisy Pro..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Key size={16} className="text-orange-500" />
                                            Active Key Rotation (Comma Separated)
                                        </label>
                                        <input
                                            name="activeKeys"
                                            defaultValue={initialConfig.activeKeys?.join(', ')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="AIZA..., AIZA..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Sparkles size={16} className="text-purple-500" />
                                            Model Family
                                        </label>
                                        <select
                                            name="modelName"
                                            defaultValue={initialConfig.modelName}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Performance)</option>
                                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                                            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Hidden fields for other tabs' state if needed, but easier to use one huge form or individual saves. Let's keep one form per tab for UX. */}
                            <input type="hidden" name="searchProvider" value={initialConfig.searchConfig?.provider} />
                            <input type="hidden" name="tavilyKey" value={initialConfig.searchConfig?.tavilyKey} />
                            <input type="hidden" name="serperKey" value={initialConfig.searchConfig?.serperKey} />
                            <input type="hidden" name="nsfwFilter" value={initialConfig.nsfwFilter ? 'on' : 'off'} />
                        </motion.form>
                    )}

                    {activeTab === 'search' && (
                        <motion.form
                            key="search"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Search className="text-green-600" />
                                    Web Search Grounding
                                </h2>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all"
                                >
                                    {isSaving ? <RotateCcw className="animate-spin" size={18} /> : <Save size={18} />}
                                    Update Providers
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'tavily', name: 'Tavily AI', color: 'blue' },
                                    { id: 'serper', name: 'Serper.dev', color: 'red' },
                                    { id: 'google-native', name: 'Google Native', color: 'green' },
                                    { id: 'none', name: 'None (Local)', color: 'gray' },
                                ].map((p) => (
                                    <label key={p.id} className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="searchProvider"
                                            value={p.id}
                                            defaultChecked={initialConfig.searchConfig?.provider === p.id}
                                            className="peer sr-only"
                                        />
                                        <div className="p-4 border-2 border-gray-100 rounded-2xl peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all text-center">
                                            <span className="font-bold text-sm block mb-1">{p.name}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{p.id}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tavily API Key</label>
                                    <input
                                        type="password"
                                        name="tavilyKey"
                                        defaultValue={initialConfig.searchConfig?.tavilyKey}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Serper API Key</label>
                                    <input
                                        type="password"
                                        name="serperKey"
                                        defaultValue={initialConfig.searchConfig?.serperKey}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <input type="hidden" name="systemInstruction" value={initialConfig.systemInstruction} />
                            <input type="hidden" name="activeKeys" value={initialConfig.activeKeys?.join(',')} />
                            <input type="hidden" name="modelName" value={initialConfig.modelName} />
                        </motion.form>
                    )}

                    {activeTab === 'wisdom' && (
                        <div key="wisdom" className="space-y-8 h-full flex flex-col">
                            <div className="flex items-center justify-between border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Sparkles className="text-purple-600" />
                                    The Wisdom Vault (Joss Quotes)
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full">
                                {/* Form: Add Wisdom */}
                                <form onSubmit={handleWisdomSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 h-fit">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                        <Plus className="text-blue-600" size={18} />
                                        Inject New Wisdom
                                    </h3>
                                    <div>
                                        <select name="category" className="w-full px-4 py-2 bg-white border rounded-xl outline-none font-medium">
                                            <option value="Agriculture">Agriculture</option>
                                            <option value="Commerce">Commerce</option>
                                            <option value="Life">Life Philosophy</option>
                                            <option value="General">General Wisdom</option>
                                        </select>
                                    </div>
                                    <textarea name="philosophy" placeholder="Core Philosophy (The Soul)..." rows={2} className="w-full px-4 py-3 bg-white border rounded-xl outline-none text-sm" required />
                                    <textarea name="insight" placeholder="Deep Insight (The Logic)..." rows={2} className="w-full px-4 py-3 bg-white border rounded-xl outline-none text-sm" required />
                                    <input name="hook" placeholder="Conversation Hook..." className="w-full px-4 py-3 bg-white border rounded-xl outline-none text-sm" required />
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <RotateCcw className="animate-spin" size={18} /> : <span>Manifest Wisdom</span>}
                                    </button>
                                </form>

                                {/* List: Existing Wisdom */}
                                <div className="lg:col-span-2 space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {wisdomEntries.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                            <Sparkles size={40} className="mb-4 opacity-20" />
                                            <p className="italic">No wisdom entries found in MongoDB.</p>
                                        </div>
                                    ) : (
                                        wisdomEntries.map((w) => (
                                            <div key={w._id} className="bg-white border p-4 rounded-2xl hover:border-blue-200 transition-all group relative">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase rounded-full tracking-widest border border-purple-100 italic">
                                                        {w.category}
                                                    </span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-all">
                                                        <button className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 mb-1">"{w.core_philosophy}"</p>
                                                <div className="space-y-1">
                                                    {w.deep_insights?.slice(-1).map((insight: string, idx: number) => (
                                                        <p key={idx} className="text-[12px] text-gray-500 leading-relaxed italic border-l-2 border-blue-100 pl-3">
                                                            {insight}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <motion.form
                            key="security"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <ShieldAlert className="text-red-600" />
                                    Safety & Policy Guardrails
                                </h2>
                                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl shadow-md">
                                    <Save size={18} /> Save Policy
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-800">NSFW & Safety Filtering</h3>
                                        <p className="text-sm text-gray-500">Blocks harassment, hate speech, and sexually explicit content.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            name="nsfwFilter"
                                            type="checkbox"
                                            defaultChecked={initialConfig.nsfwFilter}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                                    <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                                        <Sparkles size={18} />
                                        Input Sanitization Stats
                                    </h3>
                                    <div className="flex items-center gap-10">
                                        <div>
                                            <span className="text-[10px] text-orange-600 uppercase font-bold tracking-widest">Queries Cleaned</span>
                                            <div className="text-2xl font-black text-orange-900">1,245</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-orange-600 uppercase font-bold tracking-widest">Injections Blocked</span>
                                            <div className="text-2xl font-black text-orange-900">42</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <input type="hidden" name="systemInstruction" value={initialConfig.systemInstruction} />
                            <input type="hidden" name="activeKeys" value={initialConfig.activeKeys?.join(',')} />
                            <input type="hidden" name="modelName" value={initialConfig.modelName} />
                            <input type="hidden" name="searchProvider" value={initialConfig.searchConfig?.provider} />
                            <input type="hidden" name="tavilyKey" value={initialConfig.searchConfig?.tavilyKey} />
                            <input type="hidden" name="serperKey" value={initialConfig.searchConfig?.serperKey} />
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Status Toast */}
                <AnimatePresence>
                    {saveStatus === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full shadow-2xl font-bold z-50 transition-all mb-[-10px]"
                        >
                            <CheckCircle2 size={20} />
                            Transmission Successful
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
