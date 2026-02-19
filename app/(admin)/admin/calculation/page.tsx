'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Receipt, Users, DollarSign, PieChart, FileText, Printer } from 'lucide-react';

interface CostItem {
    id: string;
    name: string;
    amount: number;
}

interface Shareholder {
    id: string;
    name: string;
    investment: number;
    percentage: number;
}

export default function CalculationPage() {
    // Costs State
    const [costs, setCosts] = useState<CostItem[]>([
        { id: '1', name: 'Labor Cost', amount: 0 }
    ]);

    // Shareholders State
    const [shareholders, setShareholders] = useState<Shareholder[]>([
        { id: '1', name: 'Shareholder 1', investment: 10000, percentage: 0 }
    ]);
    const [selectedShareholderId, setSelectedShareholderId] = useState<string | null>(null);

    // Derived Calculations (No need for useEffect/State for these)
    const totalCost = costs.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalInvestment = shareholders.reduce((sum, item) => sum + (Number(item.investment) || 0), 0);
    const remainingBalance = totalInvestment - totalCost;

    const enrichedShareholders = shareholders.map(s => ({
        ...s,
        percentage: totalInvestment > 0 ? ((s.investment / totalInvestment) * 100) : 0
    }));


    // Handlers
    const addCost = () => {
        setCosts([...costs, { id: Date.now().toString(), name: '', amount: 0 }]);
    };

    const removeCost = (id: string) => {
        setCosts(costs.filter(c => c.id !== id));
    };

    const updateCost = (id: string, field: keyof CostItem, value: string | number) => {
        setCosts(costs.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addShareholder = () => {
        setShareholders([...shareholders, { id: Date.now().toString(), name: '', investment: 0, percentage: 0 }]);
    };

    const removeShareholder = (id: string) => {
        setShareholders(shareholders.filter(s => s.id !== id));
    };

    const updateShareholder = (id: string, field: keyof Shareholder, value: string | number) => {
        setShareholders(shareholders.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Calculator size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Investment & Cost Calculator</h1>
                    <p className="text-gray-500">Track operational costs, shareholder investments, and profit distribution.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: Costs & Expenses */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                        <div className="bg-red-50/50 p-4 border-b border-red-100 flex justify-between items-center">
                            <h2 className="font-bold text-red-800 flex items-center gap-2">
                                <Receipt size={18} /> Operational Costs
                            </h2>
                            <span className="text-xs font-bold bg-white px-2 py-1 rounded text-red-600 border border-red-100">
                                Expenses
                            </span>
                        </div>

                        <div className="p-6 space-y-4">
                            {costs.map((cost, index) => (
                                <div key={cost.id} className="flex gap-4 items-end group">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Cost Name {index + 1}</label>
                                        <input
                                            type="text"
                                            value={cost.name}
                                            onChange={(e) => updateCost(cost.id, 'name', e.target.value)}
                                            placeholder="e.g. Labor, Rent"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Amount (৳)</label>
                                        <input
                                            type="number"
                                            value={cost.amount || ''}
                                            onChange={(e) => updateCost(cost.id, 'amount', parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold text-right"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeCost(cost.id)}
                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={addCost}
                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add New Cost
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-600">Total Expenses</span>
                            <span className="font-mono text-xl font-bold text-red-600">৳ {totalCost.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Investments & Shareholders */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                        <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex justify-between items-center">
                            <h2 className="font-bold text-emerald-800 flex items-center gap-2">
                                <Users size={18} /> Shareholder Investments
                            </h2>
                            <span className="text-xs font-bold bg-white px-2 py-1 rounded text-emerald-600 border border-emerald-100">
                                Capital
                            </span>
                        </div>

                        <div className="p-6 space-y-4">
                            {enrichedShareholders.map((person, index) => (
                                <div key={person.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                    <button
                                        onClick={() => removeShareholder(person.id)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 opcaity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Shareholder Name</label>
                                            <input
                                                type="text"
                                                value={person.name}
                                                onChange={(e) => updateShareholder(person.id, 'name', e.target.value)}
                                                placeholder={`Shareholder ${index + 1}`}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Invested Amount (৳)</label>
                                            <div className="relative">
                                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={person.investment || ''}
                                                    onChange={(e) => updateShareholder(person.id, 'investment', parseFloat(e.target.value))}
                                                    placeholder="0"
                                                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 font-medium">Ownership Share:</span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${person.percentage}%` }}
                                            />
                                        </div>
                                        <span className="font-mono font-bold text-emerald-600">{person.percentage.toFixed(2)}%</span>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addShareholder}
                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add Shareholder
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-600">Total Investment</span>
                            <span className="font-mono text-xl font-bold text-emerald-600">৳ {totalInvestment.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl shadow-gray-200 mt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gray-800 rounded-2xl">
                            <PieChart size={32} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Financial Summary</h3>
                            <p className="text-gray-400">Net balance after deducting all operational costs.</p>
                        </div>
                    </div>

                    <div className="flex gap-8 text-right">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Expenses</p>
                            <p className="text-xl font-bold text-red-400">- ৳{totalCost.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-px bg-gray-700"></div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Capital</p>
                            <p className="text-xl font-bold text-emerald-400">৳{totalInvestment.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-px bg-gray-700"></div>
                        <div>
                            <p className="text-blue-200 text-sm font-bold mb-1">Remaining Balance</p>
                            <p className={`text-3xl font-black font-mono ${remainingBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                                ৳{remainingBalance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SHAREHOLDER Invoice/Statement Section */}
            <div className="mt-12 mb-20 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6 no-print">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" /> Shareholder Statement
                        </h2>
                        <p className="text-gray-500 text-sm">Select a shareholder to generate their financial statement.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={selectedShareholderId || ''}
                            onChange={(e) => setSelectedShareholderId(e.target.value)}
                        >
                            <option value="">-- Select Shareholder --</option>
                            {enrichedShareholders.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => window.print()}
                            disabled={!selectedShareholderId}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                        >
                            <Printer size={18} /> Print Statement
                        </button>
                    </div>
                </div>

                {selectedShareholderId ? (
                    (() => {
                        const shareholder = enrichedShareholders.find(s => s.id === selectedShareholderId);
                        if (!shareholder) return null;

                        const shareOfExpenses = (shareholder.percentage / 100) * totalCost;
                        const shareOfBalance = (shareholder.percentage / 100) * remainingBalance;

                        return (
                            <div className="border border-gray-200 rounded-xl p-8 bg-gray-50/30 print:border-none print:p-0">
                                {/* Print Header */}
                                <div className="text-center mb-8 border-b-2 border-gray-100 pb-6">
                                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wide mb-1">AstharHat</h1>
                                    <p className="text-gray-500 font-medium">Investment & Profit Statement</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>

                                <div className="max-w-3xl mx-auto space-y-8">
                                    {/* Shareholder Info */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shareholder</p>
                                                <h2 className="text-2xl font-bold text-gray-900">{shareholder.name}</h2>
                                                <p className="text-sm text-gray-500">ID: #{shareholder.id.slice(-6)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ownership</p>
                                                <h2 className="text-2xl font-black text-emerald-600">{shareholder.percentage.toFixed(2)}%</h2>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Breakdown Table */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm print:shadow-none">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-sm">
                                                <tr>
                                                    <th className="px-6 py-4">Description</th>
                                                    <th className="px-6 py-4 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="px-6 py-4 font-medium text-gray-900">Total Investment (Capital)</td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">৳ {shareholder.investment.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 font-medium text-gray-600">
                                                        Wait of Total Expenses ({shareholder.percentage.toFixed(1)}%)
                                                        <span className="block text-xs text-gray-400 font-normal">Share of operational costs based on ownership</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-red-500">- ৳ {shareOfExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                                </tr>
                                                <tr className="bg-blue-50/50">
                                                    <td className="px-6 py-4 font-bold text-gray-900">Net Value / Remaining Share Balance</td>
                                                    <td className={`px-6 py-4 text-right font-mono font-black text-lg ${shareOfBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                        ৳ {shareOfBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer / Notes */}
                                    <div className="text-center pt-8 text-gray-400 text-xs">
                                        <p>This is a computer-generated statement and requires no signature.</p>
                                        <p className="mt-1">Generated by AstharHat Admin Panel</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium">Please select a shareholder above to view their statement.</p>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .animate-in {
                        animation: none !important;
                    }
                    .max-w-7xl, .space-y-8, .p-8 {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /* Hide everything */
                    nav, aside, header, .no-print, .shadow-xl, .bg-gray-900 {
                        display: none !important;
                    }
                    /* Show only the invoice container */
                    .border-gray-200.rounded-xl.p-8.bg-gray-50\\/30, 
                    .border-gray-200.rounded-xl.p-8.bg-gray-50\\/30 * {
                        visibility: visible;
                    }
                    .border-gray-200.rounded-xl.p-8.bg-gray-50\\/30 {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none !important;
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
}
