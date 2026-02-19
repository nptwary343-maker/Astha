'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MoreHorizontal, Receipt, X, Clock, Eye, Download, Printer, Edit, Save, Trash2, Sparkles } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OrderHistoryItem {
    id: string;
    date: string;
    items: string;
    amount: number;
    status: string;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    altPhone?: string;
    orders: number;
    totalSpent: number;
    status: string;
    history: OrderHistoryItem[];
    lastOrderDate: Date;
}

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // Personal Banner State
    const [bannerModalOpen, setBannerModalOpen] = useState(false);
    const [bannerTargetCustomer, setBannerTargetCustomer] = useState<Customer | null>(null);
    const [personalStats, setPersonalStats] = useState([
        { title: '', desc: '' },
        { title: '', desc: '' },
        { title: '', desc: '' },
        { title: '', desc: '' }
    ]);
    const [personalBannerActive, setPersonalBannerActive] = useState(true);
    const [loadingBanner, setLoadingBanner] = useState(false);

    useEffect(() => {
        // Fetch All Orders to Aggregate Customers
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const customerMap = new Map<string, Customer>();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const customerInfo = data.customer || {};

                // key can be email or phone or a mix
                const key = customerInfo.email || customerInfo.phone || 'unknown';
                if (key === 'unknown') return;

                const orderDate = new Date(data.date || data.createdAt);
                const orderAmount = data.totals?.total || 0;

                // Format items summary
                const itemsSummary = data.items
                    ? data.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')
                    : 'Unknown Items';

                const historyItem: OrderHistoryItem = {
                    id: doc.id,
                    date: orderDate.toLocaleDateString(),
                    items: itemsSummary,
                    amount: orderAmount,
                    status: data.status || 'Pending'
                };

                if (customerMap.has(key)) {
                    const existing = customerMap.get(key)!;
                    existing.orders += 1;
                    existing.totalSpent += orderAmount;
                    existing.history.push(historyItem);
                    if (orderDate > existing.lastOrderDate) {
                        existing.lastOrderDate = orderDate;
                    }
                } else {
                    customerMap.set(key, {
                        id: doc.id, // Using first order ID as proxy ID or could generate hash
                        name: customerInfo.name || 'Unknown',
                        email: customerInfo.email || '',
                        phone: customerInfo.phone || '',
                        altPhone: '', // Not consistently captured usually
                        orders: 1,
                        totalSpent: orderAmount,
                        status: 'Active', // Logic could be: active if last order < 90 days
                        history: [historyItem],
                        lastOrderDate: orderDate
                    });
                }
            });

            // Convert map to array and update status based on recency
            const customerList = Array.from(customerMap.values()).map(c => {
                const daysSinceLastOrder = (new Date().getTime() - c.lastOrderDate.getTime()) / (1000 * 3600 * 24);
                return {
                    ...c,
                    status: daysSinceLastOrder < 90 ? 'Active' : 'Inactive'
                };
            });

            setCustomers(customerList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const handleOpenBannerModal = async (customer: Customer) => {
        if (!customer.email) {
            alert("Customer email is required for personalization.");
            return;
        }
        setBannerTargetCustomer(customer);
        setBannerModalOpen(true);
        setLoadingBanner(true);

        try {
            // Load existing stats if any
            const docRef = doc(db, 'settings', 'home-stats', 'users', customer.email);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setPersonalStats(data.items || [
                    { title: '', desc: '' },
                    { title: '', desc: '' },
                    { title: '', desc: '' },
                    { title: '', desc: '' }
                ]);
                setPersonalBannerActive(data.isActive ?? true);
            } else {
                // Return to defaults or empty
                setPersonalStats([
                    { title: 'Special Gift', desc: 'Just for You' },
                    { title: 'Loyalty Bonus', desc: 'Thanks for being with us' },
                    { title: 'Exclusive Deal', desc: 'Valid 24 Hours' },
                    { title: 'Surprise', desc: 'Check your wallet' }
                ]);
                setPersonalBannerActive(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBanner(false);
        }
    };

    const handleSavePersonalBanner = async () => {
        if (!bannerTargetCustomer?.email) return;
        try {
            const docRef = doc(db, 'settings', 'home-stats', 'users', bannerTargetCustomer.email);
            await setDoc(docRef, {
                items: personalStats,
                isActive: personalBannerActive,
                updatedAt: new Date().toISOString()
            });
            alert(`Banner personalized for ${bannerTargetCustomer.name}!`);
            setBannerModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Failed to save personal banner.");
        }
    };

    const handleDeletePersonalBanner = async () => {
        if (!bannerTargetCustomer?.email) return;
        if (!confirm("Remove personalization? They will see the global banner.")) return;
        try {
            await deleteDoc(doc(db, 'settings', 'home-stats', 'users', bannerTargetCustomer.email));
            alert("Personalization removed.");
            setBannerModalOpen(false);
        } catch (e) {
            console.error(e);
        }
    }

    const handleDownloadCSV = () => {
        if (!selectedCustomer) return;

        const headers = ['Order ID', 'Date', 'Items', 'Amount', 'Status'];
        const rows = selectedCustomer.history.map(tx => [
            tx.id,
            tx.date,
            `"${tx.items}"`, // Quote items to handle commas
            tx.amount,
            tx.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `billing_history_${selectedCustomer.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        if (!selectedCustomer) return;

        const printWindow = window.open('', '', 'width=900,height=800');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Billing History - ${selectedCustomer.name}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; }
                        .header { margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        h1 { margin: 0 0 10px 0; color: #111; }
                        .meta { color: #666; font-size: 14px; }
                        .stats { display: flex; gap: 20px; margin-bottom: 30px; }
                        .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; background: #fafafa; }
                        .card h3 { margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; color: #666; }
                        .card p { margin: 0; font-size: 20px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; }
                        th { text-align: left; padding: 12px; background: #f4f4f5; font-size: 12px; text-transform: uppercase; }
                        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                        .amount { text-align: right; font-family: monospace; font-weight: bold; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>AstharHat Billing Report</h1>
                        <div class="meta">
                            <strong>Customer:</strong> ${selectedCustomer.name}<br/>
                            <strong>Email:</strong> ${selectedCustomer.email || 'N/A'}<br/>
                            <strong>Phone:</strong> ${selectedCustomer.phone || 'N/A'}<br/>
                            <strong>Generated:</strong> ${new Date().toLocaleDateString()}
                        </div>
                    </div>

                    <div class="stats">
                        <div class="card">
                            <h3>Total Spent</h3>
                            <p>BDT ${selectedCustomer.totalSpent.toLocaleString()}</p>
                        </div>
                        <div class="card">
                            <h3>Total Orders</h3>
                            <p>${selectedCustomer.orders}</p>
                        </div>
                        <div class="card">
                            <h3>Avg. Order Value</h3>
                            <p>BDT ${(selectedCustomer.totalSpent / (selectedCustomer.history.length || 1)).toFixed(0)}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th style="text-align: right">Amount (BDT)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedCustomer.history.map(tx => `
                                <tr>
                                    <td>#${tx.id.slice(0, 8)}</td>
                                    <td>${tx.date}</td>
                                    <td>${tx.items}</td>
                                    <td>${tx.status}</td>
                                    <td class="amount">${tx.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>Thank you for your business.</p>
                        <p>AstharHat Admin Panel Generated Report</p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers & Billing</h1>
                    <p className="text-gray-500">Manage customers and view their billing history.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Total Orders</th>
                                <th className="px-6 py-4">Lifetime Bill</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading customers...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No customers found.</td></tr>
                            ) : (
                                filteredCustomers.map((customer, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{customer.name}</p>
                                                    <p className="text-xs text-gray-500">Last Order: {customer.lastOrderDate.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 space-y-1">
                                            {customer.email && <div className="flex items-center gap-1.5 text-xs"><Mail size={12} /> {customer.email}</div>}
                                            {customer.phone && <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800"><Phone size={12} /> {customer.phone}</div>}
                                            {!customer.email && !customer.phone && <span className="text-gray-400 text-xs">No contact info</span>}
                                        </td>
                                        <td className="px-6 py-4 font-bold">{customer.orders} orders</td>
                                        <td className="px-6 py-4 font-mono font-bold text-green-600 text-base">৳ {customer.totalSpent.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenBannerModal(customer)}
                                                    className="text-purple-600 hover:text-purple-800 font-bold text-xs flex items-center justify-end gap-1 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
                                                    title="Personalize Banner"
                                                >
                                                    <Sparkles size={14} /> Personalize
                                                </button>
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center justify-end gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                                >
                                                    <Receipt size={14} /> View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Billing Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedCustomer(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <div className="flex justify-between items-start pr-12">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Receipt className="text-blue-600" />
                                        Billing History
                                    </h2>
                                    <p className="text-gray-500 mt-1">Transaction details for <span className="font-bold text-gray-900">{selectedCustomer.name}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrint}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                        title="Print Invoice"
                                    >
                                        <Printer size={20} />
                                    </button>
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                        title="Download CSV"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Spent</h3>
                                <p className="text-2xl font-extrabold text-blue-900">৳ {selectedCustomer.totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                                <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Total Orders</h3>
                                <p className="text-2xl font-extrabold text-green-900">{selectedCustomer.orders}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                                <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Avg. Order</h3>
                                <p className="text-2xl font-extrabold text-orange-900">৳ {(selectedCustomer.totalSpent / (selectedCustomer.history.length || 1)).toFixed(0)}</p>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-4">Recent Transactions</h3>
                        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Items Purchased</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedCustomer.history.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-mono">#{tx.id.slice(0, 8)}</td>
                                            <td className="px-4 py-3 text-gray-600">{tx.date}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{tx.items}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">৳ {tx.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2.5 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg">Close Details</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Personal Banner Modal */}
            {
                bannerModalOpen && bannerTargetCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
                        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setBannerModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="text-purple-600" />
                                    Personalize Banner
                                </h2>
                                <p className="text-gray-500 mt-1">
                                    Customize the 4 home page cards specifically for <span className="font-bold text-gray-900">{bannerTargetCustomer.name}</span>.
                                </p>
                            </div>

                            {loadingBanner ? (
                                <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-b-2 border-purple-600 rounded-full"></div></div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {personalStats.map((item, index) => (
                                            <div key={index} className="bg-purple-50 p-4 rounded-xl border border-purple-100 relative">
                                                <div className="absolute -top-3 left-4 bg-purple-900 text-white text-xs font-bold px-2 py-1 rounded">
                                                    Card {index + 1}
                                                </div>
                                                <div className="mt-2 space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                                                        <input
                                                            type="text"
                                                            value={item.title}
                                                            onChange={e => {
                                                                const newStats = [...personalStats];
                                                                newStats[index].title = e.target.value;
                                                                setPersonalStats(newStats);
                                                            }}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                                        <input
                                                            type="text"
                                                            value={item.desc}
                                                            onChange={e => {
                                                                const newStats = [...personalStats];
                                                                newStats[index].desc = e.target.value;
                                                                setPersonalStats(newStats);
                                                            }}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                        <button
                                            onClick={handleDeletePersonalBanner}
                                            className="text-red-600 hover:text-red-800 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} /> Reset to Default
                                        </button>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setBannerModalOpen(false)}
                                                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSavePersonalBanner}
                                                className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                                            >
                                                Save Personalization
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
