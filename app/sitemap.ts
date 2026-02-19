import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs, limit, query } from 'firebase/firestore'

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://astharhat.com'

    // Static routes
    const routes = [
        '',
        '/shop',
        '/about',
        '/tracking',
        '/login',
        '/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Product routes
    let productUrls: MetadataRoute.Sitemap = [];

    try {
        const productsQuery = query(collection(db, 'products'), limit(100));
        const snapshot = await getDocs(productsQuery);

        productUrls = snapshot.docs.map((doc) => ({
            url: `${baseUrl}/product/${doc.id}`,
            lastModified: new Date(), // Ideally use a field from doc like 'updatedAt'
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error("Error generating sitemap products:", error);
    }

    return [...routes, ...productUrls]
}
