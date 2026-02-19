// 🛡️ EDGE MIGRATION: 'mongodb' driver is incompatible with Cloudflare Pages (TCP).
// This file is stubbed to prevent build errors.
// All logic relying on this should be refactored to use HTTP APIs (Data API) or Firebase.

const clientPromise: Promise<any> = new Promise((resolve, reject) => {
    const error = new Error("❌ MONGODB_DISABLED: The MongoDB Node.js driver is removed for Edge compatibility. Refactor to use HTTP-based Data API.");
    console.error(error.message);
    reject(error);
});

export default clientPromise;
