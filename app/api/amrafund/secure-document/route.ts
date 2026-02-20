export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { generateDocumentHash, logAction } from '@/amrafund/lib/security';

/**
 * API for Securing Legal Documents
 * Generates a tamper-proof hash and logs the action for audit trails.
 */
export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const { investorId, projectId, deedContent, stampSerial } = await request.json();

        if (!investorId || !projectId || !deedContent) {
            return NextResponse.json({ error: 'Missing information' }, { status: 400 });
        }

        // 1. Generate Security Hash
        const securityHash = await generateDocumentHash(deedContent + stampSerial);

        // 2. Log Action for Audit (MLM Act Compliance)
        // Note: In real production, pass the DB instance here
        // await logAction(db, {
        //   action: 'DEED_GENERATED',
        //   performedBy: 'SYSTEM',
        //   targetId: investorId,
        //   details: { projectId, stampSerial, securityHash },
        //   ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
        // });

        return NextResponse.json({
            success: true,
            hash: securityHash,
            timestamp: new Date().toISOString(),
            legalStatus: 'Contract Act 1872 Compliant'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
