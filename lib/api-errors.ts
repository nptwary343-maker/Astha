/**
 * API Error Utilities
 * Standardized error responses for API routes
 */

import { NextResponse } from 'next/server';
import { ErrorType, Severity, createError, logError, persistError } from './error-handler';

export interface ApiErrorResponse {
    success: false;
    error: {
        type: ErrorType;
        message: string;
        userMessage: string;
        timestamp: string;
        requestId?: string;
    };
}

export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    timestamp: string;
}

/**
 * Create standardized API error response
 */
export function apiError(
    type: ErrorType,
    message: string,
    statusCode: number = 500,
    metadata?: Record<string, any>,
    customUserMessage?: string
): NextResponse<ApiErrorResponse> {
    const error = createError(
        type,
        message,
        statusCode >= 500 ? Severity.HIGH : Severity.MEDIUM,
        metadata,
        customUserMessage
    );

    // Log the error
    logError(error);

    // Persist high/critical errors
    if (error.severity >= Severity.MEDIUM) {
        persistError(error).catch(console.error);
    }

    return NextResponse.json(
        {
            success: false,
            error: {
                type: error.type,
                message: process.env.NODE_ENV === 'development' ? error.message : error.userMessage,
                userMessage: error.userMessage,
                timestamp: error.timestamp
            }
        },
        { status: statusCode }
    );
}

/**
 * Create standardized API success response
 */
export function apiSuccess<T = any>(
    data: T,
    statusCode: number = 200
): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            timestamp: new Date().toISOString()
        },
        { status: statusCode }
    );
}

/**
 * Validation error (400)
 */
export function validationError(
    message: string,
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    return apiError(ErrorType.VALIDATION, message, 400, metadata);
}

/**
 * Authentication error (401)
 */
export function authError(
    message: string = 'Authentication required',
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    return apiError(ErrorType.AUTHENTICATION, message, 401, metadata);
}

/**
 * Authorization error (403)
 */
export function forbiddenError(
    message: string = 'Permission denied',
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    return apiError(ErrorType.AUTHORIZATION, message, 403, metadata);
}

/**
 * Not found error (404)
 */
export function notFoundError(
    resource: string = 'Resource',
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    return apiError(ErrorType.NOT_FOUND, `${resource} not found`, 404, metadata);
}

/**
 * Rate limit error (429)
 */
export function rateLimitError(
    retryAfter?: number,
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    const response = apiError(
        ErrorType.RATE_LIMIT,
        'Too many requests',
        429,
        metadata
    );

    if (retryAfter) {
        response.headers.set('Retry-After', String(retryAfter));
    }

    return response;
}

/**
 * Internal server error (500)
 */
export function serverError(
    error: any,
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    const message = error instanceof Error ? error.message : String(error);
    return apiError(ErrorType.UNKNOWN, message, 500, {
        ...metadata,
        originalError: process.env.NODE_ENV === 'development' ? error : undefined
    });
}

/**
 * Database error (500)
 */
export function databaseError(
    error: any,
    operation?: string,
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    const message = error instanceof Error ? error.message : String(error);
    return apiError(ErrorType.DATABASE, message, 500, {
        ...metadata,
        operation,
        originalError: process.env.NODE_ENV === 'development' ? error : undefined
    });
}

/**
 * Network error (503)
 */
export function networkError(
    service?: string,
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    return apiError(
        ErrorType.NETWORK,
        service ? `Failed to connect to ${service}` : 'Network error',
        503,
        metadata
    );
}

/**
 * Third-party API error (502)
 */
export function thirdPartyError(
    service: string,
    error: any,
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    const message = error instanceof Error ? error.message : String(error);
    return apiError(
        ErrorType.THIRD_PARTY_API,
        `${service} error: ${message}`,
        502,
        {
            ...metadata,
            service,
            originalError: process.env.NODE_ENV === 'development' ? error : undefined
        }
    );
}

/**
 * Payment error (402)
 */
export function paymentError(
    message: string,
    metadata?: Record<string, any>
): NextResponse<ApiErrorResponse> {
    return apiError(ErrorType.PAYMENT, message, 402, metadata);
}

/**
 * Wrap API route handler with error handling
 */
export function withApiErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await handler(...args);
        } catch (error) {
            console.error('API Route Error:', error);
            return serverError(error, {
                handler: handler.name
            });
        }
    }) as T;
}

/**
 * Type guard for API error response
 */
export function isApiError(response: any): response is ApiErrorResponse {
    return response && response.success === false && 'error' in response;
}

/**
 * Type guard for API success response
 */
export function isApiSuccess<T = any>(response: any): response is ApiSuccessResponse<T> {
    return response && response.success === true && 'data' in response;
}
