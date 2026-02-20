import InvestorDashboard from '@/amrafund/components/InvestorDashboard';

export const runtime = 'edge';

export const metadata = {
    title: 'Investor Dashboard | E-Farming Partnership',
    description: 'Manage your portfolio and legal documents in the secure portal.',
};

export default function AmraFundDashboardPage() {
    return <InvestorDashboard />;
}
