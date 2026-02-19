'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Save, X, Gift, Percent, DollarSign } from 'lucide-react';

interface SecretCoupon {
    id: string;
    code: string;
    discount: number;
    discountType: 'PERCENT' | 'FIXED';
    description: string;
    expiryDate?: string;
    minPurchase?: number;
    isActive: boolean;
    createdAt: any;
}

export default function SecretCouponsAdmin() {
    const [coupons, setCoupons] = useState<SecretCoupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<SecretCoupon | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        discount: 0,
        discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
        description: '',
        expiryDate: '',
        minPurchase: 0,
        isActive: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const q = query(collection(db, 'secret_coupons'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SecretCoupon[];
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCoupon) {
                // Update existing coupon
                await updateDoc(doc(db, 'secret_coupons', editingCoupon.id), {
                    ...formData,
                    code: formData.code.toUpperCase()
                });
            } else {
                // Create new coupon
                await addDoc(collection(db, 'secret_coupons'), {
                    ...formData,
                    code: formData.code.toUpperCase(),
                    createdAt: serverTimestamp()
                });
            }

            resetForm();
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert('Failed to save coupon');
        }
    };

    const handleEdit = (coupon: SecretCoupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            discount: coupon.discount,
            discountType: coupon.discountType,
            description: coupon.description,
            expiryDate: coupon.expiryDate || '',
            minPurchase: coupon.minPurchase || 0,
            isActive: coupon.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this secret coupon?')) return;

        try {
            await deleteDoc(doc(db, 'secret_coupons', id));
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('Failed to delete coupon');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discount: 0,
            discountType: 'PERCENT',
            description: '',
            expiryDate: '',
            minPurchase: 0,
            isActive: true
        });
        setEditingCoupon(null);
        setIsModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Gift className="text-orange-600" size={32} />
                        Secret Rewards Manager
                    </h1>
                    <p className="text-gray-500 mt-1">Create exclusive coupons for logged-in users</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus size={20} />
                    Add Secret Coupon
                </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-900 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-900 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-900 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-900 uppercase tracking-wider">Min Purchase</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-900 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-900 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-black text-sm bg-gray-100 px-3 py-1 rounded-lg">{coupon.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-orange-600">
                                            {coupon.discountType === 'PERCENT' ? `${coupon.discount}%` : `৳${coupon.discount}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{coupon.description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {coupon.minPurchase ? `৳${coupon.minPurchase}` : 'None'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No secret coupons yet. Create your first one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingCoupon ? 'Edit' : 'Create'} Secret Coupon
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Coupon Code *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono font-bold"
                                    placeholder="SECRET2024"
                                    required
                                />
                            </div>

                            {/* Discount Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENT' | 'FIXED' })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-bold"
                                    >
                                        <option value="PERCENT">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (৳)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-bold"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Special discount for our valued members"
                                    required
                                />
                            </div>

                            {/* Min Purchase & Expiry */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Min Purchase (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">
                                    Active (visible to users)
                                </label>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {editingCoupon ? 'Update' : 'Create'} Coupon
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
