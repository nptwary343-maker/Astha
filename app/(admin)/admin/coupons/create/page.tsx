'use client';
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Save, Plus, Trash2, Ticket, Calendar, Users, ShoppingCart, Tag, Loader, ShieldCheck, AlertCircle } from 'lucide-react';

interface CouponTargeting {
    userTags: string[];
    allowedEmails: string[];
    excludedEmails: string[];
    targetSellers: string[];
    targetCategories: string[];
    minCartItems: number;
}

interface CouponFormData {
    code: string;
    type: 'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING';
    value: number;
    maxDiscountAmount: number;
    minOrderValue: number;
    isActive: boolean;
    expiryDate: string;
    usageLimit: number;
    targeting: CouponTargeting;
}

const CATEGORIES = ["Electronics", "Fashion", "Agriculture", "Home", "Health", "Books"];
const USER_GROUPS = ["VIP", "NSTU_STUDENT", "NEW_BUYER", "RESELLER", "INACTIVE"];

export default function CreateCouponPage() {
    const [formData, setFormData] = useState<CouponFormData>({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        maxDiscountAmount: 0,
        minOrderValue: 0,
        isActive: true,
        expiryDate: '',
        usageLimit: 100,
        targeting: {
            userTags: [],
            allowedEmails: [],
            excludedEmails: [],
            targetSellers: [],
            targetCategories: [],
            minCartItems: 1
        }
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!formData.code || !formData.expiryDate) {
            alert("Please provide a Coupon Code and Expiry Date.");
            return;
        }

        try {
            setSaving(true);
            const couponId = formData.code.toUpperCase().trim();
            const docRef = doc(db, 'coupons', couponId);

            await setDoc(docRef, {
                ...formData,
                code: couponId,
                expiryDate: new Date(formData.expiryDate).toISOString(),
                usedCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            alert(`Coupon ${couponId} created successfully!`);
            // Reset form or redirect
        } catch (error) {
            console.error("Error creating coupon:", error);
            alert("Failed to create coupon.");
        } finally {
            setSaving(false);
        }
    };

    const toggleTag = (tag: string) => {
        const current = formData.targeting.userTags;
        const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
        setFormData({ ...formData, targeting: { ...formData.targeting, userTags: next } });
    };

    const toggleCategory = (cat: string) => {
        const current = formData.targeting.targetCategories;
        const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
        setFormData({ ...formData, targeting: { ...formData.targeting, targetCategories: next } });
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Ticket className="text-blue-600" />
                        Create New Coupon
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Design granular "Zero Trust" discounts for targeted user segments.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Coupon
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Basic Config */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2">
                            <Tag size={18} className="text-blue-500" />
                            General Rules
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Coupon Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-black tracking-widest text-lg"
                                    placeholder="ASTHAR50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Discount Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FLAT">Flat Amount (৳)</option>
                                    <option value="FREE_SHIPPING">Free Shipping</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Value</label>
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                                />
                            </div>

                            {formData.type === 'PERCENTAGE' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Max Discount (Cap)</label>
                                    <input
                                        type="number"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                                        className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                                        placeholder="৳0 (No cap)"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Min Order Value</label>
                                <input
                                    type="number"
                                    value={formData.minOrderValue}
                                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Usage Limit (Global)</label>
                                <input
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Expiry Date</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full px-5 py-3 pl-12 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-green-500" />
                            Targeting & Scope
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Who can use this?</label>
                                <div className="flex flex-wrap gap-2">
                                    {USER_GROUPS.map(group => (
                                        <button
                                            key={group}
                                            onClick={() => toggleTag(group)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.targeting.userTags.includes(group) ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            {group}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setFormData({ ...formData, targeting: { ...formData.targeting, userTags: [] } })}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.targeting.userTags.length === 0 ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        EVERYONE
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Allowed Emails (CSV)</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 text-sm h-32 resize-none"
                                        placeholder="user@example.com, test@astharhat.com"
                                        onChange={(e) => setFormData({ ...formData, targeting: { ...formData.targeting, allowedEmails: e.target.value.split(',').map(em => em.trim()) } })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Excluded Emails (Blacklist)</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-red-100 text-sm h-32 resize-none"
                                        placeholder="baduser@spam.com"
                                        onChange={(e) => setFormData({ ...formData, targeting: { ...formData.targeting, excludedEmails: e.target.value.split(',').map(em => em.trim()) } })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Apply only to these Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.targeting.targetCategories.includes(cat) ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setFormData({ ...formData, targeting: { ...formData.targeting, targetCategories: [] } })}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.targeting.targetCategories.length === 0 ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        ALL CATEGORIES
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary / Status */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                        <div className="flex items-center gap-3 relative">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <ShieldCheck className="text-blue-400" />
                            </div>
                            <h3 className="font-bold uppercase tracking-widest text-sm">Preview Card</h3>
                        </div>

                        <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-md space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">Active Coupon</span>
                                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
                            </div>
                            <h4 className="text-3xl font-black text-white tracking-widest">
                                {formData.code || 'CODE'}
                            </h4>
                            <p className="text-sm font-medium text-white/60">
                                {formData.type === 'PERCENTAGE' ? `${formData.value}% OFF` : formData.type === 'FLAT' ? `৳${formData.value} OFF` : 'FREE SHIPPING'}
                            </p>
                            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-white/40 uppercase font-bold">
                                <Calendar size={12} />
                                Expires: {formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'Set Date'}
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="flex items-center gap-2 text-white/60">
                                <ShoppingCart size={14} /> Min Order: ৳{formData.minOrderValue}
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                                <Users size={14} /> Global Limit: {formData.usageLimit}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                        <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-4">
                            <AlertCircle size={18} />
                            Architect Note
                        </h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            This coupon system follows **Zero Trust** principles. All rules configured here are enforced strictly on the server during the order finalization. Client-side state is only used for UI previews.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
