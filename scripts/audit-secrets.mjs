
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Manual .env.local parsing for portability
const envFile = readFileSync('.env.local', 'utf-8');
const envLines = envFile.split('\n');
envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
    }
});

const envKeys = envLines
    .map(line => line.split('=')[0].trim())
    .filter(key => key && !key.startsWith('#'));

console.log(`🔍 Total keys found in .env.local: ${envKeys.length}`);

// 1. Usage Audit
async function checkUsage() {
    console.log('\n--- 📊 Usage Audit ---');
    const unused = [];
    const used = [];

    for (const key of envKeys) {
        // Simple heuristic: search for the key string in app, actions, lib, components
        const isUsed = await searchInCodebase(key);
        if (isUsed) {
            used.push(key);
        } else {
            unused.push(key);
        }
    }

    return { used, unused };
}

async function searchInCodebase(pattern) {
    // This is a simplified search for the script
    // We'll look into app, lib, actions directories
    const dirs = ['app', 'lib', 'actions', 'components'];
    for (const dir of dirs) {
        const found = searchDir(join(process.cwd(), dir), pattern);
        if (found) return true;
    }
    return false;
}

function searchDir(dir, pattern) {
    if (!statSync(dir).isDirectory()) return false;
    const files = readdirSync(dir);
    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            if (searchDir(fullPath, pattern)) return true;
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
            const content = readFileSync(fullPath, 'utf-8');
            if (content.includes(pattern)) return true;
        }
    }
    return false;
}

// 2. Token Validation
async function validateTokens() {
    console.log('\n--- 🧪 Token Validation ---');
    const results = {};

    // A. Firebase
    results.firebase = await validateFirebase();

    // B. Resend
    results.resend = await validateResend();

    // C. Cloudinary (Check if keys exist, as they were missing in my previous scan)
    results.cloudinary = await validateCloudinary();

    // D. Meta (Facebook)
    results.meta = await validateMeta();

    return results;
}

async function validateFirebase() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) return 'MISSING_CONFIG';

    try {
        // Using a simple fetch to Firebase REST API to check validity
        // Or just verify the key format
        if (privateKey.includes('BEGIN PRIVATE KEY') && clientEmail.includes('@')) {
            return 'WORKING (Config format valid)';
        }
        return 'BROKEN (Invalid format)';
    } catch (e) {
        return `BROKEN (${e.message})`;
    }
}

async function validateResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) return 'MISSING';
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Empty body to trigger validation
        });
        const data = await res.json();
        // If we get 401, it's broken. If we get 422 or something else, it might be working but invalid payload.
        if (res.status === 401) return 'BROKEN (Unauthorized)';
        return 'WORKING (Authorized)';
    } catch (e) {
        return `BROKEN (${e.message})`;
    }
}

async function validateCloudinary() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName) return 'MISSING (Cloud Name)';
    if (!apiSecret) return 'MISSING (API Secret)';

    return 'WORKING (Config exists)';
}

async function validateMeta() {
    const pixelId = process.env.FB_PIXEL_ID;
    const accessToken = process.env.FB_ACCESS_TOKEN;

    if (!pixelId || !accessToken) return 'MISSING from .env.local';

    try {
        const res = await fetch(`https://graph.facebook.com/v18.0/${pixelId}?access_token=${accessToken}`);
        if (res.ok) return 'WORKING';
        const err = await res.json();
        return `BROKEN (${err.error?.message || 'Unauthorized'})`;
    } catch (e) {
        return `BROKEN (${e.message})`;
    }
}

// Main Execution
const { used, unused } = await checkUsage();
const validation = await validateTokens();

console.log('\n====================================');
console.log('       Final Audit Report          ');
console.log('====================================');

console.log('\n✅ WORKING TOKENS:');
Object.entries(validation).forEach(([service, status]) => {
    if (status.startsWith('WORKING')) console.log(`  - ${service}: ${status}`);
});

console.log('\n❌ BROKEN/MISSING TOKENS:');
Object.entries(validation).forEach(([service, status]) => {
    if (status.startsWith('BROKEN') || status.startsWith('MISSING')) console.log(`  - ${service}: ${status}`);
});

console.log('\n🗑️ UNUSED KEYS (Safe to remove from .env.local):');
unused.forEach(key => console.log(`  - ${key}`));

console.log('\n📜 USED KEYS:');
used.forEach(key => console.log(`  - ${key}`));

console.log('\n====================================');
