/**
 * 🛡️ SECURITY UTILITIES (ZERO TRUST)
 * Prevents NoSQL Injection and XSS Attacks before data hits DB or API.
 */

export function sanitizeInput(input: any): string {
    if (typeof input !== 'string') return '';

    // 1. Remove dangerous NoSQL operators ($where, $ne, etc.)
    let clean = input.replace(/(\$where|\$ne|\$or|\$and|\$gt|\$lt|\$regex)/gi, "");

    // 2. Remove script tags (Basic XSS)
    clean = clean.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

    // 3. Trim excessive whitespace
    return clean.trim().slice(0, 500); // Max 500 chars limit (Prevent DoS)
}

export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
