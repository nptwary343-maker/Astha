'use client';

import { Bell, Clock, Info, CheckCircle } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'alert';
}

const mockNotifications: Notification[] = [
    { id: 1, title: 'Order Shipped', message: 'Your order #ASTHA-13345 has been shipped.', time: '2 min ago', read: false, type: 'success' },
    { id: 2, title: 'Flash Sale Alert', message: 'Mega sale starts in 1 hour! Get ready.', time: '1 hour ago', read: false, type: 'info' },
    { id: 3, title: 'Payment Successful', message: 'Payment for order #ASTHA-12009 confirmed.', time: '1 day ago', read: true, type: 'success' },
];

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">2 New</span>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {mockNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {mockNotifications.map((notif) => (
                            <div key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-orange-50/30' : ''}`}>
                                <div className="flex gap-3">
                                    <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                                        ${notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                            notif.type === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {notif.type === 'success' ? <CheckCircle size={14} /> : <Info size={14} />}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {notif.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock size={10} /> {notif.time}
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

            <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
                <button className="text-xs font-bold text-gray-600 hover:text-orange-600 transition-colors">
                    Mark all as read
                </button>
            </div>

            {/* Backdrop for mobile to close when clicking outside (though usually handled by parent) */}
        </div>
    );
}
