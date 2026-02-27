'use client';

import { Bell, Clock, Info, CheckCircle, Package } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { db, doc, updateDoc } from '@/lib/firebase';

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
    const { notifications, unreadCount } = useNotifications();

    const markAsRead = async (id: string) => {
        try {
            const ref = doc(db, 'notifications', id);
            await updateDoc(ref, { read: true });
        } catch (e) {
            console.error(e);
        }
    };

    const markAllRead = async () => {
        try {
            for (const n of notifications) {
                if (!n.read) await markAsRead(n.id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => { markAsRead(notif.id); }}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-orange-50/30' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                                        ${notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                            notif.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {notif.icon ? <span className="text-sm">{notif.icon}</span> : (notif.type === 'success' ? <CheckCircle size={14} /> : <Info size={14} />)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notif.title}
                                            </h4>
                                            {!notif.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5" />}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-3 whitespace-pre-wrap">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock size={10} /> {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No new notifications</p>
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
                    <button onClick={markAllRead} className="text-xs font-bold text-gray-600 hover:text-orange-600 transition-colors">
                        Mark all as read
                    </button>
                </div>
            )}
        </div>
    );
}
