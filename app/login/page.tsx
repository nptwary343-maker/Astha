export const runtime = 'edge';
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/account";
    const { user, isAdmin, loading } = useAuth();

    // 🔄 Auto-Redirect & Session Restoration
    useEffect(() => {
        if (!loading && user) {
            // Restore cookies and redirect
            checkAdminAndRedirect(user);
        }
    }, [user, loading]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);

    const checkAdminAndRedirect = async (
        firebaseUser: any
    ) => {
        try {
            // 🔥 Get JWT Token with force refresh to clear ghost state
            const token = await firebaseUser.getIdToken(true);

            // 🛡️ SYNC COOKIES (Essential for middleware)
            document.cookie = `user-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;

            // Immediate Super Admin Check
            if (firebaseUser.uid === "ZzAXMq57TVRIaQ8UDUoCldz6F863") {
                document.cookie = `admin-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                document.cookie = `admin-role=super_admin; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                router.push("/admin");
                return;
            }

            // Check database
            const adminDocRef = doc(db, "admin_users", firebaseUser.uid);
            const adminDoc = await getDoc(adminDocRef);

            let data = null;
            if (adminDoc.exists()) {
                data = adminDoc.data();
            } else if (firebaseUser.email) {
                // Try direct doc check by email (ID) - Rule Friendly
                const emailDocRef = doc(db, "admin_users", firebaseUser.email);
                const emailDoc = await getDoc(emailDocRef);

                if (emailDoc.exists()) {
                    data = emailDoc.data();
                } else {
                    // Fallback to query
                    const { collection, query, where, getDocs } = await import("firebase/firestore");
                    const q = query(collection(db, "admin_users"), where("email", "==", firebaseUser.email));
                    const snap = await getDocs(q);
                    if (!snap.empty) data = snap.docs[0].data();
                }
            }

            if (data) {
                const role = data.role?.toLowerCase() || 'admin';
                document.cookie = `admin-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
                document.cookie = `admin-role=${role}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;

                if (role === 'delivery') router.push("/delivery");
                else router.push("/admin");
            } else {
                // Not an Admin - Safety Check for Redirect Loop
                if (redirectUrl.startsWith('/admin') || redirectUrl.startsWith('/delivery')) {
                    router.push('/account'); // Send to safe area
                } else {
                    router.push(redirectUrl);
                }
            }
        } catch (error) {
            console.error("🚨 LOGIN_SYSTEM_ERROR:", error);
            router.push(redirectUrl);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { signInWithEmailAndPassword } = await import("firebase/auth");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await checkAdminAndRedirect(userCredential.user);
        } catch (err: any) {
            console.error("Login Error:", err);
            let errorMessage = "Ghost Error: Failed to identify user session. Try again.";

            if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
                errorMessage = "Account not found.";
                setShowSignupPrompt(true);
            } else if (err.code === "auth/too-many-requests") {
                errorMessage = "Safety block: Too many attempts. Try in 5 minutes.";
            } else if (err.code === "auth/network-request-failed") {
                errorMessage = "Network disruption. Check your internet.";
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            // First, clarify the Google provider settings
            googleProvider.setCustomParameters({
                prompt: 'select_account',
                display: 'popup'
            });

            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                await checkAdminAndRedirect(result.user);
            }
        } catch (error: any) {
            console.error("🚨 Google Auth Error:", error);
            setIsLoading(false);

            if (error.code === "auth/cancelled-popup-request" || error.code === "auth/popup-closed-by-user") {
                return;
            }

            if (error.code === "auth/popup-blocked") {
                setError("Popup was blocked by your browser. Please allow popups for this site.");
                return;
            }

            setError("Login failed due to a system ghost error. Please refresh and try again.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0F172A]">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <span className="text-white font-bold text-3xl">A</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">
                        Enter your credentials to access your account
                    </p>
                </div>

                {error && (
                    <div className={`p-4 rounded-xl text-sm font-medium mb-6 text-center border animate-in fade-in slide-in-from-top-2 flex flex-col items-center gap-2 ${showSignupPrompt ? 'bg-orange-500/20 border-orange-500/50 text-orange-200' : 'bg-red-500/20 border-red-500/50 text-red-200'}`}>
                        <div className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>

                        {showSignupPrompt && (
                            <Link href="/signup" className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-xs hover:bg-orange-600 transition-colors w-full">
                                Create a New Account
                            </Link>
                        )}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="relative group">
                            <Lock
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 border-gray-600 bg-gray-800"
                            />
                            <span className="text-gray-400 font-medium">Remember me</span>
                        </label>
                        <Link
                            href="#"
                            className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Sign In <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-gray-500 font-medium bg-[#1e293b]/0 backdrop-blur-sm">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full mt-6 bg-white text-gray-900 border border-transparent py-3.5 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="font-medium text-gray-400 text-xs text-center mt-8">
                        Don't have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-blue-400 cursor-pointer hover:text-blue-300 hover:underline font-bold ml-1"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 text-center w-full text-xs text-gray-500 font-medium">
                <span>&copy; 2024 AstharHat. All rights reserved.</span>
            </div>
        </div>
    );
}
