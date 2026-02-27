import { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, limit } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'alert' | 'order_update';
    icon?: string;
    createdAt: any;
    read: boolean;
    orderId?: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.email && !user?.uid) return;

        // Query by email or phone (using user identifier)
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.email || user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Notification[] = [];
            let unread = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (!data.read) unread++;
                list.push({ id: doc.id, ...data } as Notification);
            });
            setNotifications(list);
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [user]);

    return { notifications, unreadCount };
}
