"use client";
export const runtime = 'edge';


import Link from "next/link";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        altPhone: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName) return "Name is required.";
        if (
            !/^[a-zA-Z\s]*$/.test(formData.firstName) ||
            !/^[a-zA-Z\s]*$/.test(formData.lastName)
        )
            return "Names can only contain letters.";
        if (!formData.email.includes("@")) return "Invalid email address.";
        if (formData.password.length < 8)
            return "Password must be at least 8 characters long.";
        if (!/\d/.test(formData.password))
            return "Password must contain at least one number.";
        if (formData.password !== formData.confirmPassword)
            return "Passwords do not match.";
        return null;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        try {
            const { createUserWithEmailAndPassword, updateProfile } = await import(
                "firebase/auth"
            );
            const { doc, setDoc, serverTimestamp } = await import(
                "firebase/firestore"
            );
            const { db } = await import("@/lib/firebase");

            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // 2. Update Display Name
            await updateProfile(user, {
                displayName: `${formData.firstName} ${formData.lastName}`,
            });

            // 3. Save User Data to Firestore (Securely)
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                altPhone: formData.altPhone,
                role: "user",
                createdAt: serverTimestamp(),
                settings: {
                    notifications: true,
                    twoFactor: false,
                },
            });

            // 🛡️ SYNC COOKIES (Essential for middleware) - GHOST FIX
            const token = await user.getIdToken(true);
            document.cookie = `user-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;

            // 4. Redirect
            router.push("/account");
        } catch (err: any) {
            console.error("🚨 SIGNUP_SYSTEM_ERROR:", err);
            if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please login.");
            } else {
                setError("Safety block: System ghosting during account creation. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            googleProvider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    firstName: user.displayName?.split(" ")[0] || "",
                    lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
                    email: user.email,
                    role: "user",
                    createdAt: serverTimestamp(),
                });
            }

            // 🛡️ SYNC COOKIES (Essential for middleware) - GHOST FIX
            const token = await user.getIdToken(true);
            document.cookie = `user-session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;

            router.push("/account");
        } catch (error: any) {
            console.error("🚨 GOOGLE_SIGNUP_ERROR:", error);
            setIsLoading(false);
            if (error.code === "auth/cancelled-popup-request" || error.code === "auth/popup-closed-by-user") return;
            setError("Google login failed. Please refresh and try again.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0F172A]">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse delay-2000"></div>

            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-500 my-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        Create Account
                    </h2>
                    <p className="text-gray-400 text-sm">Join AstharHat today</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-4 rounded-xl text-sm font-medium mb-6 text-center border border-red-500/50 flex items-center justify-center gap-2 animate-pulse">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSignup}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative group">
                            <User
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="text"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="First Name"
                            />
                        </div>
                        <div className="relative group">
                            <User
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="text"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <Mail
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors"
                            size={20}
                        />
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                            placeholder="Email Address"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative group">
                            <Phone
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="Primary Phone"
                            />
                        </div>
                        <div className="relative group">
                            <Phone
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="tel"
                                name="altPhone"
                                value={formData.altPhone}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="Alt Phone (Optional)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative group">
                            <Lock
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="Password"
                            />
                        </div>
                        <div className="relative group">
                            <Lock
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors"
                                size={20}
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium text-white placeholder:text-gray-500"
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Create Account <ArrowRight size={20} />
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
                        Sign up with Google
                    </button>

                    <div className="text-center text-sm pt-8">
                        <span className="text-gray-400">Already have an account? </span>
                        <Link
                            href="/login"
                            className="text-orange-400 font-bold hover:text-orange-300 hover:underline"
                        >
                            Sign in
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
