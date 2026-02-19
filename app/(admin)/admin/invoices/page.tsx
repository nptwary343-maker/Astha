'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function InvoicesPage() {
    const { user, isSuperAdmin } = useAuth();

    // Mock Data (In a real app, this would come from Firestore 'orders' or 'billing' collection)
    const [invoices] = useState([
        { id: 'INV-2024-001', date: '2024-02-01', amount: 15000, status: 'Paid', type: 'Service Fee' },
        { id: 'INV-2024-002', date: '2024-01-15', amount: 5000, status: 'Paid', type: 'Ad Campaign' },
        { id: 'INV-2024-003', date: '2024-01-01', amount: 2500, status: 'Pd', type: 'Maintenance' },
    ]);

    const handleDownload = (id: string) => {
        // In a real app, this would generate a PDF or fetch a URL
        alert(`Downloading Invoice ${id}...`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500">Download billing history and work invoices.</p>
                </div>
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm flex items-center gap-2 hover:bg-gray-50">
                    <Filter size={18} /> Date Filter
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Invoice ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Service / Description</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-blue-600">{inv.id}</td>
                                <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" /> {inv.date}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{inv.type}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">৳ {inv.amount}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDownload(inv.id)}
                                        className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download PDF"
                                    >
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Super Admin Info */}
            {isSuperAdmin && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3 text-sm text-yellow-800">
                    <FileText size={20} />
                    <div>
                        <p className="font-bold">Super Admin Note</p>
                        <p>You can see full system billing details here. Normal admins only see their own work invoices if applicable.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
