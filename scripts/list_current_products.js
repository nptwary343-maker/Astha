const { db } = require('./lib/firebase');
const { collection, getDocs } = require('firebase/firestore');

async function listProducts() {
    try {
        const q = collection(db, 'products');
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error fetching products:", e);
    }
}

listProducts();
