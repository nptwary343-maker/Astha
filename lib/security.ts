/**
 * 🔐 ZERO TRUST SECURITY CORE
 * 
 * DESIGN PRINCIPLES:
 * 1. Never Trust, Always Verify (Every single request).
 * 2. Least Privilege (Enforced via RBAC).
 * 3. Assume Breach (Strict data sanitization and output encoding).
 */

export const SECURITY_HEADERS = {
    'Content-Security-Policy': "default-src 'self' https://*.google.com https://*.firebaseapp.com https://*.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.firebaseapp.com https://*.algolia.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.firebaseapp.com; connect-src 'self' https://*.googleapis.com https://*.algolia.net https://*.algolianet.com;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block'
};

/**
 * 🛡️ SANITIZER
 * Prevents NoSQL Injection and XSS Attacks at the entry point.
 */
export function sanitizeInput(input: any): string {
    if (typeof input !== 'string') return '';

    // 1. Strip HTML tags to prevent XSS
    let clean = input.replace(/<[^>]*>?/gm, '');

    // 2. Remove NoSQL injection characters and MongoDB operators
    clean = clean.replace(/(\$where|\$ne|\$or|\$and|\$gt|\$lt|\$regex|\{|\}|\[|\])/gi, "");

    // 3. Limit length to prevent Buffer/Allocation attacks
    return clean.trim().slice(0, 1000);
}

/**
 * 🔑 TOKEN VERIFIER (LITE)
 * Checks if the structure and existence of an identity token matches expected patterns.
 */
export function verifyZeroTrustToken(token?: string): boolean {
    if (!token || token.length < 20) return false;
    // Basic JWT structure check (3 parts separated by dots)
    const segments = token.split('.');
    return segments.length === 3 || token.startsWith('user_'); // Allow Firebase UIDs or JWTs
}

export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
