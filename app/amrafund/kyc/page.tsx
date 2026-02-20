export const runtime = 'edge';
import KYCVerification from '@/amrafund/components/KYCVerification';

export const metadata = {
  title: 'Identity Verification | E-Farming Partnership',
  description: 'Verify your ID to start investing legally in projects.',
};

export default function AmraFundKYCPage() {
  return <KYCVerification />;
}

