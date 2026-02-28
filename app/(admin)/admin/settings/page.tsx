'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Save, Lock, Globe, Bell, CreditCard, UserPlus, Trash2, Shield, UploadCloud, Image as ImageIcon, Loader, Facebook, Layout, Zap, Award, Check } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const { isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Security Check
    useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            router.push('/admin');
        }
    }, [isSuperAdmin, authLoading, router]);

    // Don't render until auth is done to prevent hydration mismatches or flashes
    if (authLoading) return <div className="p-8">Verifying access...</div>;
    if (!isSuperAdmin) return null;

    // FB Config
    const [fbConfigStr, setFbConfigStr] = useState('');

    // Security / Admins State
    const [admins, setAdmins] = useState<any[]>([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [newAdminSecurityKey, setNewAdminSecurityKey] = useState('');
    const [newAdminRole, setNewAdminRole] = useState('admin');

    // General Settings State
    const [storeName, setStoreName] = useState('AstharHat');
    const [storeEmail, setStoreEmail] = useState('support@astharhat.com');
    const [phone, setPhone] = useState('+8801900000000');
    const [address, setAddress] = useState('Dhaka, Bangladesh');
    const [logoUrl, setLogoUrl] = useState('');
    const [signatureUrl, setSignatureUrl] = useState('');
    const [established, setEstablished] = useState('EST. 2024');
    const [permalinkPrefix, setPermalinkPrefix] = useState('product');

    // Payment & Config
    const [shippingCost, setShippingCost] = useState('120');
    const [taxRate, setTaxRate] = useState('5');
    const [homeQr, setHomeQr] = useState('');
    const [bkashQr, setBkashQr] = useState('');
    const [bkashNumber, setBkashNumber] = useState('');

    // Content / Banner State
    const [bannerTitle, setBannerTitle] = useState('');
    const [bannerSubtitle, setBannerSubtitle] = useState('');
    const [bannerImage, setBannerImage] = useState('');
    const [bannerQrValue, setBannerQrValue] = useState('');
    const [bannerShowQr, setBannerShowQr] = useState(false);
    const [bannerShowTimer, setBannerShowTimer] = useState(false);
    const [bannerTimerEndTime, setBannerTimerEndTime] = useState('');

    const [bannerActive, setBannerActive] = useState(true);

    // Dynamic Stats State
    const [statsItems, setStatsItems] = useState([
        { title: '', desc: '' },
        { title: '', desc: '' },
        { title: '', desc: '' }
    ]);

    // Sync & Limits (Middle Layer)



    // Sync & Limits (Middle Layer)
    const [syncMode, setSyncMode] = useState(true);
    const [syncCooldown, setSyncCooldown] = useState(0); // Cooldown timer (Instruction 14)

    // Gemini Settings
    const [geminiPrimaryKey, setGeminiPrimaryKey] = useState('');
    const [geminiFailoverKey, setGeminiFailoverKey] = useState('');
    const [geminiProjectName, setGeminiProjectName] = useState('');
    const [geminiProjectNumber, setGeminiProjectNumber] = useState('');
    const [useFailover, setUseFailover] = useState(false);
    const [nsfwFilter, setNsfwFilter] = useState(true);

    // Developer Token State
    const [devToken, setDevToken] = useState('');
    const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
    const [tokenUsage, setTokenUsage] = useState(0);
    const [tokenEnabled, setTokenEnabled] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // 1. General Settings
                const generalRef = doc(db, 'settings', 'general');
                const generalSnap = await getDoc(generalRef);
                if (generalSnap.exists()) {
                    const data = generalSnap.data();
                    setStoreName(data.storeName || 'AstharHat');
                    setStoreEmail(data.storeEmail || 'support@astharhat.com');
                    setPhone(data.storePhone || '+8801900000000');
                    setAddress(data.storeAddress || 'Dhaka, Bangladesh');
                    setLogoUrl(data.logoUrl || '');
                    setSignatureUrl(data.signatureUrl || '');
                    setShippingCost(data.shippingCost || '120');
                    setTaxRate(data.taxRate || '5');
                    setHomeQr(data.homeQr || '');
                    setBkashQr(data.bkashQr || '');
                    setBkashNumber(data.bkashNumber || '');
                    setEstablished(data.established || 'EST. 2024');
                    setPermalinkPrefix(data.permalinkPrefix || 'product');
                }

                // 2. FB Config
                const fbRef = doc(db, 'settings', 'fb_config');
                const fbSnap = await getDoc(fbRef);
                if (fbSnap.exists()) {
                    const d = fbSnap.data();
                    setFbConfigStr(`${d.accessToken || ''}\n${d.adAccountId || ''}\n${d.pixelId || ''}`);
                }

                // 3. Hero Banner
                const bannerRef = doc(db, 'settings', 'hero-banner');
                const bannerSnap = await getDoc(bannerRef);
                if (bannerSnap.exists()) {
                    const b = bannerSnap.data();
                    setBannerTitle(b.title || '');
                    setBannerSubtitle(b.subtitle || '');
                    setBannerImage(b.backgroundImage || '');
                    setBannerQrValue(b.qrValue || '');
                    setBannerShowQr(b.showQr || false);
                    setBannerActive(b.isActive ?? true);
                    setBannerShowTimer(b.showTimer || false);
                    setBannerTimerEndTime(b.timerEndTime || '');
                }

                // 3b. Home Stats
                const statsRef = doc(db, 'settings', 'home-stats');
                const statsSnap = await getDoc(statsRef);
                if (statsSnap.exists()) {
                    setStatsItems(statsSnap.data().items || [
                        { title: '', desc: '' },
                        { title: '', desc: '' },
                        { title: '', desc: '' }
                    ]);
                }

                // 4. Gemini Config
                const geminiRef = doc(db, 'settings', 'gemini_config');
                const geminiSnap = await getDoc(geminiRef);
                if (geminiSnap.exists()) {
                    const g = geminiSnap.data();
                    setGeminiPrimaryKey(g.primaryKey || '');
                    setGeminiFailoverKey(g.failoverKey || '');
                    setGeminiProjectName(g.projectName || '');
                    setGeminiProjectNumber(g.projectNumber || '');
                    setUseFailover(g.useFailover || false);
                    setNsfwFilter(g.nsfwFilter ?? true);
                }

                // 5. Developer Config
                const devRef = doc(db, 'settings', 'dev_config');
                const devSnap = await getDoc(devRef);
                if (devSnap.exists()) {
                    const d = devSnap.data();
                    setDevToken(d.token || '');
                    setTokenExpiry(d.expiresAt || null);
                    setTokenUsage(d.usageCount || 0);
                    setTokenEnabled(d.isEnabled || false);
                }

                // 6. Order Limits & Sync (Middle Layer)
                const limitsRef = doc(db, 'settings', 'order_limits');
                const limitsSnap = await getDoc(limitsRef);
                if (limitsSnap.exists()) {
                    const l = limitsSnap.data();
                    setSyncMode(l.syncMode ?? true);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const [isTestingFb, setIsTestingFb] = useState(false);
    const [fbStatus, setFbStatus] = useState<any>(null);

    const testFacebookConnection = async () => {
        setIsTestingFb(true);
        setFbStatus(null);
        try {
            const lines = fbConfigStr.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length === 0) {
                setFbStatus({ success: false, message: "Please provide an access token." });
                return;
            }
            const token = lines[0];
            const res = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${token}`);
            const data = await res.json();

            if (data.error) {
                setFbStatus({ success: false, message: data.error.message });
            } else {
                setFbStatus({
                    success: true,
                    message: `Verified: ${data.name}`,
                    id: data.id
                });
            }
        } catch (e: any) {
            setFbStatus({ success: false, message: e.message });
        } finally {
            setIsTestingFb(false);
        }
    };

    const handleSaveGemini = async () => {
        try {
            await setDoc(doc(db, 'settings', 'gemini_config'), {
                primaryKey: geminiPrimaryKey,
                failoverKey: geminiFailoverKey,
                projectName: geminiProjectName,
                projectNumber: geminiProjectNumber,
                useFailover: useFailover,
                nsfwFilter: nsfwFilter
            });
            alert("Gemini AI Configuration Saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save Gemini config.");
        }
    };

    const handleSyncToggle = async () => {
        if (syncCooldown > 0) return;
        try {
            const newMode = !syncMode;
            setSyncMode(newMode);
            await setDoc(doc(db, 'settings', 'order_limits'), {
                syncMode: newMode,
                updatedBy: 'admin', // Ideally user email
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Start Cooldown (Instruction 14)
            setSyncCooldown(60);
            const timer = setInterval(() => {
                setSyncCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (e) {
            console.error(e);
            setSyncMode(!syncMode); // Revert on fail
            alert("Failed to update Sync Mode");
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'content', label: 'Home Content', icon: Layout },
        { id: 'payment', label: 'Payment & QR', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'sync', label: 'Sync & Performance', icon: Loader },
        { id: 'facebook', label: 'Facebook Ads', icon: Facebook },
        { id: 'gemini', label: 'Gemini AI', icon: Zap },
        { id: 'developer', label: 'Developer Access', icon: Shield },
    ];







    // Fetch Admins
    useEffect(() => {
        const q = query(collection(db, 'admin_users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);



    const handleFileUpload = async (file: File, path: string, setUrl: (url: string) => void) => {
        if (!file) return;
        try {
            setUploading(true);
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setUrl(url);
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error("Upload error:", error);
            alert('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!newAdminEmail || !newAdminPassword || !newAdminSecurityKey) {
            alert("Please fill in Email, Password, and Security Key.");
            return;
        }

        if (!/^\d+$/.test(newAdminSecurityKey)) {
            alert("Security Key must be numbers only.");
            return;
        }

        try {
            await setDoc(doc(db, 'admin_users', newAdminEmail), {
                email: newAdminEmail,
                password: newAdminPassword,
                securityKey: newAdminSecurityKey,
                role: newAdminRole,
                createdAt: new Date().toISOString()
            });
            setNewAdminEmail('');
            setNewAdminPassword('');
            setNewAdminSecurityKey('');
            setNewAdminRole('admin');
            alert('Admin user added successfully.');
        } catch (error) {
            console.error("Error adding admin:", error);
            alert('Failed to add admin.');
        }
    };

    const handleDeleteAdmin = async (email: string) => {
        if (confirm('Are you sure you want to remove this admin?')) {
            try {
                await deleteDoc(doc(db, 'admin_users', email));
            } catch (error) {
                console.error("Error deleting admin:", error);
            }
        }
    };

    const handleSave = async () => {
        try {
            const settingsData = {
                storeName,
                storeEmail,
                storePhone: phone,
                storeAddress: address,
                logoUrl,
                signatureUrl,
                shippingCost,
                taxRate,
                homeQr,
                bkashQr,
                bkashNumber,
                established,
                permalinkPrefix
            };

            await setDoc(doc(db, 'settings', 'general'), settingsData);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving settings:", error);
            alert('Failed to save settings.');
        }
    };

    const handleSaveFacebook = async () => {
        const lines = fbConfigStr.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) {
            alert("Invalid Format. Please provide:\nLine 1: Access Token\nLine 2: Ad Account ID");
            return;
        }
        const accessToken = lines[0];
        const adAccountId = lines[1];
        const pixelId = lines[2] || '';

        try {
            await setDoc(doc(db, 'settings', 'fb_config'), {
                accessToken,
                adAccountId,
                pixelId
            });
            alert("Facebook Keys & Pixel Saved Successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to save keys.");
        }
    };

    const handleSaveBanner = async () => {
        try {
            await setDoc(doc(db, 'settings', 'hero-banner'), {
                title: bannerTitle,
                subtitle: bannerSubtitle,
                backgroundImage: bannerImage,
                qrValue: bannerQrValue,
                showQr: bannerShowQr,
                showTimer: bannerShowTimer,
                timerEndTime: bannerTimerEndTime,
                isActive: bannerActive,
                gradientFrom: 'orange-600', // Default gradients if image missing
                gradientTo: 'purple-900',
                bgOpacity: 0.5
            });
            alert("Home Banner Settings Saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save banner.");
        }
    };

    const handleSaveStats = async () => {
        try {
            await setDoc(doc(db, 'settings', 'home-stats'), {
                items: statsItems
            });
            alert("Home Stats Saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save stats.");
        }
    };



    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your store preferences and account settings.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">General Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Logo Upload */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Store Logo</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative h-32 flex flex-col items-center justify-center group bg-gray-50/50">
                                        {!logoUrl && (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(file, `settings/logo-${Date.now()}`, setLogoUrl);
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                        )}
                                        {logoUrl ? (
                                            <div className="relative h-full w-full flex items-center justify-center">
                                                <img src={logoUrl} alt="Logo" className="h-full object-contain" />
                                                <button
                                                    onClick={() => setLogoUrl('')}
                                                    className="absolute top-0 right-0 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                {uploading ? <Loader className="animate-spin" /> : <UploadCloud size={24} />}
                                                <p className="text-xs mt-2 font-medium">Click to Upload Logo</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Signature Upload */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Authorized Signature</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative h-32 flex flex-col items-center justify-center group bg-gray-50/50">
                                        {!signatureUrl && (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(file, `settings/signature-${Date.now()}`, setSignatureUrl);
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                        )}
                                        {signatureUrl ? (
                                            <div className="relative h-full w-full flex items-center justify-center">
                                                <img src={signatureUrl} alt="Signature" className="h-full object-contain" />
                                                <button
                                                    onClick={() => setSignatureUrl('')}
                                                    className="absolute top-0 right-0 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                {uploading ? <Loader className="animate-spin" /> : <UploadCloud size={24} />}
                                                <p className="text-xs mt-2 font-medium">Upload Signature</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={storeEmail}
                                        onChange={(e) => setStoreEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Permalink Prefix (URL)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">domain.com/</span>
                                        <input
                                            type="text"
                                            className="w-full pl-24 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                            value={permalinkPrefix}
                                            onChange={(e) => setPermalinkPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            placeholder="product"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">This prefix will be used in all product URLs.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Established Text</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={established}
                                        onChange={(e) => setEstablished(e.target.value)}
                                        placeholder="EST. 2024"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Appears in footer and brand sections.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Store Address</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-20 resize-none"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Settings
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Home Page Banner</h2>

                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-800">Banner Visibility</h3>
                                    <p className="text-xs text-blue-600">Toggle "Super Deal" Banner on Home Page</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={bannerActive} onChange={e => setBannerActive(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Headline (Bangla Supported)</label>
                                    <input
                                        type="text"
                                        value={bannerTitle}
                                        onChange={e => setBannerTitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="e.g. Super Deal! 50% OFF"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle / Description</label>
                                    <textarea
                                        value={bannerSubtitle}
                                        onChange={e => setBannerSubtitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                        placeholder="e.g. Limited time offer on all premium headphones..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 border border-gray-100 p-3 rounded-xl bg-gray-50">
                                        <div className="flex-1">
                                            <span className="block text-sm font-bold text-gray-700">Show QR Code</span>
                                            <span className="text-xs text-gray-500">Display QR on banner?</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={bannerShowQr} onChange={e => setBannerShowQr(e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">QR Target URL / Text</label>
                                        <input
                                            type="text"
                                            value={bannerQrValue}
                                            onChange={e => setBannerQrValue(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                            placeholder="Enter URL or Text for QR..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4 border border-gray-100 p-3 rounded-xl bg-gray-50">
                                        <div className="flex-1">
                                            <span className="block text-sm font-bold text-gray-700">Show Flash Sale Timer</span>
                                            <span className="text-xs text-gray-500">Add urgency with a countdown</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={bannerShowTimer} onChange={e => setBannerShowTimer(e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Timer End Time (ISO / Date String)</label>
                                        <input
                                            type="datetime-local"
                                            value={bannerTimerEndTime}
                                            onChange={e => setBannerTimerEndTime(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">Format: 2026-12-31T23:59</p>
                                    </div>
                                </div>
                            </div>

                            {/* Background Image */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Background Image</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative h-40 flex flex-col items-center justify-center group bg-gray-50/50">
                                    {!bannerImage && (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, `hero/${Date.now()}`, setBannerImage);
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                    )}
                                    {bannerImage ? (
                                        <div className="relative h-full w-full flex items-center justify-center">
                                            <img src={bannerImage} alt="Banner" className="h-full object-cover rounded-lg" />
                                            <button
                                                onClick={() => setBannerImage('')}
                                                className="absolute top-0 right-0 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                                                title="Remove"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                            {uploading ? <Loader className="animate-spin" /> : <ImageIcon size={24} />}
                                            <p className="text-xs mt-2 font-medium">Upload Hero Image</p>
                                        </div>
                                    )}
                                </div>
                            </div>



                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleSaveBanner}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> Update Content
                                </button>
                            </div>
                        </div >
                    )
                    }

                    {
                        activeTab === 'payment' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Payment & Configuration</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Cost (৳)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                value={shippingCost}
                                                onChange={(e) => setShippingCost(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Home Scan QRCode</label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative h-32 flex flex-col items-center justify-center group bg-gray-50/50">
                                            {!homeQr && (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(file, `settings/home-qr-${Date.now()}`, setHomeQr);
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                            )}
                                            {homeQr ? (
                                                <div className="relative h-full w-full flex items-center justify-center">
                                                    <img src={homeQr} alt="Home QR" className="h-full object-contain" />
                                                    <button
                                                        onClick={() => setHomeQr('')}
                                                        className="absolute top-0 right-0 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                    {uploading ? <Loader className="animate-spin" /> : <UploadCloud size={24} />}
                                                    <p className="text-xs mt-2 font-medium">Upload Scan QR</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Bkash Personal/Agent Number</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="e.g. 019XXXXXXXX"
                                                value={bkashNumber}
                                                onChange={(e) => setBkashNumber(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Bkash Payment QR Code</label>
                                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative h-32 flex flex-col items-center justify-center group bg-gray-50/50">
                                                {!bkashQr && (
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleFileUpload(file, `settings/bkash-qr-${Date.now()}`, setBkashQr);
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    />
                                                )}
                                                {bkashQr ? (
                                                    <div className="relative h-full w-full flex items-center justify-center">
                                                        <img src={bkashQr} alt="Bkash QR" className="h-full object-contain" />
                                                        <button
                                                            onClick={() => setBkashQr('')}
                                                            className="absolute top-0 right-0 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                                                            title="Remove"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                        {uploading ? <Loader className="animate-spin" /> : <UploadCloud size={24} />}
                                                        <p className="text-xs mt-2 font-medium">Upload Payment QR</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6">
                                    <button
                                        onClick={handleSave}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                                    >
                                        <Save size={18} /> Save Settings
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Admin Access List</h2>
                                    <p className="text-sm text-gray-500 mb-6">Manage administrators who can access this dashboard. Passwords are hidden for security.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8 items-end">
                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Email (Login)</label>
                                            <input
                                                type="email"
                                                value={newAdminEmail}
                                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                                placeholder="admin@example.com"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Password</label>
                                            <input
                                                type="text"
                                                value={newAdminPassword}
                                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                                placeholder="Set Password"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Role</label>
                                            <select
                                                value={newAdminRole}
                                                onChange={(e) => setNewAdminRole(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="super admin">Super Admin</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-1">
                                            <button
                                                onClick={() => {
                                                    // Auto-fill dummy security key if empty, as per user request for "2 options"
                                                    if (!newAdminSecurityKey) setNewAdminSecurityKey('123456');
                                                    handleAddAdmin();
                                                }}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-sm h-[38px]"
                                            >
                                                <UserPlus size={16} /> Add Admin
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {admins.map((admin) => (
                                            <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{admin.email}</p>
                                                        <p className="text-xs text-gray-500 capitalize flex items-center gap-2">
                                                            <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{admin.role || 'Admin'}</span>
                                                            <span className="text-gray-400">• Password Hidden</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin.id)}
                                                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Admin (To reset password, remove and add again)"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        {admins.length === 0 && <p className="text-gray-400 text-center py-4">No admins found.</p>}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'facebook' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2 italic uppercase tracking-tighter"><Facebook size={20} className="text-blue-600" /> Facebook Marketing Integration</h2>

                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 font-mono text-[10px] uppercase text-gray-400">Environment Configuration</label>
                                        <div className="bg-black rounded-xl p-4 shadow-2xl relative group">
                                            <textarea
                                                value={fbConfigStr}
                                                onChange={(e) => setFbConfigStr(e.target.value)}
                                                className="w-full bg-transparent text-green-400 font-mono text-xs h-40 resize-none outline-none"
                                                placeholder="Line 1: Access Token&#10;Line 2: Ad Account ID&#10;Line 3: Pixel ID"
                                                spellCheck={false}
                                            />
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-gray-500 text-[8px] rounded font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                Meta Graph v20.0
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 italic px-1 flex items-center gap-1"><Zap size={10} /> Tip: Paste your long-lived access token, ad account id, and pixel id on separate lines.</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveFacebook}
                                            className="bg-blue-600 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <Save size={18} /> Update Keys
                                        </button>
                                        <button
                                            onClick={testFacebookConnection}
                                            disabled={isTestingFb || !fbConfigStr}
                                            className={`px-6 py-2.5 rounded-xl font-bold border transition-all flex items-center gap-2 ${fbStatus?.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {isTestingFb ? <Loader className="animate-spin" size={18} /> :
                                                fbStatus?.success ? <Check size={18} /> : <Zap size={18} />}
                                            {isTestingFb ? 'Testing...' : fbStatus?.success ? 'Connected' : 'Test Token'}
                                        </button>
                                    </div>

                                    {fbStatus && (
                                        <div className={`p-4 rounded-xl border text-xs font-medium animate-in slide-in-from-top-2 flex flex-col gap-1 ${fbStatus.success ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                            <div className="flex items-center gap-2">
                                                {fbStatus.success ? <Award size={14} /> : <Shield size={14} />}
                                                {fbStatus.message}
                                            </div>
                                            {fbStatus.id && <span className="block font-mono text-[10px] opacity-70 ml-5">Verified Page ID: {fbStatus.id}</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl italic text-sm text-blue-700 flex gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
                                        <Globe size={20} />
                                    </div>
                                    <p>
                                        "Facebook Conversion API (CAPI) helps you track events even when pixels are blocked by browser extensions or iOS privacy settings. This connection ensures your ads are measured accurately and ROI is tracked properly."
                                    </p>
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >
        </div >
    );
}
