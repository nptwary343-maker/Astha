'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButtons from "./FloatingActionButtons";
import DynamicFooter from "./DynamicFooter";
import BottomNav from "./BottomNav";

import { m, AnimatePresence } from 'framer-motion';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
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
            <main className="pt-24 md:pt-32 min-h-screen transition-all duration-300 bg-[#f4f4f4] dark:bg-slate-950">
                <AnimatePresence mode="wait">
                    <m.div
                        key={pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {children}
                    </m.div>
                </AnimatePresence>
            </main>
            <FloatingActionButtons />
        </>
    );
}
