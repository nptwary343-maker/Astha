import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
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

