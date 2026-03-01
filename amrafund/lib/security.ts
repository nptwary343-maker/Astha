import { AMRAFUND_CONFIG } from '../config';

/**
 * Security Vault for AmraFund Documents
 * Handles hashing and verification to prevent fraud.
 */

export async function generateDocumentHash(data: string): Promise<string> {
    const salt = process.env.DOCUMENT_SECRET_SALT || '';
    const msgBuffer = new TextEncoder().encode(data + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyDocument(data: string, hash: string): Promise<boolean> {
    return (await generateDocumentHash(data)) === hash;
}

/**
 * Audit Logger for Transparent Operations
 */
export async function logAction(db: any, log: {
    action: string;
    performedBy: string;
    targetId: string;
    details: any;
    ipAddress: string;
}) {
    const auditCollection = db.collection('amrafund_audit_logs');
    await auditCollection.insertOne({
        ...log,
        timestamp: new Date(),
        projectName: AMRAFUND_CONFIG.name
    });
}
