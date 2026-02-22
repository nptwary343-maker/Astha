'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButtons from "./FloatingActionButtons";
import DynamicFooter from "./DynamicFooter";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Hide AppShell on admin routes and login page
    const isStandalone = pathname?.startsWith('/admin') || pathname === '/login';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isStandalone) {
        return <>{children}</>;
    }

    return (
        <>
            <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <BottomNav />
            <main className="pt-52 md:pt-48 min-h-screen transition-all duration-300">
                {children}
            </main>
            <FloatingActionButtons />
        </>
    );
}
