'use client';

import { Bell, Check, Info, AlertTriangle, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notes);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const createTestNotification = async () => {
        try {
            await addDoc(collection(db, 'notifications'), {
                type: ['order', 'alert', 'info', 'success'][Math.floor(Math.random() * 4)],
                message: 'This is a test notification to verify database deletion.',
                createdAt: serverTimestamp(),
                read: false
            });
        } catch (error) {
            console.error("Error creating notification", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const notifRef = doc(db, 'notifications', id);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const deleteNotification = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this notification?")) {
            try {
                await deleteDoc(doc(db, 'notifications', id));
            } catch (error) {
                console.error("Error deleting notification", error);
                alert("Failed to delete notification from database.");
            }
        }
    };

    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        notifications.forEach(n => {
            if (!n.read) {
                const ref = doc(db, 'notifications', n.id);
                batch.update(ref, { read: true });
            }
        });
        try {
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Bell size={16} /></div>;
            case 'success': return <div className="p-2 bg-green-100 text-green-600 rounded-full"><Check size={16} /></div>;
            case 'alert': return <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><AlertTriangle size={16} /></div>;
            default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><Info size={16} /></div>;
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        // Handle Firestore Timestamp
        if (timestamp.toDate) return timestamp.toDate().toLocaleString();
        // Handle JS Date or other formats
        return new Date(timestamp).toLocaleString();
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Stay updated with system alerts and activities.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={createTestNotification}
                        className="text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
                    >
                        <Plus size={14} /> Send Test
                    </button>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors group ${!notification.read ? 'bg-blue-50/30' : ''}`}
                            >
                                {getIcon(notification.type)}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                            {notification.message}
                                        </p>
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            title="Delete permanently"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="w-2 h-2 rounded-full bg-blue-500 mt-2"
                                        title="Mark as read"
                                    ></button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
