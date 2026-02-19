'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { handleError, ErrorType, Severity, getErrorDisplayMessage } from '@/lib/error-handler';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * Catches React errors and provides user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            errorInfo
        });

        // Log error using our error handler
        handleError(
            ErrorType.UNKNOWN,
            error,
            Severity.HIGH,
            {
                componentStack: errorInfo.componentStack,
                errorBoundary: 'GlobalErrorBoundary'
            }
        ).catch(console.error);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
                        {/* Error Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="bg-red-100 p-6 rounded-full">
                                <AlertTriangle className="text-red-600" size={48} />
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            Oops! Something Went Wrong
                        </h1>
                        <p className="text-gray-600 mb-8 text-lg">
                            {this.state.error
                                ? getErrorDisplayMessage(this.state.error)
                                : 'An unexpected error occurred. Please try again.'}
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-8 text-left bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-auto max-h-48">
                                <p className="font-bold text-red-400 mb-2">Error:</p>
                                <p className="mb-4">{this.state.error.message}</p>
                                {this.state.error.stack && (
                                    <>
                                        <p className="font-bold text-red-400 mb-2">Stack:</p>
                                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <RefreshCw size={20} />
                                Try Again
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <Home size={20} />
                                Go Home
                            </button>
                        </div>

                        {/* Reload Suggestion */}
                        <p className="mt-6 text-sm text-gray-500">
                            If the problem persists,{' '}
                            <button
                                onClick={this.handleReload}
                                className="text-blue-600 hover:text-blue-700 font-bold underline"
                            >
                                reload the page
                            </button>
                            {' '}or contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
