'use client';

import { Shield, Lock, Eye, Globe } from 'lucide-react';

export default function SecurityAssurancePanel() {
    return (
        <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-2xl">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Shield size={18} className="text-blue-400" />
                </div>
                <h3 className="font-bold tracking-tight text-sm uppercase">Adjacent Assurance</h3>
            </div>

            <div className="space-y-4 relative z-10">
                <SecurityItem
                    icon={Lock}
                    label="Zero Trust Layer"
                    status="Strict Identity"
                    desc="All requests verified via middleware."
                />
                <SecurityItem
                    icon={Eye}
                    label="Silent Error Monitoring"
                    status="Active"
                    desc="Hydration and ghost errors logged."
                />
                <SecurityItem
                    icon={Globe}
                    label="Signal Pulse"
                    status="Live"
                    desc="Connected to Edge heartbeat."
                />
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Admin Security Level</span>
                    <span className="text-emerald-400">Paramount</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );
}

function SecurityItem({ icon: Icon, label, status, desc }: any) {
    return (
        <div className="group cursor-default">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-blue-400 opacity-70" />
                    <span className="text-xs font-bold text-gray-200">{label}</span>
                </div>
                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-500/20">
                    {status}
                </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight group-hover:text-gray-400 transition-colors">
                {desc}
            </p>
        </div>
    );
}
