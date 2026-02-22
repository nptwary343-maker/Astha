import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

export async function seedBDProducts() {
    console.log("🚀 Starting AUTHENTIC Mass BD Product Seeding...");

    const dataPath = path.resolve(process.cwd(), 'data/bd-expansion-80.json');
    if (!fs.existsSync(dataPath)) {
        throw new Error(`Data file not found at ${dataPath}`);
    }

    const bdProducts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    let count = 0;
    for (const product of bdProducts) {
        try {
            // Remove the ID as Firestore generates its own
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
