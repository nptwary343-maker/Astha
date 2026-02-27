'use client';

import { useEffect, useState } from 'react';
import { db, collection, query, orderBy, limit, onSnapshot } from '@/lib/firebase';
import { useToast } from '@/components/ToastProvider';
import { Activity, Bell } from 'lucide-react';

/**
 * 📡 GLOBAL SIGNAL WATCHER
 * Listens for system signals (pings, alerts, updates) in real-time
 * and displays them to the user (or admin) via toasts.
 */
export default function GlobalSignalWatcher() {
    const { info, success, warning } = useToast();
    const [lastSeenId, setLastSeenId] = useState<string | null>(null);

    useEffect(() => {
        // 1. Subscribe to Signal Pulse
        const q = query(
            collection(db, 'system_signals'),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) return;

            const doc = snapshot.docs[0];
            const data = doc.data();
            const signalId = doc.id;

            // Prevent showing the initial load as a new notification
            if (!lastSeenId) {
                setLastSeenId(signalId);
                return;
            }

            if (signalId !== lastSeenId) {
                setLastSeenId(signalId);

                // 📡 Broadcast based on type
                switch (data.type) {
                    case 'CART_ANALYSIS_PULSE':
                        // Only show if it's a manual pulse or check
                        if (data.source === 'edge_availability_ping') {
                            info(`System Pulse: Core services are healthy (${data.latency})`);
                        }
                        break;
                    case 'PRODUCT_ADD_TO_CART':
                        // Maybe only show for admins? Or as a "Social Proof" notification
                        // info(`Social Proof: Someone just added a product to their cart!`);
                        break;
                    case 'ORDER_PLACED_SIGNAL':
                        success(`New Order: System has successfully registered a new transaction.`);
                        break;
                    case 'FLASH_SALE_STARTED':
                        success(`🔥 FLASH SALE IS LIVE: ${data.data.title || 'Limited Time Deals!'}`, 10000);
                        break;
                    case 'FLASH_SALE_STOPPED':
                        warning(`Flash Sale Ended: The promotional event is now closed.`);
                        break;
                    case 'SYSTEM_ALERT':
                        warning(`System Alert: ${data.message}`);
                        break;
                    default:
                        // info(`System Event: ${data.type}`);
                        break;
                }
            }
        });

        return () => unsubscribe();
    }, [lastSeenId, info, success, warning]);

    return null; // Invisible component
}
