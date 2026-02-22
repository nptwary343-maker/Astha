# Security & Logic Analysis Report

**Generated for:** User
**Date:** 2026-02-06
**Status:** Build Passed (Exit Code 0)

---

## 1. Executive Summary

This report provides a line-by-line security and logic analysis of the core e-commerce modules. The application utilizes a "Zero Trust" architecture where the frontend is treated as untrusted, and all critical business logic (pricing, stock, validation) is enforced strictly on the server side (`actions/checkout.ts`).

**Key Security Features Implemented:**
- **Price Tampering Prevention:** Prices are recalculated on the server; client-sent prices are ignored or verified.
- **Race Condition Handling:** Firestore Transactions ensure stock is not oversold.
- **Rate Limiting:** IP-based and User-based throttling to prevent abuse.
- **Input Sanitization:** schema validation using `zod`.
- **RBAC:** Role-Based Access Control in middleware.

---

## 2. Detailed Code Analysis

### A. Secure Checkout Action (`actions/checkout.ts`)

This file is the "Gatekeeper" of the system. It executes in a secure Node.js environment.

#### **Imports & Setup**
- **Lines 1-8:** Uses `'use server'` to ensure code never leaks to the client. Imports `runTransaction` from Firestore SDK to handle atomic operations.
- **Line 10-25 (Zod Schemas):** Strictly defines allowed input.
    - `OrderItemInput`: Enforces `productId` (string) and `quantity` (positive int). `expectedPrice` is kept for "Price Watchdog" logic but not used for calculation.
    - `CustomerInput`: Validates phone number length and required fields. `trxId` is optional but validated if payment is 'bkash'.

#### **Security Gate 0: Proactive Firewall (Lines 46-58)**
- **Logic:** Checks `ip_locks` collection for the user's IP.
- **Security:** Implements a "Cooldown" mechanism (30 seconds). If an IP attempts rapidly, it throws a `SECURITY_BLOCK` error. This prevents denial-of-service (DoS) attempts on the checkout endpoint.

#### **Security Gate 1: Dynamic Order Limit (Lines 60-69)**
- **Logic:** Fetches settings from `settings-engine`.
- **Security:** Allows admins to "Lock" the store globally (`globalLock`). If set, no orders are processed. This is critical for maintenance or during an attack.

#### **Data Normalization & Sanitization (Lines 73-87)**
- **Logic:** Normalizes email addresses (ignoring dots in Gmail).
- **Security:** Checks against a "Disposable Email Blacklist" to prevent fraud accounts.

#### **User Throttling (Lines 89-109)**
- **Logic:** Queries the `orders` collection for recent orders by this user.
- **Security:** Enforces `maxOrdersPerUser` (e.g., 5 orders per 2 hours). If exceeded, it logs a security alert and blocks the request.

#### **Atomic Transaction Block (Lines 120-243)**
This is the most critical part. `runTransaction` ensures ACID compliance.
1.  **Read Phase:**
    - Reads all product docs, duplicate transaction checks (`trxId`), and idempotency keys *before* making any writes.
    - **Stock Check (Line 162):** `if (currentStock < item.quantity) throw Error`. Ensures we never oversell.
    - **Price Watchdog (Line 169):** Compares `data.price` (Server DB) vs `item.expectedPrice` (Client perception). If they differ (e.g., user updated page but price changed in BG), it aborts to protect the user and business.
2.  **Calculation:**
    - `calculateOrderTotal` is called with *Server Prices*. Client prices are essentially ignored for the final total.
3.  **Write Phase:**
    - Deducts stock (`stock - quantity`).
    - Creates the Order Document with `status: 'Pending'`.
    - Locks the IP and saves the specific Idempotency Key to prevent double-submission.

### B. Client-Side Secure Submission (`app/cart/page.tsx`)

#### **Imports & State**
- **Lines 1-9:** Standard React imports. Note: Imports `db` and `auth` from `@/lib/firebase`.
- **Price Sync Engine (Lines 31-65):**
    - Uses `onSnapshot` to listen to real-time price changes for items in the cart.
    - **UX/Security:** If a price changes in the DB, the cart updates immediately and notifies the user (`Price Updated` banner), reducing the chance of the "Price Watchdog" error during checkout.

#### **Secure Payload Construction (Lines 216-236)**
- **Stripping Sensitive Data:** `cleanItems` maps only `productId` and `quantity`. It does *not* trust the client to calculate the total.
- **Idempotency Key:** Generates a unique key (`idem_${uid}_${time}`). This key is sent to the server. If the user double-clicks "Confirm", the server sees the same key and rejects the second attempt.
- **Identity Proof:** `auth.currentUser?.getIdToken()` is fetched. While the current implementation checks for its existence, a full implementation would verify this JWT signature on the server (via Firebase Admin SDK) to prove the user is who they claim to be.

### C. Admin & Rules Engine (`lib/settings-engine.ts`)

- **Caching Strategy:** Uses `unstable_cache` with a tag `store-settings`. This minimizes database reads (cost-saving) but allows instant invalidation when an admin updates settings.
- **Fail-Safe:** If DB read fails, it falls back to `DEFAULT_SETTINGS` (Safe defaults) to keep the store running.
- **Audit Logging (Lines 80-88):** Every change to settings is logged to `audit_logs` with `performedBy` (Admin Email). This ensures accountability.

### D. Middleware Protection (`middleware.ts`)

- **Scope:** Runs only on `/admin/*` routes.
- **Session Check:** Looks for `admin-session` cookie. If missing -> Redirect to login.
- **Role Validation (Lines 17-43):**
    - Performs a "Pessimistic Check" against Firestore (via REST API to avoid heavy Admin SDK in middleware).
    - Verifies the user's role is `admin` or `super_admin`.
    - If a user tries to forge a cookie, the DB check will fail (or role will be mismatch), blocking access.

---

## 3. Recommendations & Next Steps

1.  **JWT Verification:**
    - Currently, `actions/checkout.ts` checks for `idToken` presence. You should integrate `firebase-admin` (server-side) to cryptographically verify this token (`admin.auth().verifyIdToken(idToken)`) to extract the `uid` reliably instead of trusting `customer.userId` completely.

2.  **Payment Verification:**
    - The bkash `trxId` verification is currently a "Duplicate Check" (preventing reuse). You should ideally integrate a real-time call to the Bkash Merchant API to validate the Transaction ID validity and Amount before determining the order status.

3.  **Bot Protection:**
    - Consider adding a reCAPTCHA v3 score check in the `placeOrderAction` for an additional layer of defense against automated scalping bots.

4.  **Database Indexing:**
    - Ensure composite indexes are created in Firestore for queries like `orders` where `customer.userId` and `createdAt` are used together, to ensure performant queries as the dataset grows.

---
**Report generated by Antigravity AI**
