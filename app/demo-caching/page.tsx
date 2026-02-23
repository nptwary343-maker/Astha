export const runtime = 'edge';

const getFeaturedProducts = async () => {
    return [
        { id: '1', name: 'Organic Rice', price: 120 },
        { id: '2', name: 'Fresh Honey', price: 500 },
    ];
};

export default async function DemoCachingPage() {
    const products = await getFeaturedProducts();

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Cached Products (Demo)</h1>
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
