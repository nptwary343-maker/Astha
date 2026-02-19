const admin = require('firebase-admin');
const { algoliasearch } = require('algoliasearch');
const fs = require('fs');
const path = require('path');

// 1. Initialize Firebase Admin
const saPath = path.join(process.cwd(), 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// 2. Initialize Algolia
const APP_ID = 'NS1FPYWGCF';
const ADMIN_API_KEY = '9b26b0fba76a8a5dec5112a2cab3d493';
const INDEX_NAME = 'asthar_products';
const client = algoliasearch(APP_ID, ADMIN_API_KEY);

// 3. Bangladeshi Product Data
const bdProducts = [
    { name: 'Ispahani Mirzapore Tea Bag', category: 'Beverage', price: 165, brand: 'Ispahani' },
    { name: 'Pran Frooto Mango Fruit Drink', category: 'Beverage', price: 30, brand: 'Pran' },
    { name: 'Radhuni Ready Mix Chicken Curry Roast', category: 'Grocery', price: 45, brand: 'Radhuni' },
    { name: 'Aarong Liquid Milk 1L', category: 'Dairy', price: 90, brand: 'Aarong' },
    { name: 'Olympic Lexus Vegetable Biscuit', category: 'Snacks', price: 25, brand: 'Olympic' },
    { name: 'Magsi 2-Minute Noodles', category: 'Food', price: 20, brand: 'Maggi' },
    { name: 'Ruchi Chanachur Hot', category: 'Snacks', price: 35, brand: 'Ruchi' },
    { name: 'Bombay Sweets Potato Crackers', category: 'Snacks', price: 10, brand: 'Bombay Sweets' },
    { name: 'Bashundhara Toilet Tissue 4 Units', category: 'Hygiene', price: 80, brand: 'Bashundhara' },
    { name: 'Chaka Super White Soap', category: 'Cleaning', price: 25, brand: 'Chaka' },
    { name: 'Teer Soyabean Oil 2L', category: 'Grocery', price: 320, brand: 'Teer' },
    { name: 'Fresh Refined Sugar 1kg', category: 'Grocery', price: 140, brand: 'Fresh' },
    { name: 'Molla Salt 1kg', category: 'Grocery', price: 40, brand: 'Molla' },
    { name: 'Sunsilk Black Shine Shampoo 180ml', category: 'Beauty', price: 220, brand: 'Sunsilk' },
    { name: 'Lux Soft Touch Soap', category: 'Beauty', price: 55, brand: 'Lux' },
    { name: 'Super Star LED Bulb 12W', category: 'Electronics', price: 250, brand: 'Super Star' },
    { name: 'BSRM Rod (Per KG)', category: 'Construction', price: 95, brand: 'BSRM' },
    { name: 'Energypac Ceiling Fan', category: 'Electronics', price: 3500, brand: 'Energypac' },
    { name: 'Walton Primo Smartphone', category: 'Electronics', price: 12500, brand: 'Walton' },
    { name: 'Bata Men Leather Shoes', category: 'Fashion', price: 2499, brand: 'Bata' },
    { name: 'Apex Men Sandal', category: 'Fashion', price: 890, brand: 'Apex' },
    { name: 'Sajeeb Orange Juice', category: 'Beverage', price: 25, brand: 'Sajeeb' },
    { name: 'Matador Hi-Teen Ball Pen', category: 'Stationery', price: 5, brand: 'Matador' },
    { name: 'Fresh Milk Powder 400g', category: 'Dairy', price: 380, brand: 'Fresh' },
    { name: 'Dano Daily Pushti Milk Powder', category: 'Dairy', price: 350, brand: 'Dano' },
    { name: 'Pusty Soyabean Oil 5L', category: 'Grocery', price: 800, brand: 'Pusty' },
    { name: 'Keya Lemon Soap', category: 'Beauty', price: 45, brand: 'Keya' },
    { name: 'Savlon Antiseptic Liquid', category: 'Health', price: 110, brand: 'ACI' },
    { name: 'Square Sepnil Hand Sanitizer', category: 'Health', price: 65, brand: 'Square' },
    { name: 'Kishwan Ghee 400g', category: 'Dairy', price: 650, brand: 'Kishwan' },
    { name: 'Laziz Sunflower Oil', category: 'Grocery', price: 450, brand: 'Laziz' },
    { name: 'Mezban Meat Masala', category: 'Grocery', price: 55, brand: 'Radhuni' },
    { name: 'Ahmed Mixed Fruit Jam', category: 'Food', price: 180, brand: 'Ahmed' },
    { name: 'Foster Clark Custard Powder', category: 'Food', price: 220, brand: 'Foster Clark' },
    { name: 'Dettol Cool Soap', category: 'Beauty', price: 60, brand: 'Dettol' },
    { name: 'Pepsodent Germi Check 200g', category: 'Beauty', price: 145, brand: 'Pepsodent' },
    { name: 'CloseUp Ever Fresh', category: 'Beauty', price: 155, brand: 'CloseUp' },
    { name: 'Horlicks Standard 500g', category: 'Health', price: 480, brand: 'Horlicks' },
    { name: 'Complan Chocolate 500g', category: 'Health', price: 550, brand: 'Complan' },
    { name: 'Milo Chocolate Drink 400g', category: 'Beverage', price: 420, brand: 'Milo' },
    { name: 'Nescafe Classic 100g', category: 'Beverage', price: 380, brand: 'Nescafe' },
    { name: 'Tang Orange 500g', category: 'Beverage', price: 450, brand: 'Tang' },
    { name: 'Malova Malt Drink', category: 'Beverage', price: 320, brand: 'Malova' },
    { name: 'Lifebuoy Total Soap', category: 'Beauty', price: 50, brand: 'Lifebuoy' },
    { name: 'Wheel Laundry Soap', category: 'Cleaning', price: 22, brand: 'Wheel' },
    { name: 'Surf Excel Quick Wash 1kg', category: 'Cleaning', price: 210, brand: 'Surf Excel' },
    { name: 'Rin Power Bright 1kg', category: 'Cleaning', price: 190, brand: 'Rin' },
    { name: 'Harpic Toilet Cleaner 750ml', category: 'Cleaning', price: 165, brand: 'Harpic' },
    { name: 'Lizol Floor Cleaner 500ml', category: 'Cleaning', price: 145, brand: 'Lizol' },
    { name: 'Vim Dishwash Liquid 500ml', category: 'Cleaning', price: 125, brand: 'Vim' }
];

async function seed() {
    console.log('🌱 Starting Bangladeshi Product Seeding (50 Items)...');

    // Clear existing products first to avoid clutter
    const productsSnap = await db.collection('products').get();
    const deleteBatch = db.batch();
    productsSnap.docs.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log('🗑️ Existing products cleared.');

    // Clear Algolia
    try {
        await client.clearObjects({ indexName: INDEX_NAME });
        console.log('🗑️ Algolia index cleared.');
    } catch (e) {
        console.error('Algolia clear error:', e);
    }

    const batch = db.batch();
    const algoliaRecords = [];

    for (let i = 0; i < bdProducts.length; i++) {
        const p = bdProducts[i];
        const docRef = db.collection('products').doc(`bd_prod_${i + 1}`);
        const productData = {
            name: p.name,
            category: p.category,
            price: p.price,
            brand: p.brand,
            stock: Math.floor(Math.random() * 200) + 50,
            status: 'Active',
            description: `${p.name} from ${p.brand}. A trusted product in Bangladesh.`,
            images: [`https://placehold.co/600x400/2563eb/white?text=${encodeURIComponent(p.name)}`],
            slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (i + 1),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        batch.set(docRef, productData);

        algoliaRecords.push({
            objectID: docRef.id,
            name: productData.name,
            price: productData.price,
            category: productData.category,
            imageUrl: productData.images[0],
            stock: productData.stock,
            brand: productData.brand,
            updatedAt: Date.now()
        });
    }

    console.log('📤 Committing to Firestore...');
    await batch.commit();
    console.log('✅ Firestore seeding successful.');

    console.log('📤 Syncing to Algolia...');
    await client.saveObjects({
        indexName: INDEX_NAME,
        objects: algoliaRecords
    });
    console.log('✅ Algolia synchronization successful.');

    console.log('\n✨ ALL DONE! 50 Bangladeshi records are live.');
}

seed().catch(console.error);
