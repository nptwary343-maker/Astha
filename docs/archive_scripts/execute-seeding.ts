import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function seedBDProducts() {
    console.log("🚀 Starting AUTHENTIC Mass BD Product Seeding (Single Script)...");

    const dataPath = path.resolve(process.cwd(), 'data/bd-expansion-80.json');
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data file not found at ${dataPath}`);
        process.exit(1);
    }

    const bdProducts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    let count = 0;
    for (const product of bdProducts) {
        try {
            const { id, ...data } = product;

            await addDoc(collection(db, 'products'), {
                ...data,
                createdAt: serverTimestamp(),
                isFeatured: Math.random() > 0.85,
                isNew: true,
                updatedAt: serverTimestamp()
            });
            count++;
            if (count % 10 === 0) console.log(`✅ Seeded ${count}/${bdProducts.length} items...`);
        } catch (e) {
            console.error(`❌ Failed to seed ${product.name}:`, e);
        }
    }
    console.log(`✨ MISSION COMPLETE: Seeded total ${count} authentic BD products.`);
}

seedBDProducts().then(() => {
    process.exit(0);
}).catch(err => {
    console.error("Critical Error during seeding:", err);
    process.exit(1);
});
