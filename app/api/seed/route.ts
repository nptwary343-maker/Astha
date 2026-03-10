export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
    try {
        const catSnap = await getDocs(collection(db, 'categories'));
        const prodSnap = await getDocs(collection(db, 'products'));
        
        const existingCats = new Set(prodSnap.docs.map(d => d.data().category?.toLowerCase()));
        let added = 0;

        for (let doc of catSnap.docs) {
            const catName = doc.data().name;
            if (catName && !existingCats.has(catName.toLowerCase())) {
                await addDoc(collection(db, 'products'), {
                    name: `Asthar Hat Premium ${catName}`,
                    price: 250,
                    oldPrice: 500,
                    stock: 99,
                    category: catName,
                    description: `This is a verified premium product specially selected for the ${catName} category. Guaranteed quality and super fast delivery.`,
                    images: [`https://placehold.co/800x800?text=${encodeURIComponent(catName)}`],
                    createdAt: serverTimestamp()
                });
                added++;
            }
        }
        return NextResponse.json({ success: true, message: `Added ${added} dummy products.` });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
