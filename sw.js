// KD's XI — Push Notification Service Worker
// Upload this file to your GitHub repo as: sw.js

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Handle push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || "KD's XI 🏏";
  const options = {
    body: data.body || 'Match update!',
    icon: data.icon || 'https://thorkd.github.io/KS-Xi/icon.png',
    badge: data.badge || 'https://thorkd.github.io/KS-Xi/icon.png',
    tag: data.tag || 'kdxi-notif',
    renotify: true,
    requireInteraction: data.urgent || false,
    vibrate: [200, 100, 200],
    data: { url: data.url || 'https://thorkd.github.io/KS-Xi' },
    actions: data.actions || [
      { action: 'open', title: '🏏 Pick My XI' },
      { action: 'dismiss', title: 'Later' }
    ]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || 'https://thorkd.github.io/KS-Xi';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('KS-Xi') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Cache app shell for offline
const CACHE = 'kdxi-v1';
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/KS-Xi/') || caches.match('/KS-Xi/index.html'))
    );
  }
});
