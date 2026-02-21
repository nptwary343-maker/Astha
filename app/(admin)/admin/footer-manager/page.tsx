'use client';
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Save, Plus, Trash2, Shield, UploadCloud, Link as LinkIcon, Globe, Mail, Phone, MapPin, Facebook, Youtube, Linkedin, Loader, Award, CreditCard } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface Partner {
    id: string;
    logo: string;
    title: string;
    subtitle?: string;
    link?: string;
}

interface FooterConfig {
    description: string;
    address: string;
    phone: string;
    email: string;
    social: {
        facebook: string;
        youtube: string;
        linkedin: string;
    };
    established?: string;
    logoUrl?: string;
    payments: {
        bkash: boolean;
        nagad: boolean;
        visa: boolean;
        mastercard: boolean;
    };
    partners: Partner[];
}

export default function FooterManager() {
    const [config, setConfig] = useState<FooterConfig>({
        description: '',
        address: '',
        phone: '',
        email: '',
        social: { facebook: '', youtube: '', linkedin: '' },
        established: 'EST. 2024',
        logoUrl: '',
        payments: { bkash: true, nagad: true, visa: true, mastercard: true },
        partners: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const docRef = doc(db, 'site_config', 'footer_master');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setConfig(docSnap.data() as FooterConfig);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFileUpload = async (file: File, index: number) => {
        try {
            setUploading(true);
            const storageRef = ref(storage, `footer/partners/logo-${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            const newPartners = [...config.partners];
            newPartners[index].logo = url;
            setConfig({ ...config, partners: newPartners });
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const addPartner = () => {
        setConfig({
            ...config,
            partners: [...config.partners, { id: Math.random().toString(36).substr(2, 9), logo: '', title: '', subtitle: '', link: '' }]
        });
    };

    const removePartner = (index: number) => {
        const newPartners = config.partners.filter((_, i) => i !== index);
        setConfig({ ...config, partners: newPartners });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await setDoc(doc(db, 'site_config', 'footer_master'), config);
            alert("Footer Configuration Saved!");
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save configuration.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Award className="text-blue-600" />
                        Footer & Partner Manager
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage trust partners, contact info, and social links with fail-safe validation.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Everything
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Footer Config */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                            <Globe size={18} className="text-blue-500" />
                            General Content
                        </h2>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Company Description (Bio)</label>
                            <textarea
                                value={config.description}
                                onChange={(e) => setConfig({ ...config, description: e.target.value.slice(0, 150) })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-sm"
                                placeholder="Describe Asthar Hat in 150 chars..."
                            />
                            <p className="text-[10px] text-right text-gray-400 mt-1">{config.description.length}/150</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Established Text</label>
                                <input
                                    type="text"
                                    value={config.established}
                                    onChange={(e) => setConfig({ ...config, established: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="EST. 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Logo URL (Optional)</label>
                                <input
                                    type="text"
                                    value={config.logoUrl}
                                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Image URL"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <InputWithIcon icon={MapPin} label="Address" value={config.address} onChange={(val) => setConfig({ ...config, address: val })} />
                            <InputWithIcon icon={Phone} label="Phone" value={config.phone} onChange={(val) => setConfig({ ...config, phone: val })} />
                            <InputWithIcon icon={Mail} label="Email" value={config.email} onChange={(val) => setConfig({ ...config, email: val })} />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                            <LinkIcon size={18} className="text-orange-500" />
                            Social Links
                        </h2>
                        <div className="space-y-4">
                            <InputWithIcon icon={Facebook} label="Facebook URL" value={config.social.facebook} onChange={(val) => setConfig({ ...config, social: { ...config.social, facebook: val } })} />
                            <InputWithIcon icon={Youtube} label="Youtube URL" value={config.social.youtube} onChange={(val) => setConfig({ ...config, social: { ...config.social, youtube: val } })} />
                            <InputWithIcon icon={Linkedin} label="LinkedIn URL" value={config.social.linkedin} onChange={(val) => setConfig({ ...config, social: { ...config.social, linkedin: val } })} />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                            <CreditCard size={18} className="text-green-500" />
                            Payment Methods
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(config.payments).map((key) => (
                                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                                    <span className="text-sm font-bold text-gray-700 capitalize">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={config.payments[key as keyof typeof config.payments]}
                                        onChange={(e) => setConfig({ ...config, payments: { ...config.payments, [key]: e.target.checked } })}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Trust Partners */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <Award className="text-blue-600" />
                                Trust & Quality Partners
                            </h2>
                            <button
                                onClick={addPartner}
                                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition-all active:scale-95"
                            >
                                <Plus size={16} /> Add Partner
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {config.partners.map((partner, index) => (
                                <div key={partner.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 relative group">
                                    <button
                                        onClick={() => removePartner(index)}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-2 rounded-xl shadow-sm hover:bg-red-200 transition-all z-10 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="space-y-4">
                                        <div className="relative h-24 bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center overflow-hidden group/img">
                                            {partner.logo ? (
                                                <img src={partner.logo} alt="Logo" className="h-full object-contain grayscale opacity-60" />
                                            ) : (
                                                <div className="text-gray-300 flex flex-col items-center">
                                                    <UploadCloud size={30} />
                                                    <span className="text-[10px] font-bold mt-1 uppercase">No Logo</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">
                                                    Change Logo
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(file, index);
                                                    }} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={partner.title}
                                                onChange={(e) => {
                                                    const newPartners = [...config.partners];
                                                    newPartners[index].title = e.target.value.slice(0, 30);
                                                    setConfig({ ...config, partners: newPartners });
                                                }}
                                                className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Partner Title (30 Chars)"
                                            />
                                            <input
                                                type="text"
                                                value={partner.subtitle}
                                                onChange={(e) => {
                                                    const newPartners = [...config.partners];
                                                    newPartners[index].subtitle = e.target.value;
                                                    setConfig({ ...config, partners: newPartners });
                                                }}
                                                className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Subtext (e.g. University Name)"
                                            />
                                            <input
                                                type="text"
                                                value={partner.link}
                                                onChange={(e) => {
                                                    const newPartners = [...config.partners];
                                                    newPartners[index].link = e.target.value;
                                                    setConfig({ ...config, partners: newPartners });
                                                }}
                                                className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Optional External Link"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {config.partners.length === 0 && (
                            <div className="py-20 text-center space-y-4">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                    <Award className="text-gray-300" size={40} />
                                </div>
                                <p className="text-gray-400 font-medium italic">No partners added yet. The section will be hidden on frontend.</p>
                                <button
                                    onClick={addPartner}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-blue-100"
                                >
                                    Add Your First Partner
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputWithIcon({ icon: Icon, label, value, onChange }: { icon: any, label: string, value: string, onChange: (val: string) => void }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
                <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
        </div>
    );
}
