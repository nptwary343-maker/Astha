import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
    apiKey: "AIzaSyBfjbpYGWkrvd2oxDRDgbRpYSlhKo-pyCo",
    authDomain: "astharhar.firebaseapp.com",
    projectId: "astharhar",
    storageBucket: "astharhar.firebasestorage.app",
    messagingSenderId: "940224314643",
    appId: "1:940224314643:web:dfbf033ba63569bb6feee6",
    measurementId: "G-2T32864N2K"
};

// Singleton initialization for Next.js (Turbo/SSR/Server Actions)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// FCM Initialization (Client Side Only)
let messaging: any = null;

if (typeof window !== "undefined") {
    // Dynamically import messaging only in browser
    import("firebase/messaging").then(({ getMessaging, isSupported }) => {
        isSupported().then((supported: boolean) => {
            if (supported) {
                messaging = getMessaging(app);
            }
        }).catch((err: any) => {
            console.warn("Firebase Messaging not supported in this browser:", err);
        });
    }).catch((err) => {
        console.error("FCM Dynamically Import Error:", err);
    });
}

export { messaging };

// Re-export common SDK functions to fix broken imports in @/lib/firebase
import {
    collection as firestoreCollection,
    doc as firestoreDoc,
    getDoc as firestoreGetDoc,
    setDoc as firestoreSetDoc,
    addDoc as firestoreAddDoc,
    updateDoc as firestoreUpdateDoc,
    deleteDoc as firestoreDeleteDoc,
    query as firestoreQuery,
    where as firestoreWhere,
    orderBy as firestoreOrderBy,
    limit as firestoreLimit,
    onSnapshot as firestoreOnSnapshot,
    getDocs as firestoreGetDocs,
    serverTimestamp as firestoreServerTimestamp,
    runTransaction as firestoreRunTransaction,
    getCountFromServer as firestoreGetCountFromServer,
    writeBatch as firestoreWriteBatch,
    increment as firestoreIncrement
} from "firebase/firestore";

export const collection = firestoreCollection;
export const doc = firestoreDoc;
export const getDoc = firestoreGetDoc;
export const setDoc = firestoreSetDoc;
export const addDoc = firestoreAddDoc;
export const updateDoc = firestoreUpdateDoc;
export const deleteDoc = firestoreDeleteDoc;
export const query = firestoreQuery;
export const where = firestoreWhere;
export const orderBy = firestoreOrderBy;
export const limit = firestoreLimit;
export const onSnapshot = firestoreOnSnapshot;
export const getDocs = firestoreGetDocs;
export const serverTimestamp = firestoreServerTimestamp;
export const runTransaction = firestoreRunTransaction;
export const getCountFromServer = firestoreGetCountFromServer;
export const writeBatch = firestoreWriteBatch;
export const increment = firestoreIncrement;

export default app;
