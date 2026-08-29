import { useState, useEffect } from 'react';
import axios from 'axios';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
            setSubscription(sub);
          }
        });
      });
    }
  }, []);

  const subscribeToPush = async (beneficiaryName = 'Beneficiary') => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Web Push Notifications are not supported in this browser.');
      return false;
    }

    setLoading(true);
    try {
      // 1. Request Browser Permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        alert('Notification permission was denied.');
        setLoading(false);
        return false;
      }

      // 2. Fetch VAPID Public Key from FastAPI Backend
      const res = await axios.get('/api/push/vapid-public-key');
      const vapidPublicKey = res.data.public_key;

      // 3. Subscribe with Service Worker
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // 4. Send subscription to backend
      await axios.post('/api/push/subscribe', {
        beneficiary_name: beneficiaryName,
        subscription: sub.toJSON()
      });

      setIsSubscribed(true);
      setSubscription(sub);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[WebPush] Subscription error:', err);
      setLoading(false);
      return false;
    }
  };

  const triggerTestPush = async (nudgeTitle, nudgeMessage) => {
    try {
      await axios.post('/api/push/send-test', {
        title: nudgeTitle || 'MoSJE Milestone Reminder',
        body: nudgeMessage || 'Your 60-day Moratorium working capital review is ready.'
      });
      return true;
    } catch (err) {
      console.error('[WebPush] Trigger error:', err);
      return false;
    }
  };

  return {
    isSubscribed,
    subscription,
    permission,
    loading,
    subscribeToPush,
    triggerTestPush
  };
}
