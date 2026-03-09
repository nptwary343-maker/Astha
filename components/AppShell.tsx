'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButtons from "./FloatingActionButtons";
import DynamicFooter from "./DynamicFooter";
import BottomNav from "./BottomNav";

import { motion, AnimatePresence } from 'framer-motion';
import MotionGraphics from './motion/MotionGraphics';

import MarqueeBar from '@/components/MarqueeBar';

import MobileMinimalistHeader from './MobileMinimalistView';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isStandalone = pathname?.startsWith('/admin') || pathname === '/login';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isStandalone) {
        return <>{children}</>;
    }

    return (
        <>
            <MotionGraphics />
            <MarqueeBar />

            {/* Desktop Header — show on all pages */}
            <div className="hidden md:block">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            {/* Mobile Header — hide on homepage (page.tsx has its own mobile search bar) */}
            {pathname !== '/' && (
                <>
                    <div className="md:hidden">
                        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                    </div>
                    <MobileMinimalistHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                </>
            )}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <BottomNav />
            <main className="pb-20 md:pb-0 min-h-screen transition-all duration-300 bg-[#f4f4f4] dark:bg-slate-950">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <FloatingActionButtons />
        </>
    );
}
