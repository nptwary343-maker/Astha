'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    MonitorPlay,
    FileText,
    Upload,
    LogOut,
    ChevronRight,
    ShieldCheck,
    Settings,
    Bell,
    Info,
    X,
    CreditCard,
    Search,
    Calculator,
    Megaphone,
    Zap,
    LayoutList,
    Award,
    Code,
    Ticket,
    Sparkles
} from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { role } = useAuth(); // Get role from context
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    // super_admin: Everything
    // admin: Everything except Settings & Sensitive System Actions
    // manager: Operational tasks only (Orders, Products, Customers)

    const allMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Orders', icon: ShoppingCart, href: '/admin/orders', badge: '12', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Invoices', icon: FileText, href: '/admin/invoices', allowed: ['super_admin', 'admin'] },
        { name: 'Manual Order / POS', icon: CreditCard, href: '/admin/manual-orders', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Products', icon: Package, href: '/admin/products', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Stock Updater', icon: Zap, href: '/admin/stock-updater', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Customers', icon: Users, href: '/admin/customers', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Ads/Banners', icon: MonitorPlay, href: '/admin/banners', allowed: ['super_admin', 'admin'] },
        { name: 'Banner Injector', icon: Code, href: '/admin/banner-injector', allowed: ['super_admin'] },
        { name: 'About Content', icon: Info, href: '/admin/about', allowed: ['super_admin', 'admin'] },
        { name: 'Order Tracking', icon: Search, href: '/admin/tracking', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Reports', icon: FileText, href: '/admin/reports', allowed: ['super_admin', 'admin'] },
        { name: 'Calculation', icon: Calculator, href: '/admin/calculation', allowed: ['super_admin', 'admin'] },
        { name: 'Import Data', icon: Upload, href: '/admin/import', allowed: ['super_admin', 'admin'] },
        { name: 'Assign Delivery', icon: Users, href: '/admin/assign', badge: '5', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Notifications', icon: Bell, href: '/admin/notifications', badge: '3', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Launch Ad', icon: Megaphone, href: '/admin/create-ad', badge: 'New', allowed: ['super_admin', 'admin'] },
        { name: 'Flash Sale', icon: Zap, href: '/admin/flash-sale', allowed: ['super_admin', 'admin'] },
        { name: 'Footer Manager', icon: Award, href: '/admin/footer-manager', allowed: ['super_admin'] },
        { name: 'Coupon Manager', icon: Ticket, href: '/admin/coupons/create', allowed: ['super_admin', 'admin'] },
        { name: 'Refund Policy', icon: ShieldCheck, href: '/admin/refund-policy', allowed: ['super_admin', 'admin', 'manager'] },
        { name: 'Settings', icon: Settings, href: '/admin/settings', allowed: ['super_admin'] },
        { name: 'User Management', icon: Users, href: '/admin/admins', allowed: ['super_admin'] },
        { name: 'Email Manager', icon: FileText, href: '/admin/emails', allowed: ['super_admin'] },
    ];

    // Filter items based on current role
    // If role is undefined/loading, show nothing or minimal. 
    // AuthContext defaults role to 'user' if not admin, but Middleware protects this page.
    const menuItems = allMenuItems.filter(item => item.allowed.includes(role || ''));

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`w-64 ${theme === 'dark' ? 'bg-[#1e1e2d] text-white' : 'bg-white text-gray-900 border-r border-gray-100'} h-screen fixed left-0 top-0 overflow-y-auto z-50 flex flex-col scrollbar-thin transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center gap-3 shrink-0 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                            A
                        </div>
                        <div>
                            <h1 className={`font-bold text-lg leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AstharHat</h1>
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Admin Panel</span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                    <ChevronRight className="ml-auto text-gray-500 hidden md:block" size={16} />
                </div>

                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto shrink-0">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isActive
                                    ? (theme === 'dark' ? 'bg-[#2a2a3c] text-blue-400 border-l-4 border-blue-500 font-medium' : 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium')
                                    : (theme === 'dark' ? 'text-gray-400 hover:bg-[#2a2a3c] hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600')
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className={isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-white'} />
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-white'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} shrink-0 space-y-1`}>
                    <Link
                        href="/"
                        className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#2a2a3c]' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'} transition-all w-full px-3 py-2 rounded-lg`}
                    >
                        <ShoppingCart size={20} />
                        <span className="text-sm font-medium">Visit Shop</span>
                    </Link>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('isMasterAdmin');
                            sessionStorage.removeItem('adminUserEmail');
                            window.location.href = '/admin-login';
                        }}
                        className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-red-600'} transition-colors w-full px-3 py-2 text-left`}
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
