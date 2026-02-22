'use client';

import { useState } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function EmailTemplateManager() {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <h2 className="text-xl font-bold">Email Configuration</h2>
                    <p className="text-sm text-gray-400">Manage how emails are delivered to customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-300">Active Provider:</span>
                    <select
                        className="bg-gray-700 text-white border-none rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        disabled
                    >
                        <option value="emailjs">🔄 EmailJS (Active)</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Email Templates</h2>
                <button
                    disabled
                    className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                >
                    <Plus size={18} /> New Template (Migrating)
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">Email template management is currently being migrated to Firestore. All critical system emails are now handled via the Secure Signal Pulse.</p>
            </div>
        </div>
    );
}
