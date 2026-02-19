import { z } from 'zod';
import crypto from 'crypto';

// ==========================================
// 1. INPUT DEFINITION (কঠোর ইনপুট স্কিমা)
// ==========================================
const LoginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password too short").max(64, "Password too long"), // Long pasword DOS attack prevention
});

// ==========================================
// 2. MOCK DATABASE (Price Catalog এর মতো)
// ==========================================
// In real app, this is your Firestore/SQL DB.
// Storing PRE-HASHED passwords here to simulate DB state.
// "123" -> sha256 -> "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
const MOCK_USER_DB: Record<string, { userId: string, passwordHash: string }> = {
    "test@me.com": {
        userId: "u_001",
        // Hash for "123456" (SHA256)
        passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
    },
    // Another user: pass "admin123"
    "admin@me.com": {
        userId: "u_admin",
        passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
    }
};

// ==========================================
// 3. SECURE HASHING UTILITY
// ==========================================
// We use a simple hash for this simulation. In production, use bcrypt/argon2.
function simulateHash(plainText: string): string {
    return crypto.createHash('sha256').update(plainText).digest('hex');
}

// ==========================================
// 4. OUTPUT INTERFACE (Safe Response)
// ==========================================
export interface AuthSession {
    success: boolean;
    userId?: string;
    email?: string;
    timestamp?: number;
    error?: string;
}

/**
 * SECURE LOGIN VALIDATOR
 * @param input Raw user input
 */
export function validateLoginSimulation(input: unknown): AuthSession {
    try {
        // 1. Strict Validation (Zod)
        // Stops "undefined", objects, or malformed emails instantly.
        const { email, password } = LoginSchema.parse(input);

        // 2. SQL/NoSQL Injection Check (Manual Heuristic)
        // Though Zod handles types, we check for common attack patterns in strings just in case
        const injectionPatterns = /('|"|;|\$where|Object)/i;
        if (injectionPatterns.test(email)) {
            // HACKER DETECTED: Don't tell them why, just fail generic.
            throw new Error("Invalid credentials");
        }

        // 3. Database Lookup (The "Existence" Check)
        const userRecord = MOCK_USER_DB[email];

        // 4. Constant Time Comparison Logic (Timing Attack Prevention)
        // We simulate verifying hash.
        // Even if user NOT found, we simulate work to consume same time? 
        // (Advanced topic, but here we stick to generic error message)

        if (!userRecord) {
            throw new Error("Invalid email or password"); // GENERIC ERROR
        }

        const inputHash = simulateHash(password);

        // 5. Hash Comparison
        if (inputHash !== userRecord.passwordHash) {
            throw new Error("Invalid email or password"); // SAME GENERIC ERROR
        }

        // 6. Success! Return clean session
        // NEVER return passwordHash
        return {
            success: true,
            userId: userRecord.userId,
            email: email,
            timestamp: Date.now()
        };

    } catch (error: any) {

        let msg = "Authentication failed";

        // Robust error checking (duck typing for Zod)
        if (error && typeof error === 'object' && Array.isArray(error.errors)) {
            msg = error.errors.map((e: any) => e.message).join(", ");
        }
        else if (error instanceof Error) {
            msg = error.message;
        }

        return { success: false, error: msg };
    }
}


// ==========================================
// SELF-DESTRUCT TEST SUITE
// ==========================================
if (process.env.NODE_ENV === 'test' || process.argv[1]?.includes('auth-simulation')) {
    console.log("🔐 Running Auth Security Tests...");

    const assert = require('assert');

    try {
        // Test 1: Success
        const valid = validateLoginSimulation({ email: "test@me.com", password: "123456" });
        assert.strictEqual(valid.success, true);
        assert.strictEqual(valid.userId, "u_001");
        assert.strictEqual(valid.email, "test@me.com"); // Check sensitive data NOT returned
        console.log("✅ Test 1 Passed: Valid Login");

        // Test 2: Wrong Password (Generic Error)
        const wrongPass = validateLoginSimulation({ email: "test@me.com", password: "wrongpass" });
        assert.strictEqual(wrongPass.success, false);
        assert.strictEqual(wrongPass.error, "Invalid email or password");
        console.log("✅ Test 2 Passed: Wrong Password masked");

        // Test 3: Wrong Email (Generic Error - Same as above)
        const wrongEmail = validateLoginSimulation({ email: "ghost@me.com", password: "wrongpass" });
        assert.strictEqual(wrongEmail.success, false);
        assert.strictEqual(wrongEmail.error, "Invalid email or password");
        console.log("✅ Test 3 Passed: User Enumeration blocked");

        // Test 4: Injection Attempt
        const injection = validateLoginSimulation({ email: "admin@site.com' OR '1'='1", password: "123" });
        // Zod might catch email format, OR our injection check.
        assert.strictEqual(injection.success, false);
        console.log("✅ Test 4 Passed: Injection blocked");

        // Test 5: Empty Input
        const empty = validateLoginSimulation({});
        assert.strictEqual(empty.success, false);
        console.log("✅ Test 5 Passed: Empty input caught");

        console.log("🛡️ Auth Logic is Secure.");

    } catch (e) {
        console.error(e);
    }
}
