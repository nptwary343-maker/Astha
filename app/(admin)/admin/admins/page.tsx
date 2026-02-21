'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Mail } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface AdminUser {
    id: string; // Document ID (usually email)
    name?: string;
    email: string;
    role: string;
    status?: string;
    lastActive?: string;
}

export default function AdminsPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'admin', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isSuperAdmin, user: currentUser } = useAuth();

    // Fetch Admins
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'admin_users'));
                const fetchedAdmins: AdminUser[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedAdmins.push({
                        id: doc.id,
                        name: data.name || 'Admin',
                        email: data.email || doc.id,
                        role: data.role || 'admin',
                        status: 'Active',
                        lastActive: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'N/A'
                    });
                });
                setAdmins(fetchedAdmins);
            } catch (error) {
                console.error("Error fetching admins:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    const handleAddAdmin = async () => {
        if (!isSuperAdmin) {
            alert("Security Violation: Only Super Admins can add new admins.");
            return;
        }
        if (!formData.email) return;
        setIsSubmitting(true);
        try {
            // Use Email as Document ID for compatibility with Fallback Login
            const adminId = formData.email.toLowerCase();
            const newAdminData = {
                name: formData.name,
                email: formData.email,
                role: formData.role, // 'admin', 'manager', etc.
                password: formData.password || '123456', // Default if empty
                createdAt: serverTimestamp()
            };

            await setDoc(doc(db, 'admin_users', adminId), newAdminData);

            // Update UI
            setAdmins([...admins, {
                id: adminId,
                ...newAdminData,
                status: 'Active',
                lastActive: 'Just now'
            }]);

            setIsModalOpen(false);
            setFormData({ name: '', email: '', role: 'admin', password: '' });
        } catch (error) {
            console.error("Error adding admin:", error);
            alert("Failed to add admin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!isSuperAdmin) {
            alert("Security Violation: Unauthorized operation.");
            return;
        }

        if (email === currentUser?.email) {
            alert("Security Check: You cannot remove your own admin access.");
            return;
        }

        if (confirm(`Remove admin access for ${email}?`)) {
            try {
                await deleteDoc(doc(db, 'admin_users', id));
                setAdmins(admins.filter(a => a.id !== id));
            } catch (error) {
                console.error("Error removing admin:", error);
                alert("Failed to remove admin.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
                    <p className="text-gray-500">Control access and permissions for the dashboard.</p>
                </div>
                {isSuperAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
                    >
                        <Plus size={18} /> Add New Admin
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Admin User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Registered</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading admins...</td></tr>
                        ) : admins.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-400">No admins found.</td></tr>
                        ) : (
                            admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase">
                                                {admin.name ? admin.name.charAt(0) : 'A'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{admin.name || 'Admin User'}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} /> {admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold border capitalize ${admin.role === 'super admin' || admin.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {admin.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{admin.lastActive}</td>
                                    <td className="px-6 py-4 text-right">
                                        {isSuperAdmin && admin.email !== currentUser?.email && (
                                            <button onClick={() => handleDelete(admin.id, admin.email)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative">
                        <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
                        <p className="text-gray-500 text-sm mb-6 mt-1">
                            They can login using this email via Google or Standard Login.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="new.admin@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="editor">Editor</option>
                                    <option value="support">Support</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Initial Password</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter initial password"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button disabled={isSubmitting} onClick={handleAddAdmin} className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors disabled:opacity-70">
                                {isSubmitting ? 'Adding...' : 'Add User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
