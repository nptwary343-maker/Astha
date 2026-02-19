/**
 * Centralized Error Handling System
 * Provides structured error management, logging, and user-friendly messages
 */

import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Error Types
export enum ErrorType {
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    NOT_FOUND = 'NOT_FOUND',
    DATABASE = 'DATABASE',
    NETWORK = 'NETWORK',
    RATE_LIMIT = 'RATE_LIMIT',
    PAYMENT = 'PAYMENT',
    FILE_UPLOAD = 'FILE_UPLOAD',
    THIRD_PARTY_API = 'THIRD_PARTY_API',
    UNKNOWN = 'UNKNOWN'
}

// Severity Levels
export enum Severity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

// Structured Error Interface
export interface AppError {
    type: ErrorType;
    severity: Severity;
    message: string;
    userMessage: string;
    stack?: string;
    metadata?: Record<string, any>;
    timestamp: string;
}

// Error Messages Map for User-Friendly Display
const ERROR_MESSAGES: Record<ErrorType, string> = {
    [ErrorType.VALIDATION]: 'Please check your input and try again.',
    [ErrorType.AUTHENTICATION]: 'Authentication failed. Please log in again.',
    [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
    [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorType.DATABASE]: 'A database error occurred. Please try again later.',
    [ErrorType.NETWORK]: 'Network connection failed. Please check your internet connection.',
    [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorType.PAYMENT]: 'Payment processing failed. Please try again or contact support.',
    [ErrorType.FILE_UPLOAD]: 'File upload failed. Please try again.',
    [ErrorType.THIRD_PARTY_API]: 'External service error. Please try again later.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Create a structured application error
 */
export function createError(
    type: ErrorType,
    message: string,
    severity: Severity = Severity.MEDIUM,
    metadata?: Record<string, any>,
    customUserMessage?: string
): AppError {
    return {
        type,
        severity,
        message,
        userMessage: customUserMessage || ERROR_MESSAGES[type],
        stack: new Error().stack,
        metadata,
        timestamp: new Date().toISOString()
    };
}

/**
 * Log error to console based on severity
 */
export function logError(error: AppError): void {
    const logMessage = `[${error.severity}] ${error.type}: ${error.message}`;

    switch (error.severity) {
        case Severity.CRITICAL:
        case Severity.HIGH:
            console.error(logMessage, {
                userMessage: error.userMessage,
                metadata: error.metadata,
                stack: error.stack,
                timestamp: error.timestamp
            });
            break;
        case Severity.MEDIUM:
            console.warn(logMessage, {
                metadata: error.metadata,
                timestamp: error.timestamp
            });
            break;
        case Severity.LOW:
            console.log(logMessage, {
                metadata: error.metadata,
                timestamp: error.timestamp
            });
            break;
    }
}

/**
 * Send error to Firebase for persistent logging (async, non-blocking)
 */
export async function persistError(error: AppError): Promise<void> {
    // Only persist medium and higher severity errors
    if (error.severity === Severity.LOW) return;

    try {
        await addDoc(collection(db, 'error_logs'), {
            ...error,
            // Remove stack trace from persisted data for privacy
            stack: undefined,
            persistedAt: new Date().toISOString()
        });
    } catch (e) {
        // Fail silently - don't let error logging break the app
        console.error('Failed to persist error:', e);
    }
}

/**
 * Handle and process an error comprehensively
 */
export async function handleError(
    type: ErrorType,
    error: any,
    severity: Severity = Severity.MEDIUM,
    metadata?: Record<string, any>,
    customUserMessage?: string
): Promise<AppError> {
    const message = error instanceof Error ? error.message : String(error);
    const appError = createError(type, message, severity, metadata, customUserMessage);

    // Log to console
    logError(appError);

    // Persist to database (non-blocking)
    if (severity >= Severity.MEDIUM) {
        persistError(appError).catch(console.error);
    }

    return appError;
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorType: ErrorType = ErrorType.UNKNOWN,
    severity: Severity = Severity.MEDIUM
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            const appError = await handleError(errorType, error, severity, {
                functionName: fn.name,
                arguments: args
            });
            throw appError;
        }
    }) as T;
}

/**
 * Client-side error boundary helper
 */
export function getErrorDisplayMessage(error: any): string {
    if (error && typeof error === 'object' && 'userMessage' in error) {
        return error.userMessage;
    }
    return ERROR_MESSAGES[ErrorType.UNKNOWN];
}

/**
 * API Response Error Helper
 */
export function createApiError(
    type: ErrorType,
    message: string,
    statusCode: number = 500,
    metadata?: Record<string, any>
): { error: AppError; statusCode: number } {
    const error = createError(
        type,
        message,
        statusCode >= 500 ? Severity.HIGH : Severity.MEDIUM,
        metadata
    );

    return { error, statusCode };
}

/**
 * Parse and classify unknown errors
 */
export function classifyError(error: any): ErrorType {
    const message = error?.message?.toLowerCase() || String(error).toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
        return ErrorType.NETWORK;
    }
    if (message.includes('auth') || message.includes('token') || message.includes('permission')) {
        return ErrorType.AUTHENTICATION;
    }
    if (message.includes('not found') || message.includes('404')) {
        return ErrorType.NOT_FOUND;
    }
    if (message.includes('firebase') || message.includes('database') || message.includes('query')) {
        return ErrorType.DATABASE;
    }
    if (message.includes('rate limit') || message.includes('429')) {
        return ErrorType.RATE_LIMIT;
    }
    if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION;
    }

    return ErrorType.UNKNOWN;
}

/**
 * Smart error handler that auto-classifies errors
 */
export async function smartHandleError(
    error: any,
    customMetadata?: Record<string, any>
): Promise<AppError> {
    const type = classifyError(error);
    const severity = type === ErrorType.DATABASE || type === ErrorType.NETWORK
        ? Severity.HIGH
        : Severity.MEDIUM;

    return handleError(type, error, severity, customMetadata);
}
