const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBfjbpYGWkrvd2oxDRDgbRpYSlhKo-pyCo",
    authDomain: "astharhar.firebaseapp.com",
    projectId: "astharhar",
    storageBucket: "astharhar.firebasestorage.app",
    messagingSenderId: "940224314643",
    appId: "1:940224314643:web:dfbf033ba63569bb6feee6",
    measurementId: "G-2T32864N2K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProducts() {
    console.log("Checking Firestore 'products' collection...");
    const snap = await getDocs(collection(db, 'products'));
    console.log(`Found ${snap.docs.length} products.`);
    if (snap.docs.length > 0) {
        console.log("Sample product:", snap.docs[0].id, snap.docs[0].data().name);
    }
}

checkProducts().catch(console.error);
