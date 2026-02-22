'use client';
import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, collection, query, orderBy, limit, onSnapshot } from '@/lib/firebase';

export default function SystemHealthSignal() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastPulse, setLastPulse] = useState<any>(null);

    const checkHealth = async () => {
        setRefreshing(true);
        try {
            const secret = localStorage.getItem('INTERNAL_API_SECRET') || 'dev_secret_bypass';
            const res = await fetch('/api/availability-ping', {
                headers: { 'Authorization': `Bearer ${secret}` }
            });
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            console.error("Health check failed", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        checkHealth();

        // 📡 REAL-TIME PULSE MONITOR (Zero Trust Verification)
        const q = query(collection(db, 'system_signals'), orderBy('timestamp', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLastPulse(snapshot.docs[0].data());
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-8 bg-gray-100 rounded"></div>
                <div className="h-8 bg-gray-100 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-none">System Health Signal</h2>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none mt-1 inline-block">Live Heartbeat</span>
                    </div>
                </div>
                <button
                    onClick={checkHealth}
                    disabled={refreshing}
                    className={`p-2 text-gray-400 hover:text-blue-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Firebase Signal */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <Database size={16} className="text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Firebase Source</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${status?.checks?.firebase?.status?.includes('🟢') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {status?.checks?.firebase?.status || 'OFFLINE'}
                    </span>
                </div>

                {/* Logic Signal (Analysis) */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Cart Analysis Logic</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400">{status?.checks?.cart_analysis?.latency}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${status?.checks?.cart_analysis?.status?.includes('🟢') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {status?.checks?.cart_analysis?.status || 'ERROR'}
                        </span>
                    </div>
                </div>

                {/* Real-time Pulse Status */}
                {lastPulse && (
                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[11px] font-bold text-emerald-700 uppercase">Latest Pulse Detected</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600/60">
                            {lastPulse.timestamp?.toDate ? lastPulse.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {status?.overall_status === 'HEALTHY' ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                        <AlertCircle size={14} className="text-orange-500" />
                    )}
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Hosting Readiness: {status?.hosting_readiness?.status}
                    </span>
                </div>
                <div className="text-[10px] text-gray-300 font-mono">
                    {status?.timestamp?.split('T')[1].split('.')[0]}
                </div>
            </div>
        </div>
    );
}
