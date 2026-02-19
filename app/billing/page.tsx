'use client';

import { Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ProtectedRoute } from '@/context/AuthContext';

export default function BillingPage() {
    const transactions = [
        { id: '#INV-001', date: 'Oct 24, 2024', amount: '13,900', status: 'Paid', statusColor: 'text-green-600 bg-green-50' },
        { id: '#INV-002', date: 'Sep 12, 2024', amount: '2,500', status: 'Pending', statusColor: 'text-orange-600 bg-orange-50' },
        { id: '#INV-003', date: 'Aug 05, 2024', amount: '45,000', status: 'Failed', statusColor: 'text-red-600 bg-red-50' },
    ];

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Billing History</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">Invoice ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                                        <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">৳{tx.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tx.statusColor} inline-flex items-center gap-1`}>
                                                {tx.status === 'Paid' && <CheckCircle size={12} />}
                                                {tx.status === 'Pending' && <Clock size={12} />}
                                                {tx.status === 'Failed' && <XCircle size={12} />}
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-orange-600 transition-colors">
                                                <Download size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
