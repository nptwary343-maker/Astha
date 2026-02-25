'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, ExternalLink, MapPin, Ticket, Award, Check, Database, Zap } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { seedMockData } from '@/lib/seeder-utils';

type Section = 'banners' | 'partners' | 'coupons' | 'locations' | 'blocks';

export default function ContentManager() {
    const [activeSection, setActiveSection] = useState<Section>('banners');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [settings, setSettings] = useState<any>(null);
    const { showToast } = useToast();

    // Listen to global settings
    useEffect(() => {
        return onSnapshot(doc(db, 'settings', 'site-settings'), (doc) => {
            if (doc.exists()) setSettings(doc.data());
        });
    }, []);

    // Real-time listener for current section
    useEffect(() => {
        setLoading(true);
        const colMap: Record<Section, string> = {
            banners: 'homeBanners',
            partners: 'partners',
            coupons: 'coupons',
            locations: 'businessLocations',
            blocks: 'productBlocks'
        };

        const q = query(collection(db, colMap[activeSection]));
        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setItems(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [activeSection]);

    const handleSave = async (id?: string) => {
        const colMap: Record<Section, string> = {
            banners: 'homeBanners',
            partners: 'partners',
            coupons: 'coupons',
            locations: 'businessLocations',
            blocks: 'productBlocks'
        };

        try {
            if (id) {
                await updateDoc(doc(db, colMap[activeSection], id), formData);
                showToast('success', 'Item updated successfully');
            } else {
                await addDoc(collection(db, colMap[activeSection]), {
                    ...formData,
                    active: true,
                    order: items.length
                });
                showToast('success', 'Item added successfully');
            }
            setIsEditing(null);
            setFormData({});
        } catch (e) {
            showToast('error', 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const colMap: Record<Section, string> = {
            banners: 'homeBanners',
            partners: 'partners',
            coupons: 'coupons',
            locations: 'businessLocations',
            blocks: 'productBlocks'
        };
        try {
            await deleteDoc(doc(db, colMap[activeSection], id));
            showToast('success', 'Item deleted');
        } catch (e) {
            showToast('error', 'Delete failed');
        }
    };

    const renderForm = () => {
        switch (activeSection) {
            case 'banners':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Subtitle" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Image URL" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Button Text" value={formData.buttonText || ''} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Button Link" value={formData.buttonLink || ''} onChange={e => setFormData({ ...formData, buttonLink: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <select
                            value={formData.bannerType || 'primary'}
                            onChange={e => setFormData({ ...formData, bannerType: e.target.value })}
                            className="p-3 bg-gray-50 border rounded-xl font-bold text-sm"
                        >
                            <option value="primary">Primary Banner (Large)</option>
                            <option value="secondary">Secondary Banner (Compact)</option>
                        </select>
                    </div>
                );
            case 'partners':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Partner Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Logo URL" value={formData.logoUrl || ''} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Website" value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                    </div>
                );
            case 'coupons':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Coupon Code" value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="number" placeholder="Discount %" value={formData.discount || ''} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Image URL" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                    </div>
                );
            case 'locations':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Location Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Address" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="City" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Area" value={formData.area || ''} onChange={e => setFormData({ ...formData, area: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                        <input type="text" placeholder="Image URL" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="p-3 bg-gray-50 border rounded-xl" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="bg-blue-900 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div>
                            <h1 className="text-white text-3xl font-black tracking-tight italic uppercase">Content Master Console</h1>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">Dynamic Homepage Control Center</p>
                        </div>
                        <button
                            onClick={async () => {
                                const ok = await seedMockData();
                                if (ok) showToast('success', 'Mock Data Initialized');
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-xl text-[10px] font-black uppercase hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                        >
                            <Database size={14} /> Initialize Mock Data
                        </button>
                    </div>
                    <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl overflow-hidden border border-white/10 mr-4">
                        <button
                            onClick={async () => {
                                const newMode = !settings?.enableHomeParticleEffects;
                                await updateDoc(doc(db, 'settings', 'site-settings'), { enableHomeParticleEffects: newMode });
                                showToast('success', `Particles ${newMode ? 'Enabled' : 'Disabled'}`);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings?.enableHomeParticleEffects ? 'bg-green-500 text-white' : 'bg-gray-500 text-white/60'}`}
                        >
                            <Zap size={14} /> Particles
                        </button>
                    </div>
                    <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl overflow-hidden border border-white/10">
                        {(['banners', 'partners', 'coupons', 'locations'] as Section[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setActiveSection(s)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-orange-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    {/* Add Button */}
                    {!isEditing && (
                        <button
                            onClick={() => { setIsEditing('new'); setFormData({}); }}
                            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center gap-3 text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-all font-black uppercase tracking-widest text-xs"
                        >
                            <Plus size={20} /> Add New {activeSection.slice(0, -1)}
                        </button>
                    )}

                    {/* Editor */}
                    {isEditing && (
                        <div className="bg-gray-50 rounded-[2rem] p-6 mb-8 border border-gray-100 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-blue-900 font-black uppercase tracking-widest text-xs mb-6 px-1 flex items-center gap-2">
                                <Edit2 size={14} className="text-orange-500" />
                                {isEditing === 'new' ? 'Create New' : 'Edit Existing'} {activeSection}
                            </h3>
                            {renderForm()}
                            <div className="flex gap-4 mt-8">
                                <button onClick={() => handleSave(isEditing === 'new' ? undefined : isEditing)} className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-colors">
                                    <Save size={16} /> Save Changes
                                </button>
                                <button onClick={() => setIsEditing(null)} className="px-8 bg-gray-200 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-300">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* List */}
                    <div className="mt-8 space-y-4">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-blue-900/20 border-t-blue-900 rounded-full animate-spin" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Synchronizing Index...</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-20 text-center">
                                <X size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-sm font-bold text-gray-400">No items found in this collection.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map(item => (
                                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
                                        <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
                                            {item.imageUrl || item.logoUrl ? (
                                                <img src={item.imageUrl || item.logoUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={24} className="text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-blue-900 text-sm truncate">{item.title || item.name || item.code}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{item.subtitle || item.area || item.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setIsEditing(item.id); setFormData(item); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
