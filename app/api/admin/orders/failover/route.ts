export const runtime = 'edge';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// This is a placeholder for a real MongoDB fetch.
// In a real production setup, you would use the 'mongodb' driver here 
// to fetch orders that were saved when Firebase was down.
export async function GET() {
    try {
        // Mocking some failover orders that would come from MongoDB
        const backupOrders = [
            {
                id: 'backup-' + Date.now(),
                invoiceNumber: 'BKP-001',
                customer: { name: 'Emergency Customer', phone: '01XXXXXXXXX', address: 'Manual Entry via Failover' },
                totals: { total: 5000 },
                orderStatus: 'Pending',
                createdAt: new Date().toISOString(),
                _is_backup: true,
                payment: { method: 'cod', status: 'Unpaid' }
            }
        ];

        return NextResponse.json(backupOrders);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch backup orders' }, { status: 500 });
    }
}
