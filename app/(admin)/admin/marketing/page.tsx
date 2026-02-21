'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageTemplate } from '@/types';
import { Plus, Trash2, Edit2, Save, X, MessageSquare } from 'lucide-react';

export default function MarketingPage() {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ title: string; body: string; category: 'Order' | 'Marketing' }>({ title: '', body: '', category: 'Order' });

    // Fetch Templates
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'message_templates'));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MessageTemplate[];
                setTemplates(data);
            } catch (error) {
                console.error("Error fetching templates:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleSubmit = async () => {
        if (!formData.title || !formData.body) return;

        try {
            if (editingId) {
                // Update
                const docRef = doc(db, 'message_templates', editingId);
                await updateDoc(docRef, {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
                setTemplates(templates.map(t => t.id === editingId ? { ...t, ...formData } : t));
            } else {
                // Create
                const docRef = await addDoc(collection(db, 'message_templates'), {
                    ...formData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                setTemplates([...templates, { id: docRef.id, ...formData } as any]);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving template:", error);
            alert("Failed to save template.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this template?")) return;
        try {
            await deleteDoc(doc(db, 'message_templates', id));
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting template:", error);
            alert("Failed to delete template.");
        }
    };

    const openModal = (template?: MessageTemplate) => {
        if (template) {
            setEditingId(template.id);
            setFormData({ title: template.title, body: template.body, category: template.category as any });
        } else {
            setEditingId(null);
            setFormData({ title: '', body: '', category: 'Order' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ title: '', body: '', category: 'Order' });
    };

    // ... (existing imports)

    const [activeTab, setActiveTab] = useState<'templates' | 'bulk'>('templates');
    const [bulkMessage, setBulkMessage] = useState('');
    const [sendingBulk, setSendingBulk] = useState(false);

    // ... (existing functions)

    const handleBulkSend = async () => {
        if (!bulkMessage) return;
        if (!confirm("Are you sure you want to send this message to ALL users?")) return;

        setSendingBulk(true);
        try {
            // Simulator: In real app, call API to fetch all users with fcmTokens and send multicast
            // const res = await fetch('/api/marketing/send-bulk', { method: 'POST', body: JSON.stringify({ message: bulkMessage }) });

            // Mock Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert("Bulk message sent to 0 users (Simulated). In production, this would hit the API.");
            setBulkMessage('');
        } catch (error) {
            console.error("Bulk send error:", error);
            alert("Failed to send bulk message.");
        } finally {
            setSendingBulk(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Marketing & Templates</h1>
                    <p className="text-gray-500">Manage notification templates and send bulk marketing messages.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bulk' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Bulk Send
                    </button>
                </div>
                {activeTab === 'templates' && (
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
                    >
                        <Plus size={18} /> New Template
                    </button>
                )}
            </div>

            {/* Content Switcher */}
            {activeTab === 'templates' ? (
                /* Templates Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ... (existing template mapping code) ... */}
                    {loading ? (
                        <p className="text-gray-400 col-span-full text-center py-10">Loading templates...</p>
                    ) : templates.length === 0 ? (
                        <div className="col-span-full bg-white p-10 rounded-2xl text-center border border-gray-100 shadow-sm">
                            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="font-bold text-gray-900">No Templates Found</h3>
                            <p className="text-gray-400 text-sm mt-1">Create your first message template to get started.</p>
                        </div>
                    ) : (
                        templates.map((template) => (
                            <div key={template.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${template.category === 'Order' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                        }`}>
                                        {template.category}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(template)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(template.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{template.title}</h3>
                                <p className="text-sm text-gray-500 whitespace-pre-wrap line-clamp-4 bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono">
                                    {template.body}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Bulk Sender UI */
                /* Bulk Sender UI with Preview */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Left: Editor */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
                        <div className="text-center mb-8">
                            <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-purple-600 mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Bulk Marketing</h2>
                            <p className="text-gray-500">Send notifications to all subscribed users.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-bold text-gray-700">Message Content</label>
                                    <span className={`text-xs font-mono ${bulkMessage.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {bulkMessage.length}/250 chars
                                    </span>
                                </div>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm h-40 resize-none"
                                    value={bulkMessage}
                                    onChange={(e) => setBulkMessage(e.target.value)}
                                    placeholder="Write your marketing message here... (e.g. 50% OFF Sale starting tomorrow!)"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => alert("Test Sent to your registered device!")}
                                    className="flex-1 py-4 rounded-xl font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-100"
                                >
                                    Test Send
                                </button>
                                <button
                                    onClick={handleBulkSend}
                                    disabled={sendingBulk || !bulkMessage}
                                    className="flex-2 w-full py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sendingBulk ? 'Sending...' : 'Send to All Users'}
                                </button>
                            </div>
                            <p className="text-xs text-center text-gray-400">
                                Note: This will send a push notification to all users who have allowed permissions.
                            </p>
                        </div>
                    </div>

                    {/* Right: Phone Preview */}
                    <div className="sticky top-24">
                        <div className="mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl flex flex-col relative overflow-hidden">
                            <div className="h-[32px] bg-gray-800 rounded-t-[2.5rem] absolute top-0 w-full z-20 left-0"></div>
                            {/* Notch */}
                            <div className="h-[24px] w-[120px] bg-black absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-30"></div>

                            {/* Screen */}
                            <div className="bg-gray-100 w-full h-full pt-12 px-4 overflow-y-auto relative z-10">
                                {/* Simulated Notification */}
                                {bulkMessage && (
                                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 animate-in slide-in-from-top-4 duration-500 mt-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-orange-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold">
                                                AH
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">Asthar Hat</h4>
                                                <p className="text-xs text-gray-600 leading-relaxed break-words">{bulkMessage}</p>
                                                <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!bulkMessage && (
                                    <div className="text-center text-gray-400 mt-20 text-sm">
                                        Type a message to see preview...
                                    </div>
                                )}

                                {/* Background app UI elements mock */}
                                <div className="mt-8 space-y-4 opacity-50 blur-[2px]">
                                    <div className="h-40 bg-gray-300 rounded-2xl w-full"></div>
                                    <div className="h-20 bg-gray-300 rounded-2xl w-full"></div>
                                    <div className="h-20 bg-gray-300 rounded-2xl w-full"></div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-400 text-sm mt-4 font-bold">Live Preview</p>
                    </div>
                </div>

            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Template' : 'New Template'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Template Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Order Confirmation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Order' | 'Marketing' })}
                                >
                                    <option value="Order">Order Notification</option>
                                    <option value="Marketing">Marketing / Promo</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-bold text-gray-700">Message Body</label>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Supports {'{{variables}}'}</span>
                                </div>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-32 resize-none font-mono"
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    placeholder="Your order {{order_id}} has been confirmed..."
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {['{{name}}', '{{total_money}}', '{{order_id}}', '{{cart_details}}'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setFormData(prev => ({ ...prev, body: prev.body + tag }))}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors flex items-center gap-2">
                                <Save size={18} />
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
