'use client';

import { useState, useEffect } from 'react';
import { getEmailTemplates, saveEmailTemplate, deleteEmailTemplate, EmailTemplate } from '@/actions/email-templates';
import { getEmailConfig, updateEmailConfig } from '@/actions/email-config';
import { Trash2, Edit, Check, X, Plus } from 'lucide-react';

export default function EmailTemplateManager() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [provider, setProvider] = useState('auto');

    async function loadData() {
        setIsLoading(true);
        const [tpls, cfg] = await Promise.all([
            getEmailTemplates(),
            getEmailConfig()
        ]);
        setTemplates(tpls);
        setProvider(cfg.provider);
        setIsLoading(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    async function handleProviderChange(val: string) {
        setProvider(val);
        await updateEmailConfig(val);
        alert("Provider Updated!");
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!editingTemplate) return;

        const res = await saveEmailTemplate(editingTemplate);
        if (res.success) {
            setEditingTemplate(null);
            loadData();
            alert("Template saved!");
        } else {
            alert("Failed to save template.");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return;
        const res = await deleteEmailTemplate(id);
        if (res.success) {
            loadData();
        } else {
            alert("Failed to delete.");
        }
    }

    return (
        <div className="space-y-6">
            {/* Config Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <h2 className="text-xl font-bold">Email Configuration</h2>
                    <p className="text-sm text-gray-400">Manage how emails are delivered to customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-300">Active Provider:</span>
                    <select
                        value={provider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="bg-gray-700 text-white border-none rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="auto">🤖 Auto (Smart Failover)</option>
                        <option value="resend">🚀 Resend (Recommended)</option>
                        <option value="gmail">📧 Gmail (Backup)</option>
                        <option value="emailjs">🔄 EmailJS (Fallback)</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Email Templates</h2>
                <button
                    onClick={() => setEditingTemplate({ name: '', subject: '', body: '', active: true, updatedAt: '' })}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> New Template
                </button>
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((t) => (
                        <div key={t._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{t.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {t.active ? 'Active' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-1">{t.subject}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingTemplate(t)}
                                    className="flex-1 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 py-2 rounded-lg hover:bg-blue-100"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(t._id!)}
                                    className="px-3 text-red-600 bg-red-50 py-2 rounded-lg hover:bg-red-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingTemplate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-xl font-bold">{editingTemplate._id ? 'Edit Template' : 'New Template'}</h3>
                                <button type="button" onClick={() => setEditingTemplate(null)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">System Name (ID)</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingTemplate.name}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                        placeholder="e.g. order_confirmation"
                                        className="w-full border rounded-lg p-2"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used by code to find this template.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={editingTemplate.active ? 'true' : 'false'}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, active: e.target.value === 'true' })}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email Subject</label>
                                <input
                                    required
                                    type="text"
                                    value={editingTemplate.subject}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">Available vars: <code>{'{{orderId}}'}</code></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email Body (HTML)</label>
                                <textarea
                                    required
                                    rows={15}
                                    value={editingTemplate.body}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                    className="w-full border rounded-lg p-2 font-mono text-sm bg-gray-50"
                                ></textarea>
                                <div className="text-xs text-gray-500 mt-1 space-x-2">
                                    <span>Vars:</span>
                                    <code>{'{{customerName}}'}</code>
                                    <code>{'{{orderId}}'}</code>
                                    <code>{'{{totalPrice}}'}</code>
                                    <code>{'{{address}}'}</code>
                                    <code>{'{{status}}'}</code>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setEditingTemplate(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Save Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
