'use client';

import StatsGrid from '@/components/admin/dashboard/StatsGrid';
import ChartsSection from '@/components/admin/dashboard/ChartsSection';
import SalesAnalyticsTable from '@/components/admin/dashboard/SalesAnalyticsTable';
import AdminAIPanel from '@/components/AdminAIPanel';
import SystemHealthSignal from '@/components/admin/SystemHealthSignal';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Dashboard Content - Clean Rebuild */}
            <StatsGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ChartsSection />
                    <SalesAnalyticsTable />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <SystemHealthSignal />
                    <AdminAIPanel />
                </div>
            </div>
        </div>
    );
}
