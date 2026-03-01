'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createOrderAction } from '@/actions/order-management';


import { Save, Plus, Trash2, Search, CreditCard, User, ShoppingBag, ShoppingCart as ShoppingCartIcon, Truck, Printer } from 'lucide-react';

export default function ManualOrderPage() {
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });
    const [deliveryMan, setDeliveryMan] = useState('');
    const [orderItems, setOrderItems] = useState<{ id: number; name: string; price: number; qty: number }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentDetails, setPaymentDetails] = useState({ method: 'Cash', status: 'Pending', paidAmount: 0 });
    const [taxRate, setTaxRate] = useState(5);
    const [shippingCost, setShippingCost] = useState(0);
    const [customItem, setCustomItem] = useState({ name: '', price: '' });
    const [invoiceNumber, setInvoiceNumber] = useState(() => Date.now().toString().slice(-6));
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [terms, setTerms] = useState('Goods once sold can be returned within 7 days with original receipt. Warranty claims as per manufacturer policy.');

    // Store Settings
    const [settings, setSettings] = useState({
        storeName: 'AstharHat',
        storeAddress: 'Dhaka, Bangladesh',
        storeEmail: 'support@astharhat.com',
        storePhone: '+880 1234 5678',
        logoUrl: '',
        signatureUrl: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSettings({
                        storeName: data.storeName || 'AstharHat',
                        storeAddress: data.storeAddress || 'Dhaka, Bangladesh',
                        storeEmail: data.storeEmail || 'support@astharhat.com',
                        storePhone: data.storePhone || '+880 1234 5678',
                        logoUrl: data.logoUrl || '',
                        signatureUrl: data.signatureUrl || ''
                    });
                    // Also update defaults if needed
                    if (data.taxRate) setTaxRate(Number(data.taxRate));
                    if (data.shippingCost) setShippingCost(Number(data.shippingCost));
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // Real Product Database
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        };
        fetchProducts();
    }, []);

    const handleAddItem = (product: any) => {
        const existing = orderItems.find(item => item.id === product.id);
        if (existing) {
            setOrderItems(orderItems.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setOrderItems([...orderItems, { ...product, qty: 1 }]);
        }
    };

    const handleRemoveItem = (id: number) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    };

    const handleUpdateQty = (id: number, delta: number) => {
        setOrderItems(orderItems.map(item => {
            if (item.id === id) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        }));
    };

    const handleAddCustomItem = () => {
        if (!customItem.name || !customItem.price) return;
        const newItem = {

            id: Date.now(),
            name: customItem.name,
            price: parseFloat(customItem.price),
            qty: 1
        };
        setOrderItems([...orderItems, newItem]);
        setCustomItem({ name: '', price: '' });
    };

    const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * (taxRate / 100));
    const total = subtotal + tax + shippingCost;
    const due = total - paymentDetails.paidAmount;

    const handleConfirmOrder = () => {
        // Validation: Check if there is a pending custom item being typed but not added
        if (orderItems.length === 0 && customItem.name && customItem.price) {
            // Auto-add the item if the user forgot to click "+"
            const newItem = {
                // eslint-disable-next-line
                id: Date.now(),
                name: customItem.name,
                price: parseFloat(customItem.price),
                qty: 1
            };
            // Use the new item for the order immediately (but we can't update state synchronously and read it back, so we use a variable)
            const finalItems = [newItem];

            // Proceed with confirmation using finalItems
            confirmOrder(finalItems);

            // Clear inputs
            setCustomItem({ name: '', price: '' });
            setOrderItems([]); // Clear cart (visual)
            return;
        }

        if (orderItems.length === 0) {
            alert("Your cart is empty! Please add items to the cart first.\n\nTip: If you typed a custom item, click the small (+) button to add it.");
            return;
        }

        confirmOrder(orderItems);
    };

    const confirmOrder = async (items: typeof orderItems) => {
        if (!customer.name) {
            alert("Please enter customer name.");
            return;
        }

        try {
            // Calculate totals for the specific items passed (in case of auto-add)
            const currentSubtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const currentTax = Math.round(currentSubtotal * (taxRate / 100));
            const currentTotal = currentSubtotal + currentTax + shippingCost;
            const currentDue = currentTotal - paymentDetails.paidAmount;

            // Preparation of Order Data
            const orderPayload = {
                invoiceNumber,
                customer,
                items: items,
                payment: paymentDetails,
                totals: { subtotal: currentSubtotal, tax: currentTax, shippingCost, total: currentTotal, due: currentDue },
                date: new Date(invoiceDate).toISOString(),
                createdAt: new Date().toISOString(),
                status: paymentDetails.status,
                orderStatus: 'Pending', // New field for consistency
                source: 'manual',
                deliveryMan,
                settings: {
                    storeName: settings.storeName,
                    storeAddress: settings.storeAddress,
                    logoUrl: settings.logoUrl,
                    terms
                }
            };

            // Process through Server Action
            const actionResult = await createOrderAction(orderPayload);

            if (!actionResult.success) {
                throw new Error(actionResult.error || "Failed to save order");
            }

            console.log("Order Confirmed & Saved:", orderPayload);
            alert("Order Confirmed & Saved Successfully!");


            // Reset form
            setOrderItems([]);
            setCustomer({ name: '', phone: '', email: '', address: '' });
            setPaymentDetails({ method: 'Cash', status: 'Pending', paidAmount: 0 });
            setShippingCost(0);
            setCustomItem({ name: '', price: '' });
            // Regenerate random ID for next order
            setInvoiceNumber(Date.now().toString().slice(-6));
            setInvoiceDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error("Error saving order:", error);
            alert("Failed to save order. Please try again.");
        }
    };

    return (

        <>
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in duration-500 print:hidden">
                {/* Left Column: Product Selection */}
                <div className="lg:w-2/3 flex flex-col gap-6">
                    {/* Search Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                        <Search className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products by name or SKU..."
                            className="flex-1 outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4 flex-1 h-[400px]">
                        {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                            <button
                                key={product.id}
                                onClick={() => handleAddItem(product)}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col justify-between h-32 group"
                            >
                                <span className="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{product.name}</span>
                                <span className="text-orange-600 font-bold">৳{product.price.toLocaleString()}</span>
                            </button>
                        ))}

                    </div>

                    {/* Invoice Settings (Terms & Logo) */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-auto space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Logo URL (Override)</label>
                            <input
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.logoUrl}
                                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Invoice Terms & Conditions</label>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-16"
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Cart & Customer Info */}
                <div className="lg:w-1/3 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag size={18} /> New Manual Order
                        </h2>
                    </div>

                    {/* Customer Info Form */}
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Invoice ID</label>
                                <input
                                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
                            <User size={16} /> Customer Details
                        </div>
                        <input
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Customer Name (Walking Customer)"
                            value={customer.name}
                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                        />
                        <input
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Phone Number"
                            value={customer.phone}
                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                        />

                        {/* Delivery Man Selection */}
                        <div className="pt-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
                                <Truck size={16} /> Assign Delivery Man
                            </div>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={deliveryMan}
                                onChange={e => setDeliveryMan(e.target.value)}
                            >
                                <option value="">Select Delivery Man...</option>
                                <option value="1">Rahim Uddin (017...)</option>
                                <option value="2">Karim Ahmed (019...)</option>
                                <option value="3">Sujon Khan (018...)</option>
                                <option value="other">Other / 3rd Party</option>
                            </select>
                        </div>

                        {/* Quick Add Custom Item */}
                        <div className="pt-2 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
                                <Plus size={16} /> Quick Add Item
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Item Name"
                                    value={customItem.name}
                                    onChange={e => setCustomItem({ ...customItem, name: e.target.value })}
                                />
                                <input
                                    type="number"
                                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Price"
                                    value={customItem.price}
                                    onChange={e => setCustomItem({ ...customItem, price: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                                />
                                <button
                                    onClick={handleAddCustomItem}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Items List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {orderItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                                <ShoppingCartIcon size={48} />
                                <p className="text-sm">Cart is empty</p>
                            </div>
                        ) : (
                            orderItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm group">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500">৳{item.price} x {item.qty}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">৳{item.price * item.qty}</p>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Payment & Totals */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Subtotal</span>
                                <span>৳{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span className="flex items-center gap-1">Tax (%) <input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    className="w-12 px-1 py-0.5 border rounded text-xs font-bold text-center focus:outline-none focus:border-blue-500"
                                /></span>
                                <span>৳{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span className="flex items-center gap-1">Shipping <input
                                    type="number"
                                    value={shippingCost}
                                    onChange={(e) => setShippingCost(Number(e.target.value))}
                                    className="w-16 px-1 py-0.5 border rounded text-xs font-bold text-center focus:outline-none focus:border-blue-500"
                                /></span>
                                <span>৳{shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>৳{total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Payment Setup */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                                <select
                                    value={paymentDetails.status}
                                    onChange={e => setPaymentDetails({ ...paymentDetails, status: e.target.value })}
                                    className={`w-full text-sm rounded-lg border px-2 py-2 font-bold outline-none ${paymentDetails.status === 'Paid' ? 'bg-green-100 border-green-200 text-green-700' :
                                        paymentDetails.status === 'Pending' ? 'bg-yellow-100 border-yellow-200 text-yellow-700' :
                                            'bg-red-100 border-red-200 text-red-700'
                                        }`}
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Partially Paid">Partially Paid</option>
                                    <option value="Pending">Unpaid / Pending</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Method</label>
                                <select
                                    value={paymentDetails.method}
                                    onChange={e => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
                                    className="w-full bg-white text-sm rounded-lg border border-gray-200 px-2 py-2 outline-none focus:border-blue-500"
                                >
                                    <option>Cash</option>
                                    <option>Card</option>
                                    <option>Bkash</option>
                                    <option>Nagad</option>
                                    <option>Rocket</option>
                                    <option>Bank Transfer</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Printer size={18} />
                                Print
                            </button>
                            <button
                                onClick={handleConfirmOrder}
                                className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                            >
                                <CreditCard size={18} />
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Printable Invoice (Modern & Colorful) */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 text-gray-900 font-sans">
                {/* Top Colored Bar */}
                <div className="h-4 bg-blue-600 w-full print:bg-blue-600"></div>

                <div className="w-full h-full flex flex-col p-12 max-w-[210mm] mx-auto bg-white">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex flex-col">
                            {/* Logo */}
                            <div className="flex items-center gap-3 mb-6">
                                {settings.logoUrl ? (
                                    <img src={settings.logoUrl} alt="Logo" className="h-14 object-contain" />
                                ) : (
                                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-sm print:bg-blue-600 print:text-white">
                                        {settings.storeName.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 block leading-none">{settings.storeName}</span>
                                    <span className="text-xs text-blue-600 font-bold uppercase tracking-widest print:text-blue-600">Official Invoice</span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 space-y-1.5 font-medium">
                                <p className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> {settings.storeAddress}</p>
                                <p className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> {settings.storeEmail}</p>
                                <p className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> {settings.storePhone}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <h1 className="text-6xl font-black text-blue-600 mb-2 tracking-tighter print:text-blue-600">INVOICE</h1>

                            <div className="inline-block bg-blue-50 rounded-xl p-4 border border-blue-100 text-right min-w-[200px] print:bg-blue-50 print:border-blue-100">
                                <div className="mb-2">
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Invoice Number</p>
                                    <p className="text-xl font-bold text-slate-800">#{invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Date Issued</p>
                                    <p className="font-medium text-slate-700">{new Date(invoiceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To & Details Grid */}
                    <div className="flex gap-12 mb-10">
                        <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 border border-gray-100 print:bg-gray-50 print:border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 print:bg-blue-100 print:text-blue-600">
                                    <User size={14} />
                                </div>
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Bill To</h3>
                            </div>
                            <div className="pl-9">
                                <p className="text-lg font-bold text-gray-900">{customer.name || 'Walking Customer'}</p>
                                <p className="text-sm text-gray-600 font-medium mt-0.5">{customer.phone}</p>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{customer.address || 'No address provided'}</p>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100 flex flex-col justify-center print:bg-blue-50 print:border-blue-100">
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Payment Method</p>
                                <p className="text-base font-bold text-gray-900">{paymentDetails.method}</p>
                            </div>
                            <div className="bg-purple-50/30 rounded-2xl p-4 border border-purple-100 flex flex-col justify-center print:bg-purple-50 print:border-purple-100">
                                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest mb-1">Status</p>
                                <p className={`text-base font-bold ${paymentDetails.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>{paymentDetails.status}</p>
                            </div>
                            <div className="bg-orange-50/30 rounded-2xl p-4 border border-orange-100 flex flex-col justify-center col-span-2 print:bg-orange-50 print:border-orange-100">
                                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-1">Served By</p>
                                <p className="text-base font-bold text-gray-900">{deliveryMan ? `Delivery Man #${deliveryMan}` : 'Administrator'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-8 rounded-2xl overflow-hidden border border-blue-100 print:border-blue-100">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white print:bg-blue-600 print:text-white">
                                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider w-1/2">Item Description</th>
                                    <th className="py-4 px-4 text-center text-xs font-bold uppercase tracking-wider">Qty</th>
                                    <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Unit Price</th>
                                    <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm bg-white">
                                {orderItems.map((item, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-gray-50'}>
                                        <td className="py-4 px-6 font-bold text-gray-800">{item.name}</td>
                                        <td className="py-4 px-4 text-center font-medium text-gray-600">{item.qty}</td>
                                        <td className="py-4 px-6 text-right font-medium text-gray-600">৳{item.price.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-right font-bold text-gray-900">৳{(item.price * item.qty).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {/* Empty Rows Filler */}
                                {orderItems.length < 5 && Array.from({ length: 5 - orderItems.length }).map((_, i) => (
                                    <tr key={`empty-${i}`} className="h-16"><td colSpan={4}></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-16">
                        <div className="w-96 bg-gray-50 rounded-2xl p-6 print:bg-gray-50">
                            <div className="space-y-3 pb-6 border-b border-gray-200 border-dashed">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Tax ({taxRate}%)</span>
                                    <span className="font-bold text-gray-900">৳{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Shipping</span>
                                    <span className="font-bold text-gray-900">৳{shippingCost.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-4 border-t border-blue-100">
                                <span className="text-xl font-bold text-slate-800">Grand Total</span>
                                <span className="text-2xl font-black text-indigo-600 print:text-indigo-600">৳{total.toLocaleString()}</span>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-sm py-2 px-3 bg-white rounded-lg border border-gray-100">
                                    <span className="text-gray-500 font-bold">Paid Amount</span>
                                    <span className="font-bold text-green-600">৳{paymentDetails.paidAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 px-3 bg-red-50 rounded-lg border border-red-100 print:bg-red-50 print:border-red-100">
                                    <span className="text-red-800 font-bold">Due Balance</span>
                                    <span className="font-bold text-red-600">৳{due.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto">
                        <div className="flex justify-between items-end pb-8">
                            <div className="text-xs text-gray-400 max-w-sm">
                                <p className="font-bold text-gray-900 uppercase mb-2">Terms & Conditions</p>
                                <p className="leading-relaxed whitespace-pre-wrap">{terms}</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 flex items-end justify-center mb-2">
                                    {settings.signatureUrl && (
                                        <img src={settings.signatureUrl} alt="Signature" className="h-16 object-contain" />
                                    )}
                                </div>
                                <div className="border-t-2 border-slate-900 w-48 mx-auto mb-2"></div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Authorized Signature</p>
                            </div>
                        </div>

                        {/* Bottom decorative bar */}
                        <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-full print:bg-blue-600"></div>
                        <p className="text-center text-[10px] text-gray-400 mt-2">Generated by AstharHat Admin System</p>
                    </div>
                </div>
            </div>
        </>
    );
}
