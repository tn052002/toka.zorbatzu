'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        void Promise.all(registrations.map((registration) => registration.unregister()));
      });
      if ('caches' in window) {
        void caches.keys().then((keys) => {
          void Promise.all(keys.filter((key) => key.startsWith('toka-v3-')).map((key) => caches.delete(key)));
        });
      }
      return;
    }

    void navigator.serviceWorker.register('/sw.js');
  }, []);

  return null;
}
