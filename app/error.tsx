'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw, Home, Ban } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [hasReachedLimit, setHasReachedLimit] = useState(false);

    useEffect(() => {
        // Log the error to console and potentially an error tracking service
        console.error("🚨 CRITICAL_UI_ERROR:", error.message, error.digest);

        // Handle Hydration Mismatch (Ghost Error)
        if (error.message.includes('hydration') || error.message.includes('Hydration')) {
            console.warn("🛡️ GHOST_ERROR_DETECTED: Checking recovery limits...");

            // Limit retries using session storage to prevent infinite loops
            const currentRetries = parseInt(sessionStorage.getItem('hydration_retry_count') || '0', 10);

            if (currentRetries >= 3) {
                console.error("⛔ AUTO_RECOVERY HALTED: Maximum hydration retry limit exceeded (Cascading Failure Prevention)");
                setHasReachedLimit(true);
                return;
            }

            // Increment retry count
            sessionStorage.setItem('hydration_retry_count', (currentRetries + 1).toString());

            // Auto-reset after a short delay
            const timer = setTimeout(() => reset(), 1000);
            return () => clearTimeout(timer);
        }
    }, [error, reset]);

    const handleManualReset = () => {
        // Reset the counter if user manually clicks try again
        sessionStorage.removeItem('hydration_retry_count');
        setHasReachedLimit(false);
        reset();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-center px-6 selection:bg-red-500/20">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-20 h-20 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-3xl flex items-center justify-center text-red-600 dark:text-red-400">
                    <AlertTriangle size={40} />
                </div>
            </div>

            <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic mb-2">
                System <span className="text-red-600">Interruption</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-10 leading-relaxed font-medium">
                Our Zero Trust engine detected a UI mismatch or application error.
                We've logged the incident and recommend resetting the interface state.
            </p>

            {hasReachedLimit ? (
                // Fallback UI when auto-refresh limit is reached
                <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-sm bg-red-50/50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/50">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-xs mb-2">
                        <Ban size={16} /> Loop Prevented
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        We stopped an endless reload cycle. Please try a manual refresh or go back home.
                    </p>
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={handleManualReset}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                        >
                            <RefreshCcw size={16} />
                            Force Reload
                        </button>
                        <Link
                            href="/"
                            onClick={() => sessionStorage.removeItem('hydration_retry_count')}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10"
                        >
                            <Home size={16} />
                            Return Home
                        </Link>
                    </div>
                </div>
            ) : (
                // Default Recovery Actions
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <button
                        onClick={handleManualReset}
                        className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 dark:shadow-white/5"
                    >
                        <RefreshCcw size={16} />
                        Reset State
                    </button>
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10"
                    >
                        <Home size={16} />
                        Return Home
                    </Link>
                </div>
            )}

            <div className="mt-12 flex flex-col items-center gap-2">
                <div className="text-[10px] font-mono text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em]">
                    Digest: {error.digest || "SILENT_FAILURE_O1"}
                </div>
                {error.message && (
                    <div className="text-[9px] font-mono text-red-500/50 uppercase tracking-tight max-w-lg truncate">
                        Trace: {error.message}
                    </div>
                )}
            </div>
        </div>
    );
}
