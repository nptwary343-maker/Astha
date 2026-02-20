'use client';
export const runtime = 'edge';;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, AlertTriangle, KeyRound } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Forgot Password State
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [securityKey, setSecurityKey] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

    const { user, isAdmin, loading: authLoading } = useAuth();

    // Check for persistent login
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isMaster = sessionStorage.getItem('isMasterAdmin');
            if (isMaster === 'true' || isAdmin) {
                router.push('/admin');
            }
        }
    }, [router, isAdmin]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // DEV BACKDOOR
        if (email === 'admin@aez.com' && password === 'password') {
            sessionStorage.setItem('adminUserEmail', email);
            sessionStorage.setItem('isMasterAdmin', 'true');
            router.push('/admin');
            return;
        }

        try {
            let uid = '';
            let loginMethod = 'firebase';

            // 1. Try Firebase Auth First
            try {
                const { signInWithEmailAndPassword } = await import('firebase/auth');
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                uid = userCredential.user.uid;
            } catch (authErr: any) {
                // 2. Fallback: Custom Firestore Auth (for admins added via Settings without Firebase Auth account)
                if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/invalid-email') {
                    // Check if user exists in Firestore with matching password
                    const q = query(collection(db, 'admin_users'), where('email', '==', email));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const adminData = querySnapshot.docs[0].data();
                        // SIMPLE PLAIN TEXT CHECK (As requested for the internal "Add Admin" feature to work)
                        if (adminData.password === password) {
                            uid = querySnapshot.docs[0].id;
                            loginMethod = 'firestore';
                            console.log("Logged in via Firestore Backup Auth");
                        } else {
                            throw new Error("Invalid email or password.");
                        }
                    } else {
                        throw authErr;
                    }
                } else {
                    throw authErr;
                }
            }

            // Verify Admin Status via Firestore
            let adminDoc;
            if (loginMethod === 'firebase') {
                adminDoc = await getDoc(doc(db, 'admin_users', uid));
            } else {
                // If firestore login, we already found the doc, but let's be consistent
                const q = query(collection(db, 'admin_users'), where('email', '==', email));
                const snap = await getDocs(q);
                adminDoc = snap.docs[0];
            }

            const isSuperUID = uid === 'ZzAXMq57TVRIaQ8UDUoCldz6F863';
            let isAdminUser = false;
            let data = null;
            let isFound = false;

            // 1. Check by Doc Existence
            if (adminDoc && adminDoc.exists()) {
                data = adminDoc.data();
                isFound = true;
            }

            // 2. Check by Email (Document ID)
            if (!isFound) {
                const emailDocRef = doc(db, 'admin_users', email);
                const emailDoc = await getDoc(emailDocRef);
                if (emailDoc.exists()) {
                    data = emailDoc.data();
                    isFound = true;
                }
            }

            // 3. Last resort query
            if (!isFound) {
                const q = query(collection(db, 'admin_users'), where('email', '==', email));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    data = snap.docs[0].data();
                    isFound = true;
                }
            }

            if (data) {
                if (data.role === 'admin' || data.role === 'super_admin' || data.role === 'super admin' || isSuperUID) {
                    isAdminUser = true;
                }
            } else if (isSuperUID) {
                isAdminUser = true;
            }

            if (isAdminUser) {
                // Login Success - Persistent Session
                sessionStorage.setItem('adminUserEmail', email);
                sessionStorage.setItem('isMasterAdmin', 'true');

                // STRICT SECURITY: Set Cookie for Middleware (Consistent with main login)
                const firebaseUser = auth.currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken(true) : uid;

                // Set all required cookies for holistic session management
                document.cookie = `admin-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                document.cookie = `admin-role=${data?.role || 'admin'}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                document.cookie = `user-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;

                router.push('/admin');
            } else {
                await auth.signOut(); // Logout if not admin
                document.cookie = 'admin-session=; path=/; max-age=0;'; // Clear cookie
                throw new Error("Access Denied. You do not have admin privileges.");
            }

        } catch (err: any) {
            console.error("Login Error:", err);
            let errorMessage = "Failed to sign in. Please check your credentials.";
            if (err.message === "Invalid email or password.") {
                errorMessage = err.message;
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password.";
            } else if (err.message === "Access Denied. You do not have admin privileges.") {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
            const googleProvider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, googleProvider);
            const uid = result.user.uid;
            const email = result.user.email;

            // Immediate Super Admin Check
            const isSuperUID = uid === 'ZzAXMq57TVRIaQ8UDUoCldz6F863';
            if (isSuperUID) {
                sessionStorage.setItem('adminUserEmail', email || '');
                sessionStorage.setItem('isMasterAdmin', 'true');
                router.push('/admin');
                return;
            }

            // Verify Admin Status via Firestore
            // Verify Admin Status via Firestore
            const adminDocRef = doc(db, 'admin_users', uid);
            const adminDoc = await getDoc(adminDocRef);

            let isAdminUser = false;
            let data = null;
            let isFound = false;

            // 1. Check by UID
            if (adminDoc.exists()) {
                data = adminDoc.data();
                isFound = true;
            }

            // 2. Check by Email (Document ID) - Critical for Settings Page added admins
            if (!isFound && email) {
                const emailDocRef = doc(db, 'admin_users', email);
                const emailDoc = await getDoc(emailDocRef);
                if (emailDoc.exists()) {
                    data = emailDoc.data();
                    isFound = true;
                }
            }

            // 3. Fallback: Check mostly for legacy (Query by field)
            if (!isFound && email) {
                const q = query(collection(db, 'admin_users'), where('email', '==', email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    data = querySnapshot.docs[0].data();
                    isFound = true;
                }
            }

            if (data) {
                if (data.role === 'admin' || data.role === 'super_admin' || data.role === 'super admin') {
                    isAdminUser = true;
                }
            }

            if (isAdminUser) {
                // Login Success - Persistent Session
                sessionStorage.setItem('adminUserEmail', email || '');
                sessionStorage.setItem('isMasterAdmin', 'true');

                // STRICT SECURITY: Set Cookie for Middleware (Consistent with main login)
                const token = result.user ? await result.user.getIdToken(true) : uid;
                document.cookie = `admin-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                document.cookie = `admin-role=${data?.role || 'admin'}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                document.cookie = `user-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;

                router.push('/admin');
            } else {
                await auth.signOut();
                document.cookie = 'admin-session=; path=/; max-age=0;'; // Clear cookie
                throw new Error("Access Denied. You do not have admin privileges.");
            }

        } catch (err: any) {
            console.error("Google Login Error:", err);
            let errorMessage = "Failed to sign in with Google.";
            if (err.message === "Access Denied. You do not have admin privileges.") {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setForgotSuccess(null);

        try {
            const docRef = doc(db, 'admin_users', forgotEmail);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error("Admin user not found.");
            }

            const data = docSnap.data();
            // Check Security Key
            if (data.securityKey !== securityKey) {
                throw new Error("Wrong Security Key.");
            }

            // Update Password
            await updateDoc(docRef, {
                password: newPassword
            });

            setForgotSuccess("Password reset successful! Please login.");
            setIsForgotPassword(false);
            setForgotEmail('');
            setNewPassword('');
            setSecurityKey('');

        } catch (err: any) {
            console.error("Forgot Password Error:", err);
            setError(err.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isForgotPassword) {
        return (
            <div className="min-h-screen w-full bg-[#1e1e2d] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-orange-600/20 rounded-2xl mx-auto flex items-center justify-center mb-4 text-orange-500">
                            <KeyRound size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                        <p className="text-gray-400 mt-2 text-sm">Enter your Security Key to reset access.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Admin Email</label>
                            <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#2a2a3c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500" placeholder="admin@example.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Password</label>
                            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#2a2a3c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500" placeholder="New Password" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Security Key (Number)</label>
                            <input type="text" required value={securityKey} onChange={e => { if (/^\d*$/.test(e.target.value)) setSecurityKey(e.target.value) }}
                                className="w-full px-4 py-3 bg-[#2a2a3c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500" placeholder="123456" />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold mt-4">
                            {isLoading ? 'Verifying...' : 'Reset Password'}
                        </button>
                    </form>

                    <button onClick={() => setIsForgotPassword(false)} className="w-full text-center text-gray-400 text-sm mt-6 hover:text-white transition-colors">
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#1e1e2d] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 border border-white/10">
                        <ShieldCheck className="text-white h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-gray-400 mt-2 text-sm">Secure Access Verification</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                {forgotSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-200 p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <ShieldCheck size={18} className="shrink-0" />
                        {forgotSuccess}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Access</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-[#2a2a3c] border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                placeholder="admin@astharhat.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#2a2a3c] border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                    placeholder="••••••••••••"
                                />
                                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Access Dashboard
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#1e1e2d] text-gray-500 font-medium">Or continue with</span></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full mt-6 bg-white text-gray-900 hover:bg-gray-100 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </form>
            </div>
        </div>
    );
}
