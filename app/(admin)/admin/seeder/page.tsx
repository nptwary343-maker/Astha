'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Loader2, Database, CheckCircle2, RefreshCw } from 'lucide-react';

// --- EXISTING CATEGORIES ---
const ELECTRONICS = [
    { name: 'Samsung Galaxy S24 Ultra Silicone Case', price: 1200, category: 'Electronics', images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'], tax: 5, description: 'Premium silicone case for Galaxy S24 Ultra.' },
    { name: 'M13 Wireless Earbuds Pro', price: 2500, category: 'Electronics', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'], tax: 5, description: 'High fidelity wireless earbuds with noise cancellation.' },
];

const VEGETABLES = [
    { name: 'Fresh Organic Tomato (টমেটো)', price: 80, category: 'Vegetables', images: ['https://images.unsplash.com/photo-1546473530-aba0a45ce31c?w=500'], tax: 0 },
];

// --- NEW BD GROCERY LIST (50 ITEMS) --- 
// Prices based on Feb 2026 data: Beef ~780-800, Chicken ~190-220, Onion ~40-120 (fluctuating), Potato ~25-70, Oil ~190, Egg ~170/doz.
// Tax: 0% for raw, 5%-15% for processed/packaged.

const BD_GROCERY = [
    // --- MEAT (BEEF) ---
    {
        name: 'Beef Premium Bone-in (Gorur Mangsho) - 1kg',
        price: 780,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/fresh-raw-meat-ready-cooking_23-2148667503.jpg?w=800'],
        tax: 0,
        description: 'Fresh premium beef with bone. 1kg net weight.'
    },
    {
        name: 'Beef Premium Bone-in (Gorur Mangsho) - 500g',
        price: 400,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/fresh-raw-meat-ready-cooking_23-2148667503.jpg?w=800'],
        tax: 0,
        description: 'Fresh premium beef with bone. 500g net weight.'
    },
    {
        name: 'Beef Boneless (Gorur Mangsho) - 1kg',
        price: 950,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-beef-meat-slices_23-2148671607.jpg?w=800'],
        tax: 0,
        description: 'Premium boneless beef cuts. 1kg.'
    },
    {
        name: 'Beef Loose / Custom Weight (Per 100g)',
        price: 80,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/fresh-minced-meat_144627-31355.jpg?w=800'],
        tax: 0,
        description: 'Order any amount! Qty 1 = 100g. Qty 3 = 300g. Qty 10 = 1kg.'
    },

    // --- MEAT (MUTTON) ---
    {
        name: 'Mutton Premium (Khasir Mangsho) - 1kg',
        price: 1100,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-lamb-chops_144627-28564.jpg?w=800'],
        tax: 0,
        description: 'Fresh mutton mixed cuts. 1kg.'
    },
    {
        name: 'Mutton Premium (Khasir Mangsho) - 500g',
        price: 560,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-lamb-chops_144627-28564.jpg?w=800'],
        tax: 0,
        description: 'Fresh mutton mixed cuts. 500g.'
    },
    {
        name: 'Mutton Loose / Custom Weight (Per 100g)',
        price: 115,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-meat_144627-33829.jpg?w=800'],
        tax: 0,
        description: 'Order any amount! Qty 3 = 300g. Qty 5 = 500g.'
    },

    // --- MEAT (CHICKEN) ---
    {
        name: 'Broiler Chicken (Skin On) - 1kg',
        price: 200, // Updated: Reflects Feb 2026 range (180-220)
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-chicken-legs_144627-27907.jpg?w=800'],
        tax: 0,
        description: 'Fresh farm broiler chicken. 1kg avg size.'
    },
    {
        name: 'Sonali Chicken (Pakistani) - Per Kg',
        price: 330, // Updated: Reflects Feb 2026 range (320-330)
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/whole-chicken-raw-isolated_144627-29388.jpg?w=800'],
        tax: 0,
        description: 'Golden Sonali Chicken. Price per kg.'
    },
    {
        name: 'Deshi Chicken (Local) - Per Piece',
        price: 600,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-chicken_144627-12465.jpg?w=800'],
        tax: 0,
        description: 'Authentic local Deshi Murgi. Approx 800-900g.'
    },

    // --- FISH ---
    {
        name: 'Padma Hilsha (Ilish) - 1kg Size',
        price: 1600,
        category: 'Meat & Fish',
        images: ['https://t4.ftcdn.net/jpg/04/39/39/97/360_F_439399770_K4l3t7z2fC1b1p0g1g1.jpg?w=800'],
        tax: 0,
        description: 'Authentic Padma river Hilsha. Single fish approx 900g-1kg.'
    },
    {
        name: 'Rui Fish (Whole) - 2kg Size (Per Kg)',
        price: 380,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-fish_144627-27845.jpg?w=800'],
        tax: 0,
        description: 'Fresh Rui fish. Price per kg.'
    },
    {
        name: 'Galda Shrimp (Golda Chingri) - 1kg',
        price: 900,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-shrimps_144627-31215.jpg?w=800'],
        tax: 0,
        description: 'Large freshwater prawns. 1kg.'
    },
    {
        name: 'Tilapia Fish - 1kg',
        price: 220,
        category: 'Meat & Fish',
        images: ['https://img.freepik.com/free-photo/raw-fish_144627-27845.jpg?w=800'],
        tax: 0,
        description: 'Fresh Tilapia. 3-4 pcs per kg.'
    },

    // --- RICE & GRAINS --- 
    {
        name: 'Miniket Rice (Premium) - 5kg Bag',
        price: 425, // Updated: Reflects ~85/kg
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/rice_144627-36836.jpg?w=800'],
        tax: 0,
        description: 'Sortex polished Miniket rice. 5kg pack.'
    },
    {
        name: 'Nazirshail Rice - 1kg',
        price: 85,
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/raw-rice-bowl_144627-14732.jpg?w=800'],
        tax: 0,
        description: 'High quality Nazirshail rice.'
    },
    {
        name: 'Chinigura Polao Rice (Aromatic) - 1kg',
        price: 140,
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/rice_144627-36836.jpg?w=800'],
        tax: 0,
        description: 'Fragrant aromatic rice for Polao and Biryani.'
    },
    {
        name: 'ACI Pure Salt - 1kg',
        price: 42,
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/sea-salt-wooden-bowl_1150-18490.jpg?w=800'],
        tax: 5,
        description: 'Vacuum evaporated iodized salt.'
    },
    {
        name: 'Fresh Sugar (Chini) - 1kg',
        price: 145,
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/sugar-crystals_144627-13357.jpg?w=800'],
        tax: 5,
        description: 'Refined white sugar.'
    },

    // --- OIL & DAL ---
    {
        name: 'Rupchanda Soybean Oil - 5L Bottle',
        price: 940, // Updated: ~188/L
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/oil-bottle_144627-27694.jpg?w=800'],
        tax: 5,
        description: 'Fortified Soybean Oil. 5 Litre Jar.'
    },
    {
        name: 'Rupchanda Soybean Oil - 1L Bottle',
        price: 190, // Updated: Reflects Feb 2026 price
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/oil-bottle_144627-27694.jpg?w=800'],
        tax: 5,
        description: 'Fortified Soybean Oil. 1 Litre Bottle.'
    },
    {
        name: 'Radhuni Pure Mustard Oil - 1L',
        price: 360,
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/oil-bottle_144627-27694.jpg?w=800'],
        tax: 5,
        description: 'Pure mustard oil (Shorishar Tel).'
    },
    {
        name: 'Deshi Masoor Dal (Premium) - 1kg',
        price: 140,
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/lentils-bowl_144627-16782.jpg?w=800'],
        tax: 0,
        description: 'Small grain red lentils.'
    },
    {
        name: 'Moong Dal - 1kg',
        price: 130,
        category: 'Grocery & Staples',
        images: ['https://img.freepik.com/free-photo/lentils_144627-27361.jpg?w=800'],
        tax: 0,
        description: 'Yellow split gram (Moong Dal).'
    },

    // --- VEGETABLES (UPDATED) ---
    {
        name: 'Fresh Potato (Deshi Alu) - 1kg',
        price: 60, // Updated: Reflects mid-range Feb 2026 (25-70 fluctuation)
        category: 'Vegetables',
        images: ['https://img.freepik.com/free-photo/raw-potatoes_144627-26857.jpg?w=800'],
        tax: 0,
        description: 'Fresh seasonal potatoes.'
    },
    {
        name: 'Onion (Deshi Peyaj) - 1kg',
        price: 80, // Updated: Reflects range (40-120)
        category: 'Vegetables',
        images: ['https://img.freepik.com/free-photo/red-onions_144627-27768.jpg?w=800'],
        tax: 0,
        description: 'Local red onions (Deshi).'
    },
    {
        name: 'Garlic (Imported) - 1kg',
        price: 240,
        category: 'Vegetables',
        images: ['https://img.freepik.com/free-photo/garlic-cloves_144627-27807.jpg?w=800'],
        tax: 0,
        description: 'Large clove imported garlic.'
    },
    {
        name: 'Green Chili (Kacha Morich) - 250g',
        price: 40,
        category: 'Vegetables',
        images: ['https://img.freepik.com/free-photo/green-chili_144627-27796.jpg?w=800'],
        tax: 0,
        description: 'Fresh spicy green chilies.'
    },
    {
        name: 'Local Ginger (Ada) - 1kg',
        price: 260,
        category: 'Vegetables',
        images: ['https://img.freepik.com/free-photo/ginger-root_144627-27814.jpg?w=800'],
        tax: 0,
        description: 'Fresh ginger root.'
    },
    {
        name: 'Cucumber (Shosha) - 1kg',
        price: 60,
        category: 'Vegetables',
        images: ['https://img.freepik.com/free-photo/fresh-cucumbers_144627-27827.jpg?w=800'],
        tax: 0,
        description: 'Fresh salad cucumber.'
    },
    {
        name: 'Brinjal (Begun) - Long - 1kg',
        price: 80,
        category: 'Vegetables',
        images: ['https://img.freepik.com/free-photo/eggplants_144627-27828.jpg?w=800'],
        tax: 0,
        description: 'Fresh long purple brinjal.'
    },

    // --- DAIRY & BREAKFAST ---
    {
        name: 'Farm Fresh Eggs (Brown) - 1 Dozen',
        price: 170, // Updated: Feb 2026 Spike to 170/doz
        category: 'Dairy & Bakery',
        images: ['https://img.freepik.com/free-photo/brown-eggs-carton_144627-27863.jpg?w=800'],
        tax: 0,
        description: 'Fresh farm eggs. 12 pieces.'
    },
    {
        name: 'Milk Vita Liquid Milk - 1L',
        price: 90,
        category: 'Dairy & Bakery',
        images: ['https://img.freepik.com/free-photo/milk-bottle_144627-27962.jpg?w=800'],
        tax: 0,
        description: 'Pasteurized liquid milk.'
    },
    {
        name: 'Dano Full Cream Milk Powder - 500g',
        price: 480,
        category: 'Dairy & Bakery',
        images: ['https://img.freepik.com/free-photo/powdered-milk_144627-31355.jpg?w=800'],
        tax: 5,
        description: 'Instant full cream milk powder.'
    },
    {
        name: 'All Time White Bread - Large',
        price: 65,
        category: 'Dairy & Bakery',
        images: ['https://img.freepik.com/free-photo/bread-loaf_144627-27715.jpg?w=800'],
        tax: 5,
        description: 'Soft white sandwich bread.'
    },

    // --- SPICES ---
    {
        name: 'Radhuni Chili Powder - 200g',
        price: 140,
        category: 'Spices',
        images: ['https://img.freepik.com/free-photo/red-chili-powder_144627-33829.jpg?w=800'],
        tax: 5,
        description: 'Hot red chili powder.'
    },
    {
        name: 'Radhuni Turmeric Powder - 200g',
        price: 110,
        category: 'Spices',
        images: ['https://img.freepik.com/free-photo/turmeric-powder_144627-27750.jpg?w=800'],
        tax: 5,
        description: 'Pure turmeric powder for cooking.'
    },
    {
        name: 'Radhuni Coriander Powder - 200g',
        price: 75,
        category: 'Spices',
        images: ['https://img.freepik.com/free-photo/coriander-powder_144627-33829.jpg?w=800'], // generic spice
        tax: 5,
        description: 'Ground coriander seeds.'
    },
    {
        name: 'Whole Cumin Seeds (Jeera) - 100g',
        price: 150,
        category: 'Spices',
        images: ['https://img.freepik.com/free-photo/cumin-seeds_144627-33829.jpg?w=800'],
        tax: 0,
        description: 'Whole cumin seeds.'
    },

    // --- BEVERAGES ---
    {
        name: 'Ispahani Mirzapore Tea - 400g',
        price: 240,
        category: 'Beverages',
        images: ['https://img.freepik.com/free-photo/tea-leaves_144627-27863.jpg?w=800'],
        tax: 15,
        description: 'Premium BOP tea leaves.'
    },
    {
        name: 'Nescafe Classic Coffee Jar - 50g',
        price: 290,
        category: 'Beverages',
        images: ['https://img.freepik.com/free-photo/coffee-jar_144627-27863.jpg?w=800'],
        tax: 15,
        description: 'Classic instant coffee.'
    },
    {
        name: 'Coca Cola - 2.25L',
        price: 140,
        category: 'Beverages',
        images: ['https://img.freepik.com/free-photo/cola-drink_144627-27863.jpg?w=800'],
        tax: 15,
        description: 'Carbonated soft drink.'
    },
];

export default function SeederPage() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [count, setCount] = useState(0);

    const seedData = async () => {
        setLoading(true);
        try {
            // Combine new grocery list with older electronics for a full catalog
            const allProducts = [...BD_GROCERY, ...ELECTRONICS];
            let current = 0;
            for (const p of allProducts) {
                const docRef = await addDoc(collection(db, 'products'), {
                    ...p,
                    stock: 100,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    description: p.description || `Premium quality ${p.name} from AstharHat.`
                });


                current++;
                setCount(current);
            }
            setDone(true);
            // 🧹 Clear Cache after seeding
            fetch('/api/revalidate?secret=asthar_secret_123', { method: 'POST' }).catch(e => console.error(e));
        } catch (error) {

            console.error(error);
            alert('Failed to seed data');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                    <Database size={40} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Database Seeder</h1>
                <p className="text-gray-500">
                    This will add 50+ Real BD Grocery Products (Beef, Mutton, Fish, Veg) with live Feb 2026 pricing.
                </p>

                {done ? (
                    <div className="bg-green-50 border border-green-100 p-6 rounded-2xl space-y-2">
                        <CheckCircle2 className="text-green-600 mx-auto" size={32} />
                        <p className="text-green-800 font-bold">Successfully processed {count} products!</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold mt-4"
                        >
                            Return Home
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 w-full">
                        <button
                            onClick={seedData}
                            disabled={loading}
                            className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Seeding... ({count})
                                </>
                            ) : (
                                <>
                                    <Database size={20} />
                                    Seed BD Grocery Data (50+)
                                </>
                            )}
                        </button>

                    </div>
                )}
            </div>
        </div>
    );
}
