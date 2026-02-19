import { unstable_cache } from 'next/cache';

// Simulate a database fetch (e.g., from Firebase)
const getFeaturedProducts = unstable_cache(
    async () => {
        console.log('Fetching form DB...'); // This should only run once per hour
        // In real app: const data = await db.collection('products').where('featured', '==', true).get();
        return [
            { id: '1', name: 'Organic Rice', price: 120 },
            { id: '2', name: 'Fresh Honey', price: 500 },
        ];
    },
    ['featured-products'], // Cache key
    { revalidate: 3600, tags: ['products'] } // Revalidate every hour
);

export default async function DemoCachingPage() {
    const products = await getFeaturedProducts();

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Cached Products (Heavy Caching Demo)</h1>
            <p className="mb-4 text-gray-600">
                This data is fetched once and cached for 1 hour. Subsequent page loads will NOT hit the database.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => (
                    <div key={p.id} className="border p-4 rounded shadow-sm">
                        <h2 className="font-semibold">{p.name}</h2>
                        <p>৳{p.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
