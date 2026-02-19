'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string, duration?: number) => {
        showToast('success', message, duration);
    }, [showToast]);

    const error = useCallback((message: string, duration?: number) => {
        showToast('error', message, duration);
    }, [showToast]);

    const warning = useCallback((message: string, duration?: number) => {
        showToast('warning', message, duration);
    }, [showToast]);

    const info = useCallback((message: string, duration?: number) => {
        showToast('info', message, duration);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const config = getToastConfig(toast.type);

    return (
        <div
            className={`${config.bg} ${config.border} ${config.text} border-l-4 rounded-xl p-4 pr-12 shadow-2xl backdrop-blur-md pointer-events-auto animate-in slide-in-from-right-full duration-300 relative min-w-[320px]`}
        >
            <div className="flex items-start gap-3">
                <div className={`${config.iconBg} p-2 rounded-lg`}>
                    {config.icon}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm mb-1">{config.title}</p>
                    <p className="text-sm opacity-90">{toast.message}</p>
                </div>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="absolute top-3 right-3 text-current opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Close"
            >
                <X size={18} />
            </button>
        </div>
    );
}

function getToastConfig(type: ToastType) {
    switch (type) {
        case 'success':
            return {
                title: 'Success',
                bg: 'bg-green-50/95',
                border: 'border-green-500',
                text: 'text-green-900',
                iconBg: 'bg-green-100',
                icon: <CheckCircle className="text-green-600" size={20} />
            };
        case 'error':
            return {
                title: 'Error',
                bg: 'bg-red-50/95',
                border: 'border-red-500',
                text: 'text-red-900',
                iconBg: 'bg-red-100',
                icon: <AlertCircle className="text-red-600" size={20} />
            };
        case 'warning':
            return {
                title: 'Warning',
                bg: 'bg-yellow-50/95',
                border: 'border-yellow-500',
                text: 'text-yellow-900',
                iconBg: 'bg-yellow-100',
                icon: <AlertTriangle className="text-yellow-600" size={20} />
            };
        case 'info':
            return {
                title: 'Info',
                bg: 'bg-blue-50/95',
                border: 'border-blue-500',
                text: 'text-blue-900',
                iconBg: 'bg-blue-100',
                icon: <Info className="text-blue-600" size={20} />
            };
    }
}
