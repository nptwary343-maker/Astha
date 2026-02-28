
'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit, Layout, Type, UploadCloud, X, Image as ImageIcon, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface Category {
    id: string;
    name: string;
    image: string;
    order: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Global Settings
    const [categoryShape, setCategoryShape] = useState('rounded'); // rounded, square, pill
    const [columnsMobile, setColumnsMobile] = useState(1);
    const [columnsDesktop, setColumnsDesktop] = useState(3);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        order: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catSnap = await getDocs(collection(db, 'categories'));
                const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setCategories(cats);

                // Fetch Settings
                const settingsSnap = await getDoc(doc(db, 'settings', 'category-display'));
                if (settingsSnap.exists()) {
                    const data = settingsSnap.data();
                    setCategoryShape(data.shape || 'rounded');
                    setColumnsMobile(data.columnsMobile || 1);
                    setColumnsDesktop(data.columnsDesktop || 3);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            await setDoc(doc(db, 'settings', 'category-display'), {
                shape: categoryShape,
                columnsMobile,
                columnsDesktop,
                updatedAt: new Date().toISOString()
            });
            alert('Display settings updated!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!formData.name) return alert('Name is required');
        setIsSavingCategory(true);
        try {
            if (editingId) {
                const docRef = doc(db, 'categories', editingId);
                await updateDoc(docRef, { ...formData });
                setCategories(categories.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
            } else {
                const docRef = await addDoc(collection(db, 'categories'), { ...formData });
                setCategories([...categories, { ...formData, id: docRef.id }].sort((a, b) => a.order - b.order));
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', image: '', order: categories.length });
        } catch (error) {
            console.error(error);
            alert('Failed to save category.');
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await deleteDoc(doc(db, 'categories', id));
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
            alert('Delete failed.');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setFormData({ ...formData, image: url });
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Categories...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit uppercase tracking-tighter italic">Category Management</h1>
                    <p className="text-sm text-gray-500">Control how categories look and which ones are displayed.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', image: '', order: categories.length });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Global Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2 italic uppercase tracking-tighter"><Layout size={18} /> Display Settings</h2>
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSavingSettings}
                                className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1"
                            >
                                {isSavingSettings ? '...' : <><Save size={16} /> Save</>}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Card Shape</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['rounded', 'square', 'pill'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setCategoryShape(s)}
                                            className={`py-2 rounded-xl border text-[10px] font-black uppercase tracking-tighter ${categoryShape === s ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Mobile Cols</label>
                                    <select
                                        value={columnsMobile}
                                        onChange={(e) => setColumnsMobile(parseInt(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                                    >
                                        <option value={1}>1 Column</option>
                                        <option value={2}>2 Columns</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Desktop Cols</label>
                                    <select
                                        value={columnsDesktop}
                                        onChange={(e) => setColumnsDesktop(parseInt(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                                    >
                                        <option value={2}>2 Columns</option>
                                        <option value={3}>3 Columns</option>
                                        <option value={4}>4 Columns</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 italic font-medium text-blue-700 text-sm">
                        "Category shapes and layouts define the visual rhythm of your store. Use 'Pill' for a soft, friendly brand, or 'Square' for high-end luxury minimalism."
                    </div>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2 px-2 uppercase tracking-tighter italic">Live Categories ({categories.length})</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <div key={cat.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                                <div className={`w-16 h-16 bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100 ${categoryShape === 'square' ? 'rounded-none' : categoryShape === 'pill' ? 'rounded-full' : 'rounded-2xl'}`}>
                                    {cat.image ? (
                                        <img src={cat.image} className="w-full h-full object-contain p-2" alt={cat.name} />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 font-outfit uppercase italic tracking-tighter">{cat.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order: {cat.order || 0}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingId(cat.id);
                                            setFormData({ name: cat.name, image: cat.image, order: cat.order || 0 });
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tighter italic">{editingId ? 'Edit Category' : 'New Category'}</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest px-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                    placeholder="e.g. Pure Honey"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest px-2">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest px-2">Category Icon / Image</label>
                                <div className="flex gap-4 items-center">
                                    <div className={`w-20 h-20 bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 ${categoryShape === 'square' ? 'rounded-none' : categoryShape === 'pill' ? 'rounded-full' : 'rounded-2xl'}`}>
                                        {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-contain p-2" /> : <ImageIcon className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                placeholder="Image URL..."
                                                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <label className="block w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors">
                                            {isUploading ? 'Uploading...' : 'Upload File'}
                                            <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveCategory}
                                disabled={isSavingCategory}
                                className="w-full bg-blue-600 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                {isSavingCategory ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Save Category</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

