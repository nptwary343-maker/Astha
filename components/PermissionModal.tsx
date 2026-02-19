'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ShieldCheck } from 'lucide-react';

interface PermissionModalProps {
    isOpen: boolean;
    onAllow: () => void;
    onDeny: () => void;
}

export default function PermissionModal({ isOpen, onAllow, onDeny }: PermissionModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
                    >
                        {/* Header Image / Icon */}
                        <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-8 text-center relative">
                            <button
                                onClick={onDeny}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 text-white shadow-inner">
                                <Bell size={32} className="animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Get Order Updates</h3>
                            <p className="text-orange-100 text-sm mt-1 max-w-[200px] mx-auto">
                                Don't miss out on your delivery status!
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5">
                                        <ShieldCheck size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Real-time Tracking</p>
                                        <p className="text-xs text-gray-500">Know exactly when your food arrives.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 mt-0.5">
                                        <Bell size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Instant Alerts</p>
                                        <p className="text-xs text-gray-500">Get notified for payment confirmations.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    onClick={onAllow}
                                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Enable Notifications
                                </button>
                                <button
                                    onClick={onDeny}
                                    className="w-full py-3 text-gray-500 font-bold text-xs hover:text-gray-800 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
