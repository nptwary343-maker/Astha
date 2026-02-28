export const runtime = 'edge';
import { Metadata, ResolvingMetadata } from 'next';
import { getCachedProductById } from '@/lib/db-utils';
import VerificationClient from './VerificationClient';
import { redirect } from 'next/navigation';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const product = await getCachedProductById(id) as any;

    if (!product) {
        return {
            title: 'Verification Not Found',
        }
    }

    return {
        title: `Quality Verification: ${product.name} | AstharHat`,
        description: `View the official transparency report, origin tracking, and expert verification details for ${product.name}.`,
    }
}

export default async function QualityVerificationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getCachedProductById(id) as any;

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md">
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Item Not Found</h1>
                    <p className="text-gray-500 mb-6">We couldn't locate the verification record for this item.</p>
                    <a href="/shop" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold inline-block hover:bg-blue-700">Back to Store</a>
                </div>
            </div>
        );
    }

    // Only show page if admin has enabled some transparency or expert verification features
    // Otherwise redirect backwards to product
    return <VerificationClient product={product} productId={id} />;
}
