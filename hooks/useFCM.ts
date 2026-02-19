'use client';

import { useEffect, useState } from 'react';
import { messaging, db } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const VAPID_KEY = "BFp_IzaM7ROcGpIdKWZa4LvSSO2-o3uo4pXHEfeKE82VVEptT0LzMYjOLXy0HDiQFODeMF2sHQzXrxoBiOjUDmg";

export function useFCM() {
    const { user } = useAuth();
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        try {
            if (typeof window === 'undefined' || !messaging) return null;

            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission === 'granted') {
                const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                setFcmToken(token);
                console.log("FCM Token:", token);

                // Save to User Profile if logged in
                if (user?.uid) {
                    await updateDoc(doc(db, 'users', user.uid), {
                        fcmToken: token
                    });
                }
                return token;
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
        }
        return null;
    };

    return { fcmToken, permission, requestPermission };
}
