export const runtime = 'edge';
// Force rebuild
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import RefundPolicyContent from '@/components/RefundPolicyContent';

export const metadata: Metadata = {
    title: 'Refund Policy | AstharHat',
    description: 'Read our refund and return policy.',
};

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-8 transition-colors font-medium">
                    <ArrowLeft size={18} /> Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 md:p-12 text-white text-center">
                        <div className="inline-block p-4 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
                            <ShieldCheck size={48} className="text-orange-400" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-4">Refund Policy</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                            Our commitment to transparency and customer satisfaction.
                        </p>
                    </div>

                    <div className="p-8 md:p-12">
                        <RefundPolicyContent />
                    </div>
                </div>
            </div>
        </div>
    );
}
