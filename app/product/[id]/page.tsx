import { Metadata, ResolvingMetadata } from 'next';
import { getCachedProductById, getSimilarProducts } from '@/lib/db-utils';
import ProductDetailClient from './ProductDetailClient';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    status: string;
    brand?: string;
    images: string[];
    description?: string;
    slug?: string;
    discountType?: 'PERCENT' | 'FIXED';
    discountValue?: number;
    discount?: {
        type: 'percent' | 'flat';
        value: number;
    } | null;
}

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    // Fetch data from CACHE (1-Hour)
    const product = await getCachedProductById(id) as any;

    if (!product) {
        return {
            title: 'Product Not Found',
        }
    }

    const previousImages = (await parent).openGraph?.images || []

    return {
        title: `${product.name} | AstharHat`,
        description: product.description?.substring(0, 160) || `Buy ${product.name} at the best price in Bangladesh from AstharHat.`,
        openGraph: {
            title: product.name,
            description: product.description?.substring(0, 160),
            images: [...product.images, ...previousImages],
        },
    }
}

import { permanentRedirect } from 'next/navigation';

export default async function Page({ params }: Props) {
    const { id } = await params;
    const product = await getCachedProductById(id) as Product | null;

    if (!product) {
        return <ProductDetailClient initialProduct={null} productId={id} similarProducts={[]} />;
    }

    const similarProducts = await getSimilarProducts(product.name, product.category, product.id) as Product[];

    // Calculate final price for Schema
    let finalPrice = product.price;

    if (product.discountType && product.discountValue) {
        if (product.discountType === 'PERCENT') {
            finalPrice = product.price - (product.price * (product.discountValue / 100));
        } else if (product.discountType === 'FIXED') {
            finalPrice = product.price - product.discountValue;
        }
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'AstharHat'
        },
        offers: {
            '@type': 'Offer',
            url: `https://astharhat.com/product/${product.slug || product.id}`,
            priceCurrency: 'BDT',
            price: finalPrice,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailClient
                initialProduct={product}
                productId={id}
                similarProducts={similarProducts}
            />
        </>
    );
}
