/**
 * Input Validation Utilities
 * Provides schema validation and sanitization functions
 */

import { ErrorType, createError, Severity } from './error-handler';

/**
 * Validation Result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    sanitized?: any;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
        return { isValid: false, errors };
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        errors.push('Invalid email format');
    }

    if (trimmed.length > 254) {
        errors.push('Email is too long');
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized: trimmed
    };
}

/**
 * Phone number validation (Bangladesh format)
 */
export function validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];

    if (!phone || typeof phone !== 'string') {
        errors.push('Phone number is required');
        return { isValid: false, errors };
    }

    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // Bangladesh phone format: 01XXXXXXXXX (11 digits)
    const phoneRegex = /^01[3-9]\d{8}$/;

    if (!phoneRegex.test(cleaned)) {
        errors.push('Invalid phone number format (expected: 01XXXXXXXXX)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized: cleaned
    };
}

/**
 * Required field validation
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (value === null || value === undefined || value === '') {
        errors.push(`${fieldName} is required`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * String length validation
 */
export function validateLength(
    value: string,
    min: number,
    max: number,
    fieldName: string
): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
        return { isValid: false, errors };
    }

    if (value.length < min) {
        errors.push(`${fieldName} must be at least ${min} characters`);
    }

    if (value.length > max) {
        errors.push(`${fieldName} must be at most ${max} characters`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Number range validation
 */
export function validateRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${fieldName} must be a number`);
        return { isValid: false, errors };
    }

    if (value < min) {
        errors.push(`${fieldName} must be at least ${min}`);
    }

    if (value > max) {
        errors.push(`${fieldName} must be at most ${max}`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Array validation
 */
export function validateArray(
    value: any,
    minLength: number = 0,
    maxLength: number = Infinity,
    fieldName: string = 'Array'
): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(value)) {
        errors.push(`${fieldName} must be an array`);
        return { isValid: false, errors };
    }

    if (value.length < minLength) {
        errors.push(`${fieldName} must have at least ${minLength} items`);
    }

    if (value.length > maxLength) {
        errors.push(`${fieldName} must have at most ${maxLength} items`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * URL validation
 */
export function validateUrl(url: string, fieldName: string = 'URL'): ValidationResult {
    const errors: string[] = [];

    if (!url || typeof url !== 'string') {
        errors.push(`${fieldName} is required`);
        return { isValid: false, errors };
    }

    try {
        new URL(url);
    } catch (e) {
        errors.push(`${fieldName} is not a valid URL`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Sanitize HTML string (basic XSS prevention)
 */
export function sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';

    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize user input (trim and remove dangerous characters)
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .substring(0, 10000); // Limit length
}

/**
 * Validate object schema
 */
export function validateSchema<T extends Record<string, any>>(
    data: any,
    schema: {
        [K in keyof T]: {
            required?: boolean;
            type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
            validator?: (value: any) => ValidationResult;
            sanitizer?: (value: any) => any;
        };
    }
): ValidationResult & { sanitized?: T } {
    const errors: string[] = [];
    const sanitized: any = {};

    // Check required fields
    for (const [key, rules] of Object.entries(schema)) {
        const value = data[key];

        // Required check
        if (rules.required && (value === null || value === undefined || value === '')) {
            errors.push(`${key} is required`);
            continue;
        }

        // Skip if not required and value is empty
        if (!rules.required && (value === null || value === undefined || value === '')) {
            continue;
        }

        // Type check
        if (rules.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== rules.type) {
                errors.push(`${key} must be of type ${rules.type}`);
                continue;
            }
        }

        // Custom validation
        if (rules.validator) {
            const result = rules.validator(value);
            if (!result.isValid) {
                errors.push(...result.errors.map(e => `${key}: ${e}`));
                continue;
            }
        }

        // Sanitize
        sanitized[key] = rules.sanitizer ? rules.sanitizer(value) : value;
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized: errors.length === 0 ? sanitized as T : undefined
    };
}

/**
 * Create validation error
 */
export function createValidationError(errors: string[]) {
    return createError(
        ErrorType.VALIDATION,
        errors.join('; '),
        Severity.LOW,
        { errors }
    );
}

/**
 * Throw validation error if invalid
 */
export function assertValid(result: ValidationResult): asserts result is ValidationResult & { isValid: true } {
    if (!result.isValid) {
        throw createValidationError(result.errors);
    }
}
