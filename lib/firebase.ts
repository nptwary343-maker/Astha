import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBfjbpYGWkrvd2oxDRDgbRpYSlhKo-pyCo",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "astharhar.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "astharhar",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "astharhar.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "940224314643",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:940224314643:web:dfbf033ba63569bb6feee6",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2T32864N2K"
};

// Singleton initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services with safe guards
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics safely
let analytics: any = null;
if (typeof window !== "undefined") {
    import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
        isSupported().then(supported => {
            if (supported) analytics = getAnalytics(app);
        });
    }).catch(err => console.error("Firebase Analytics Error:", err));
}

export { analytics };

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
export {
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDocs,
    serverTimestamp,
    runTransaction,
    getCountFromServer,
    writeBatch,
    increment
} from "firebase/firestore";

export default app;

