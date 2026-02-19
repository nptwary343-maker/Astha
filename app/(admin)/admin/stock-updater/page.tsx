'use client';

import { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    ChevronDown,
    Zap,
    RefreshCw
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    stock: number;
    price: number;
    category: string;
    images: string[];
    status: string;
}

export default function StockUpdaterPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "products"), orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = (id: string, newStock: number) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, stock: isNaN(newStock) ? 0 : newStock } : p
        ));
    };

    const updateStock = async (id: string, stock: number) => {
        if (!isAdmin) {
            alert("Security Error: Unauthorized access.");
            return;
        }

        setUpdatingId(id);
        try {
            const productRef = doc(db, "products", id);
            await updateDoc(productRef, {
                stock: stock,
                updatedAt: new Date().toISOString()
            });

            setSuccessId(id);
            setTimeout(() => setSuccessId(null), 3000);
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update stock.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-400 mb-2 hover:text-blue-300 transition-colors cursor-pointer group">
                        <Link href="/admin" className="flex items-center gap-2">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider">Back to Dashboard</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/10 p-2.5 rounded-2xl">
                            <Zap size={28} className="text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stock Updater</h1>
                    </div>
                    <p className="text-gray-500 text-sm pl-0.5 font-medium">Bulk manage your product inventory in real-time.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-50/50 pl-11 pr-5 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 text-sm w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all disabled:opacity-50 active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Inventory Overview (Subtle Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 bg-blue-50 w-24 h-24 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors"></div>
                    <div className="relative z-10">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 block">Total Items</span>
                        <div className="text-3xl font-black text-gray-900">{products.length}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 relative z-10">
                        <Package size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 bg-orange-50 w-24 h-24 rounded-full blur-3xl opacity-50 group-hover:bg-orange-100 transition-colors"></div>
                    <div className="relative z-10">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 block">Low Stock</span>
                        <div className="text-3xl font-black text-orange-600">{products.filter(p => p.stock < 10).length}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 relative z-10">
                        <AlertCircle size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 bg-emerald-50 w-24 h-24 rounded-full blur-3xl opacity-50 group-hover:bg-emerald-100 transition-colors"></div>
                    <div className="relative z-10">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 block">Healthy Stock</span>
                        <div className="text-3xl font-black text-emerald-600">{products.filter(p => p.stock >= 10).length}</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 relative z-10">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden relative backdrop-blur-3xl">
                {/* Header Background Glow */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none"></div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Product Details</th>
                                <th className="px-8 py-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Category</th>
                                <th className="px-8 py-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">In Stock</th>
                                <th className="px-8 py-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/80">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6" colSpan={4}>
                                            <div className="h-12 bg-gray-50 rounded-2xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-blue-50/20 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm rotate-1 group-hover:rotate-0 transition-transform duration-500">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><Package size={20} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{product.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 tracking-wider">ID: {product.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-gray-200/50">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <input
                                                    type="number"
                                                    value={product.stock}
                                                    onChange={(e) => handleStockChange(product.id, parseInt(e.target.value))}
                                                    className={`w-24 text-center py-2.5 rounded-2xl border-2 font-black text-lg transition-all focus:ring-4 focus:ring-blue-500/10 focus:outline-none 
                                                    ${product.stock < 10
                                                            ? 'border-orange-100 bg-orange-50/30 text-orange-600 focus:border-orange-400'
                                                            : 'border-blue-50 bg-blue-50/10 text-gray-800 focus:border-blue-400'}`}
                                                />
                                                <div className="flex flex-col text-[10px] font-bold text-gray-400">
                                                    <span>pcs</span>
                                                    {product.stock < 10 && <span className="text-orange-500 animate-pulse">Low!</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => updateStock(product.id, product.stock)}
                                                disabled={updatingId === product.id}
                                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50
                                                ${successId === product.id
                                                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200'
                                                        : 'bg-gray-900 hover:bg-blue-600 text-white shadow-xl hover:shadow-blue-200 shadow-gray-200'}`}
                                            >
                                                {updatingId === product.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : successId === product.id ? (
                                                    <CheckCircle2 size={16} />
                                                ) : (
                                                    <Save size={16} />
                                                )}
                                                <span>{successId === product.id ? 'Updated' : 'Save'}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                                <Package size={40} />
                                            </div>
                                            <h3 className="font-bold text-gray-900">No outcomes found</h3>
                                            <p className="text-gray-500 text-xs leading-relaxed">Try adjusting your search terms or refine your product filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Controls (Scenario: Bulk Save - Simplified for now) */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wide uppercase">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                        Live Connection to Matrix
                    </div>
                </div>
            </div>
        </div>
    );
}
