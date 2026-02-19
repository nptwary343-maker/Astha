// 🛡️ EDGE MIGRATION: 'firebase-admin' is incompatible with Cloudflare Pages (Node.js runtime).
// This file is stubbed. Real Admin operations must use REST APIs or be disabled on Edge.

export function initAdmin() {
    // console.log("Edge: Admin SDK Stub Initialized");
}

const stubProxy = new Proxy({} as any, {
    get: (target, prop) => {
        throw new Error(`❌ FIREBASE_ADMIN_DISABLED: Cannot access '${String(prop)}' on Edge Runtime.`);
    }
});

export const adminDb = stubProxy;
export const adminAuth = stubProxy;
