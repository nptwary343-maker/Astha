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

// Singleton initialization for Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
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

