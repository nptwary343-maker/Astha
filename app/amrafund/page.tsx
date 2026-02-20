import AmraFundLanding from '@/amrafund/components/LandingPage';

export const runtime = 'edge';

export const metadata = {
    title: 'E-Farming Partnership | Invest in Bangladesh\'s Future',
    description: 'Legally secure investment platform for agricultural and carbon projects in Bangladesh.',
};

export default function AmraFundPage() {
    return <AmraFundLanding />;
}
