'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Added db import
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Added firestore imports
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isDelivery: boolean;
    role: string;
    userData: any | null;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    isSuperAdmin: false,
    isDelivery: false,
    role: 'user',
    userData: null,
    logout: async () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isDelivery, setIsDelivery] = useState(false);
    const [role, setRole] = useState('user');
    const [userData, setUserData] = useState<any | null>(null);
    const router = useRouter();

    const logout = async () => {
        try {
            await auth.signOut();

            // 🧹 CLEAR ALL LOCAL PERSISTENCE
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }

            // 🍪 CLEAR ALL COOKIES
            document.cookie = 'user-session=; path=/; max-age=0;';
            document.cookie = 'admin-session=; path=/; max-age=0;';
            document.cookie = 'admin-role=; path=/; max-age=0;';

            // RESET STATES IMMEDIATELY
            setUser(null);
            setIsAdmin(false);
            setIsSuperAdmin(false);
            setIsDelivery(false);
            setRole('user');
            setUserData(null);

            // GHOST ERROR PREVENTION: Redirect to Home instead of Login
            router.push('/');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // 🍪 Sync Cookie if missing (Crucial for Middleware)
                try {
                    const token = await currentUser.getIdToken();
                    document.cookie = `user-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                } catch (cookieError) {
                    console.error("Failed to sync session cookie:", cookieError);
                }

                try {
                    // 1. UID-Based Check (Primary)
                    const adminDocRef = doc(db, 'admin_users', currentUser.uid);
                    const adminDoc = await getDoc(adminDocRef);

                    let isFound = false;
                    let data = null;

                    if (adminDoc.exists()) {
                        isFound = true;
                        data = adminDoc.data();
                    }

                    // 2. Email-Based Check (By Document ID) 
                    if (!isFound && currentUser.email) {
                        const emailDocRef = doc(db, 'admin_users', currentUser.email);
                        const emailDoc = await getDoc(emailDocRef);
                        if (emailDoc.exists()) {
                            isFound = true;
                            data = emailDoc.data();
                        }
                    }

                    // 3. Fallback: Query by Email Field
                    if (!isFound && currentUser.email) {
                        const q = query(collection(db, 'admin_users'), where('email', '==', currentUser.email));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            isFound = true;
                            data = querySnapshot.docs[0].data();
                        }
                    }

                    const isSuperUID = currentUser.uid === 'ZzAXMq57TVRIaQ8UDUoCldz6F863';

                    if (isFound && data) {
                        const userRole = data.role || 'user';
                        setRole(userRole);
                        setUserData(data);

                        // Sync Admin Cookies in Background
                        if (typeof window !== 'undefined') {
                            const token = await currentUser.getIdToken(true);
                            document.cookie = `admin-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                            document.cookie = `admin-role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                        }

                        const isSuper = userRole === 'super_admin' || userRole === 'super admin' || isSuperUID;
                        const isBasicAdmin = userRole === 'admin';
                        const isManager = userRole === 'manager';
                        const isDeliveryUser = userRole === 'delivery';

                        setIsAdmin(isSuper || isBasicAdmin || isManager);
                        setIsSuperAdmin(isSuper);
                        setIsDelivery(isDeliveryUser);
                    } else if (isSuperUID) {
                        setIsAdmin(true);
                        setIsSuperAdmin(true);
                        setRole('super_admin');

                        // Sync SuperAdmin Cookies
                        const token = await currentUser.getIdToken(true);
                        document.cookie = `admin-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                        document.cookie = `admin-role=super_admin; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                    } else {
                        setIsAdmin(false);
                        setIsSuperAdmin(false);
                        setRole('user');
                        setUserData(null);
                    }
                } catch (error: any) {
                    console.error("🚨 Auth Context Error (Ghost Check):", error?.message || error);
                    // Handle specific Firebase auth/network errors
                    if (error?.code === 'permission-denied') {
                        console.warn("Permission denied while checking admin status - possibly quota issues?");
                    }
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setIsSuperAdmin(false);
                setIsDelivery(false);
                setRole('user');
                setUserData(null);

                // Clear cookies on logged out state
                if (typeof window !== 'undefined') {
                    document.cookie = 'user-session=; path=/; max-age=0;';
                    document.cookie = 'admin-session=; path=/; max-age=0;';
                    document.cookie = 'admin-role=; path=/; max-age=0;';
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isSuperAdmin, isDelivery, role, userData, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
                <Loader2 className="animate-spin text-orange-600" size={48} />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
};
