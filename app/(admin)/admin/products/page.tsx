'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2, Edit, Filter, LayoutGrid, List, UploadCloud, Image as ImageIcon, X, Check, Link as LinkIcon, DollarSign, Percent, Zap, Lock as LockIcon, Loader2, FileText } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { deleteImagesFromCloudinary } from '@/actions/cloudinary';
import confetti from 'canvas-confetti';

// Types
type DiscountType = 'PERCENT' | 'FIXED';

interface Product {
    id: string; // Changed to string for Firestore ID
    name: string;
    price: number;
    stock: number;
    category: string;
    status: string;
    images: string[];
    description?: string;
    brand?: string;
    tax?: number;
    // New Standard Fields
    discountType?: DiscountType;
    discountValue?: number;
    // Legacy support (optional)
    discount?: {
        type: string;
        value: number;
    } | null;
    slug?: string;
    previousSlugs?: string[]; // History for Redirection
    isExpertVerified?: boolean;
    originDetails?: string;
    labReportUrl?: string;
    descriptionBn?: string;
    weightOptions?: { label: string, price: number }[];
}

const initialProducts: Product[] = []; // Empty, will load from Firebase

export default function ProductsPage() {
    // Data State
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isLoading, setIsLoading] = useState(true);
    const { isAdmin, isSuperAdmin } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch Products from Firebase
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as unknown as Product[];
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'description'>('general');

    // Form State
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [slugLocked, setSlugLocked] = useState(true); // Security Lock
    const [formData, setFormData] = useState<{
        name: string;
        slug: string;
        category: string;
        price: string;
        tax: string;
        stock: string;
        status: string;
        brand: string;
        description: string;
        images: [string, string];
        discountEnabled: boolean;
        discountType: DiscountType;
        discountValue: string;
        isExpertVerified: boolean;
        originDetails: string;
        labReportUrl: string;
        descriptionBn: string;
        weightOptions: { label: string, price: number }[];
    }>({
        name: '', slug: '', category: 'Electronics', price: '', tax: '0', stock: '', status: 'Active', brand: '', description: '',
        images: ['', ''], discountEnabled: false, discountType: 'PERCENT', discountValue: '',
        isExpertVerified: false, originDetails: '', labReportUrl: '',
        descriptionBn: '', weightOptions: [] as { label: string, price: number }[]
    });

    // Image Input Mode State (true = URL, false = Upload) for each slot
    const [imgInputMode, setImgInputMode] = useState<[boolean, boolean]>([false, false]);
    // Upload Loading State
    const [isUploading, setIsUploading] = useState<[boolean, boolean]>([false, false]);

    // Category State
    const [categories, setCategories] = useState(['Electronics', 'Fashion', 'Home', 'Furniture', 'Sports']);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAlgoliaSyncing, setIsAlgoliaSyncing] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);

    // --- Actions ---

    const handleDelete = async (id: string) => {
        // 🛡️ API Gatekeeping
        if (!isSuperAdmin) {
            alert("Security Violation: You do not have permission to delete products.");
            return;
        }

        if (confirm('Are you sure you want to delete this product?')) {
            try {
                // 1. Delete Images from Cloudinary (Added Logic)
                const productToDelete = products.find(p => p.id === id);
                if (productToDelete && productToDelete.images && productToDelete.images.length > 0) {
                    await deleteImagesFromCloudinary(productToDelete.images);
                }

                await deleteDoc(doc(db, "products", id));

                await deleteDoc(doc(db, "products", id));
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting product: ", error);
                alert("Failed to delete product.");
            }
        }
    };


    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setActiveTab('general');
        setSlugLocked(true); // Lock by default on edit
        setFormData({
            name: product.name,
            slug: product.slug || '', // Load existing
            category: product.category,
            price: product.price.toString(),
            tax: (product.tax || 0).toString(),
            stock: product.stock.toString(),
            status: product.status,
            brand: product.brand || '',
            description: product.description || '',
            images: [product.images[0] || '', product.images[1] || ''],
            discountEnabled: !!(product.discountValue || product.discount), // Check either
            discountType: (product.discountType as DiscountType) ||
                (product.discount?.type === 'flat' ? 'FIXED' : 'PERCENT'), // Normalizing legacy
            discountValue: (product.discountValue || product.discount?.value || '').toString(),
            isExpertVerified: product.isExpertVerified || false,
            originDetails: product.originDetails || '',
            labReportUrl: product.labReportUrl || '',
            descriptionBn: product.descriptionBn || '',
            weightOptions: product.weightOptions || []
        });
        // Determine input mode: if it looks like a blob/base64 (very long) or empty, maybe upload mode?
        // Actually, for editing, we usually want to show the current image. 
        // Let's default to "URL" mode (since Cloudinary URLs are URLs) but maybe we want a "Preview" mode?
        // Simpler: Just set to URL mode if there's a value, as our UI handles URLs well.
        setImgInputMode([!!product.images[0], !!product.images[1]]);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setActiveTab('general');
        setSlugLocked(false); // Helper for new products
        setFormData({
            name: '', slug: '', category: categories[0], price: '', tax: '0', stock: '', status: 'Active', brand: '', description: '',
            images: ['', ''], discountEnabled: false, discountType: 'PERCENT', discountValue: '',
            isExpertVerified: false, originDetails: '', labReportUrl: '',
            descriptionBn: '', weightOptions: []
        });
        setImgInputMode([false, false]);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        // 🛡️ API Gatekeeping
        if (!isAdmin) {
            alert("Security Violation: Unauthorized operation.");
            return;
        }

        // 1. Validate Slug
        const finalSlug = formData.slug || generateSlug(formData.name);
        if (!finalSlug) {
            alert("Product must have a valid URL Slug.");
            return;
        }

        // 2. Check Uniqueness (Collision Protection - Worst Case Management)
        const slugExists = products.some(p => p.slug === finalSlug && p.id !== editingId);
        if (slugExists) {
            alert(`URL Conflict: The slug "${finalSlug}" is already used by another product. Please change it.`);
            return;
        }

        // 3. Prepare Redirect History (Smart Handling)
        let previousSlugs = editingId
            ? (products.find(p => p.id === editingId)?.previousSlugs || [])
            : [];

        if (editingId) {
            const currentProduct = products.find(p => p.id === editingId);
            // If slug changed, save the old one for 301 Redirect
            if (currentProduct?.slug && currentProduct.slug !== finalSlug) {
                // Avoid duplicates and add unique old slug
                if (!previousSlugs.includes(currentProduct.slug)) {
                    previousSlugs = [...previousSlugs, currentProduct.slug];
                }
            }
        }

        const productData = {
            name: formData.name,
            slug: finalSlug,
            previousSlugs: previousSlugs, // Save History
            category: formData.category,
            price: parseFloat(formData.price) || 0,
            tax: parseFloat(formData.tax) || 0,
            stock: parseInt(formData.stock) || 0,
            status: formData.status,
            brand: formData.brand,
            description: formData.description,
            images: formData.images, // Now stores Cloudinary URLs
            discountType: formData.discountEnabled && formData.discountValue ? formData.discountType : null,
            discountValue: formData.discountEnabled && formData.discountValue ? parseFloat(formData.discountValue) : null,
            discount: null, // Clear legacy field explicitly
            isExpertVerified: formData.isExpertVerified,
            originDetails: formData.originDetails,
            labReportUrl: formData.labReportUrl,
            descriptionBn: formData.descriptionBn,
            weightOptions: formData.weightOptions,
            createdAt: new Date().toISOString(), // 🛡️ Fix: Add timestamp for sorting
            updatedAt: new Date().toISOString()
        };

        // --- Actions ---

        // ... logic ...
        try {
            if (editingId) {
                const productRef = doc(db, "products", editingId);
                await updateDoc(productRef, productData);

                setProducts(products.map(p => p.id === editingId ? { ...productData, id: editingId } as Product : p));
            } else {
                const docRef = await addDoc(collection(db, "products"), productData);

                setProducts([{ ...productData, id: docRef.id } as unknown as Product, ...products]);

                // 🎉 Coolness: Confetti!
                const end = Date.now() + 1000;
                const colors = ['#bb0000', '#ffffff'];
                (function frame() {
                    confetti({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors
                    });
                    confetti({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving product: ", error);
            alert("Failed to save product!");
        }
    };

    // --- Helpers ---

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: 0 | 1) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Set loading state for this slot
        setIsUploading(prev => {
            const newStatus = [...prev] as [boolean, boolean];
            newStatus[slotIndex] = true;
            return newStatus;
        });

        try {
            // Upload to Cloudinary (Compresses internally)
            const secureUrl = await uploadToCloudinary(file);

            // Update Form Data with URL
            setFormData(prev => {
                const newImages = [...prev.images] as [string, string];
                newImages[slotIndex] = secureUrl;
                return { ...prev, images: newImages };
            });

            // Switch to "URL" mode to show the preview
            setImgInputMode(prev => {
                const newModes = [...prev] as [boolean, boolean];
                newModes[slotIndex] = true;
                return newModes;
            });

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Image upload failed. Please try again.");
        } finally {
            // Reset loading state
            setIsUploading(prev => {
                const newStatus = [...prev] as [boolean, boolean];
                newStatus[slotIndex] = false;
                return newStatus;
            });
        }
    };

    const handleImageUrlChange = (val: string, slotIndex: 0 | 1) => {
        setFormData(prev => {
            const newImages = [...prev.images] as [string, string];
            newImages[slotIndex] = val;
            return { ...prev, images: newImages };
        });
    };

    const calculateFinalPrice = (price: number, product: Product) => {
        // New Standard
        if (product.discountValue && product.discountType) {
            if (product.discountType === 'PERCENT') return price - (price * (product.discountValue / 100));
            if (product.discountType === 'FIXED') return price - product.discountValue;
        }
        // Legacy Fallback
        if (product.discount) {
            if (product.discount.type === 'percent') return price - (price * (product.discount.value / 100));
            return price - product.discount.value;
        }
        return price;
    };

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')             // Replace spaces with -
            .replace(/[^\p{L}\p{N}\-]+/gu, '') // Keep Unicode letters, numbers, and hyphens (Bangla Support)
            .replace(/\-\-+/g, '-');          // Replace multiple - with single -
    };

    const handleNameChange = (val: string) => {
        const updates: any = { name: val };
        // Auto-generate slug if it's new and unlocked
        if (!editingId && !slugLocked) {
            updates.slug = generateSlug(val);
        }
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!mounted) return null;

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-mono text-xs animate-pulse uppercase tracking-[0.2em]">Assembling Warehouse Logic...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500">Manage your product catalog, prices, and discounts.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/revalidate?secret=asthar_secret_123&tag=homepage-products', { method: 'POST' });
                                if (res.ok) alert("Homepage Cache Updated Successfully! (3-Hour ISR Reset)");
                                else alert("Failed to update cache.");
                            } catch (err) {
                                alert("Error triggering revalidation.");
                            }
                        }}
                        className="bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl font-bold border border-orange-200 flex items-center gap-2 hover:bg-orange-200 transition-colors"
                        title="Force update homepage products cache"
                    >
                        <Zap size={18} /> Refresh Homepage
                    </button>
                    <button className="bg-white text-gray-700 px-4 py-2.5 rounded-xl font-bold border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Filter size={18} /> Filter
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                </div>
            </div>

            {/* List View */}
            {
                viewMode === 'list' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Image</th>
                                        <th className="px-6 py-4">Product Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {filteredProducts.map((product) => {
                                        const finalPrice = calculateFinalPrice(product.price, product);
                                        const hasDiscount = (product.discountValue && product.discountValue > 0) || (product.discount && product.discount.value > 0);

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative group">
                                                        {product.images[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                                                        )}
                                                        {product.images[1] && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border border-white" title="2 images"></div>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900">{product.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                                <td className="px-6 py-4 font-mono font-medium">
                                                    {hasDiscount ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-400 line-through text-xs">৳ {product.price}</span>
                                                            <span className="text-blue-600 font-bold">৳ {finalPrice.toFixed(0)}</span>
                                                        </div>
                                                    ) : (
                                                        <span>৳ {product.price}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{product.stock} units</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold 
                                                ${product.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                            product.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-red-100 text-red-700'}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit Product"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        )}
                                                        {isSuperAdmin && (
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Product (Super Admin Only)"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const finalPrice = calculateFinalPrice(product.price, product);
                            const hasDiscount = (product.discountValue && product.discountValue > 0) || (product.discount && product.discount.value > 0);

                            return (
                                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                                        {product.images[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <Package size={40} className="text-gray-300 group-hover:scale-110 transition-transform" />
                                        )}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                                            {product.images[1] && <div className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">+1 View</div>}
                                            {hasDiscount && (
                                                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                    {(product.discountType === 'PERCENT' || product.discount?.type === 'percent') ?
                                                        `-${product.discountValue || product.discount?.value}%` : 'SALE'}
                                                </div>
                                            )}
                                        </div>
                                        {isSuperAdmin && (
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 z-10"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            {hasDiscount && <span className="text-xs text-gray-400 line-through mr-1">৳ {product.price}</span>}
                                            <span className="font-bold text-lg text-blue-600">৳ {finalPrice.toFixed(0)}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 bg-gray-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            }

            {/* Add/Edit Product Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>

                            <div className="flex gap-4 border-b border-gray-100 mb-6">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`pb-2 text-sm font-bold transition-all ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    General Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-2 text-sm font-bold transition-all ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('transparency' as any)}
                                    className={`pb-2 text-sm font-bold transition-all ${activeTab as any === 'transparency' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Transparency
                                </button>
                            </div>

                            <div className="space-y-6">
                                {activeTab === 'general' ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                        {/* Category Selection */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                            <div className="flex gap-2">
                                                {isAddingCategory ? (
                                                    <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-left-2">
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            className="flex-1 px-4 py-2 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            placeholder="Enter new category name..."
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                if (newCategoryName.trim()) {
                                                                    setCategories([...categories, newCategoryName]);
                                                                    setFormData({ ...formData, category: newCategoryName });
                                                                    setNewCategoryName('');
                                                                    setIsAddingCategory(false);
                                                                }
                                                            }}
                                                            className="bg-green-500 text-white p-2 rounded-xl hover:bg-green-600"
                                                        >
                                                            <Check size={20} />
                                                        </button>
                                                        <button onClick={() => setIsAddingCategory(false)} className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-gray-200"><X size={20} /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <select
                                                            value={formData.category}
                                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        >
                                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <button
                                                            onClick={() => setIsAddingCategory(true)}
                                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-colors"
                                                            title="Add New Category"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Image Upload Section (2 Slots) */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-bold text-gray-700">Product Images</label>
                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold">Auto-Compress: WebP / 0.8q</span>
                                            </div>
                                            <div className="flex gap-4">
                                                {[0, 1].map((slotIdx) => {
                                                    const index = slotIdx as 0 | 1;
                                                    const preview = formData.images[index];
                                                    const isUrlMode = imgInputMode[index];
                                                    const uploading = isUploading[index];

                                                    return (
                                                        <div key={slotIdx} className="flex-1">
                                                            <div className="flex justify-center gap-2 mb-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setImgInputMode(prev => {
                                                                            const newModes = [...prev] as [boolean, boolean];
                                                                            newModes[index] = false;
                                                                            return newModes;
                                                                        });
                                                                    }}
                                                                    className={`p-1 rounded text-[10px] font-bold ${!isUrlMode ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                                                                > Upload</button>
                                                                <button
                                                                    onClick={() => {
                                                                        setImgInputMode(prev => {
                                                                            const newModes = [...prev] as [boolean, boolean];
                                                                            newModes[index] = true;
                                                                            return newModes;
                                                                        });
                                                                    }}
                                                                    className={`p-1 rounded text-[10px] font-bold ${isUrlMode ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                                                                >Link URL</button>
                                                            </div>

                                                            {isUrlMode ? (
                                                                <div className="w-36 h-36 rounded-2xl border-2 border-gray-200 flex flex-col items-center justify-center p-2 relative overflow-hidden bg-gray-50 mx-auto">
                                                                    {preview ? (
                                                                        <>
                                                                            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleImageUrlChange('', index)}
                                                                                className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5 text-white shadow-md hover:bg-red-600 z-10"
                                                                                title="Remove Image"
                                                                            ><Trash2 size={14} /></button>
                                                                        </>
                                                                    ) : (
                                                                        <div className="w-full">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Paste URL..."
                                                                                className="w-full text-xs p-1 border rounded"
                                                                                onBlur={(e) => handleImageUrlChange(e.target.value, index)}
                                                                            />
                                                                            <div className="text-[10px] text-center text-gray-400 mt-1">Paste Image Link</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className={`w-36 h-36 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden bg-gray-50 mx-auto
                                                            ${preview ? 'border-green-500' : 'border-gray-300'}`}>
                                                                    {uploading ? (
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <Loader2 className="animate-spin text-blue-500" size={24} />
                                                                            <span className="text-[10px] text-gray-500">Uploading...</span>
                                                                        </div>
                                                                    ) : preview ? (
                                                                        <>
                                                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setFormData(prev => {
                                                                                        const newImages = [...prev.images] as [string, string];
                                                                                        newImages[index] = '';
                                                                                        return { ...prev, images: newImages };
                                                                                    });
                                                                                }}
                                                                                className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5 text-white shadow-md hover:bg-red-600 z-10"
                                                                                title="Remove Image"
                                                                            ><Trash2 size={14} /></button>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-center p-4">
                                                                            {index === 0 ? <UploadCloud size={24} className="text-gray-400 mx-auto mb-2" /> : <ImageIcon size={24} className="text-gray-400 mx-auto mb-2" />}
                                                                            <span className="text-[10px] text-gray-500 font-medium">Click to Upload</span>
                                                                        </div>
                                                                    )}
                                                                    {!uploading && !preview && (
                                                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, index)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => handleNameChange(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Headphones"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Brand Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.brand}
                                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Samsung, Apple..."
                                                />
                                            </div>

                                            {/* Permalink Settings (Instruction: Security & Management) */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Permalink / URL Slug</label>
                                                <div className="flex gap-2">
                                                    <div className={`flex-1 flex items-center bg-gray-50 border rounded-xl px-4 py-2 ${slugLocked ? 'border-gray-200 text-gray-500' : 'border-blue-300 bg-white'}`}>
                                                        <span className="text-gray-400 text-xs mr-1">astharhat.com/product/</span>
                                                        <input
                                                            type="text"
                                                            value={formData.slug}
                                                            onChange={(e) => !slugLocked && setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                                            disabled={slugLocked}
                                                            className="flex-1 bg-transparent focus:outline-none font-mono text-sm font-bold text-gray-800"
                                                            placeholder="product-url-slug"
                                                        />
                                                        {slugLocked && <LockIcon size={14} className="text-gray-400" />}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (slugLocked) {
                                                                if (confirm("Warning: Changing the specific URL slug can break existing links (SEO). Are you sure?")) {
                                                                    setSlugLocked(false);
                                                                }
                                                            } else {
                                                                setSlugLocked(true);
                                                            }
                                                        }}
                                                        className={`p-2 rounded-xl border transition-all ${slugLocked ? 'bg-white border-gray-200 text-gray-400 hover:text-gray-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}
                                                        title={slugLocked ? "Unlock to Edit" : "Lock Slug"}
                                                    >
                                                        {slugLocked ? <LockIcon size={18} /> : <LinkIcon size={18} />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                                                    Safe-Guard: Only unlock if you need to fix a URL or resolve a conflict.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option>Active</option>
                                                    <option>Draft</option>
                                                    <option>Out of Stock</option>
                                                    <option>Low Stock</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Pricing & Stock */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Regular Price (BDT)</label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Tax (%)</label>
                                                <input
                                                    type="number"
                                                    value={formData.tax}
                                                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                                                <input
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="10"
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Short Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={2}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                                placeholder="Brief overview..."
                                            ></textarea>
                                        </div>

                                        {/* Discount Section */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.discountEnabled}
                                                        onChange={(e) => setFormData({ ...formData, discountEnabled: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    Enable Discount
                                                </label>
                                            </div>

                                            {formData.discountEnabled && (
                                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Discount Type</label>
                                                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                                            <button
                                                                onClick={() => setFormData({ ...formData, discountType: 'PERCENT' })}
                                                                className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${formData.discountType === 'PERCENT' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                                            >
                                                                <Percent size={14} /> Percentage
                                                            </button>
                                                            <button
                                                                onClick={() => setFormData({ ...formData, discountType: 'FIXED' })}
                                                                className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${formData.discountType === 'FIXED' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                                            >
                                                                <DollarSign size={14} /> Fixed Amount
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Discount Value</label>
                                                        <input
                                                            type="number"
                                                            value={formData.discountValue}
                                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            placeholder={formData.discountType === 'PERCENT' ? "e.g. 10 (for 10%)" : "e.g. 100 (for ৳100 off)"}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (activeTab as any) === 'transparency' ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-bold text-blue-900">Expert Verification</h4>
                                                    <p className="text-xs text-blue-700">Display "Expert Verified" badge on product page.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isExpertVerified}
                                                        onChange={(e) => setFormData({ ...formData, isExpertVerified: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-sm font-bold text-gray-700">Transparency Details (Origin/Tracing)</label>
                                                <textarea
                                                    value={formData.originDetails}
                                                    onChange={(e) => setFormData({ ...formData, originDetails: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="e.g. Sourced from organic farms in Sylhet, 100% Traceable..."
                                                ></textarea>
                                                <p className="text-[10px] text-gray-400 italic">
                                                    Note: This data will be used to generate the Tracing QR code system for customers.
                                                </p>
                                            </div>

                                            <div className="mt-8 space-y-4 pt-6 border-t border-blue-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                        <FileText size={18} />
                                                    </div>
                                                    <h4 className="font-bold text-blue-900">Lab Report / Certificate</h4>
                                                </div>
                                                <label className="block text-sm font-bold text-gray-700">Certification File URL</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={formData.labReportUrl}
                                                        onChange={(e) => setFormData({ ...formData, labReportUrl: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="https://example.com/report.pdf"
                                                    />
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                </div>
                                                <p className="text-[10px] text-gray-400">
                                                    Add a link to the official Lab Analysis or Quality Certificate for this product.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                        {/* Description Tab Content */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">English Description</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Enter English description..."
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1 italic text-blue-600">Bengali Description / বাংলায় বিস্তারিত</label>
                                                <textarea
                                                    value={formData.descriptionBn}
                                                    onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 rounded-xl border border-blue-100 bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="বাংলায় বিবরণ লিখুন..."
                                                ></textarea>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-bold text-gray-700">Weight/Variant Options</label>
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            weightOptions: [...formData.weightOptions, { label: '', price: 0 }]
                                                        })}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        <Plus size={14} /> Add Option
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {formData.weightOptions.map((opt, idx) => (
                                                        <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                                            <input
                                                                type="text"
                                                                value={opt.label}
                                                                placeholder="Label (e.g. 1kg)"
                                                                onChange={(e) => {
                                                                    const newOpts = [...formData.weightOptions];
                                                                    newOpts[idx].label = e.target.value;
                                                                    setFormData({ ...formData, weightOptions: newOpts });
                                                                }}
                                                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                                                            />
                                                            <input
                                                                type="number"
                                                                value={opt.price}
                                                                placeholder="Price"
                                                                onChange={(e) => {
                                                                    const newOpts = [...formData.weightOptions];
                                                                    newOpts[idx].price = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, weightOptions: newOpts });
                                                                }}
                                                                className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newOpts = formData.weightOptions.filter((_, i) => i !== idx);
                                                                    setFormData({ ...formData, weightOptions: newOpts });
                                                                }}
                                                                className="p-1 px-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {formData.weightOptions.length === 0 && (
                                                        <p className="text-[10px] text-gray-400 italic">No weight options added. Will use regular price.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 mt-8 pt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isUploading[0] || isUploading[1]}
                                    className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {editingId ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
