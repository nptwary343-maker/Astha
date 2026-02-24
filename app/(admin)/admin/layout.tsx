'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Protect Admin Route
        // 1. Check for legacy 'isMasterAdmin' flag (from standalone admin-login)
        const isMaster = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('isMasterAdmin') : null;

        if (!loading) {
            if (!isAdmin && isMaster !== 'true') {
                // If neither authenticator is valid, redirect to Admin Login
                router.push('/admin-login');
            } else {
                // Access Granted
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsLoading(false);
            }
        }
    }, [isAdmin, loading, router]);

    // 🛡️ AUTHENTICATION & MOUNT GUARD: Prevents hydration mismatch
    if (!mounted || loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
                        {!mounted ? "Initializing System" : "Verifying Integrity"}
                    </p>
                </div>
            </div>
        );
    }

    // Secondary Safety: Exit early if definitely not authorized (logic for when guards are complete)
    const isMaster = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('isMasterAdmin') === 'true';
    if (!isAdmin && !isMaster) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-500/20">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="p-4 md:p-8 md:ml-64 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
