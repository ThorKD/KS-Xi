// KD's XI — Service Worker v3 (force update)
const CACHE = 'kdxi-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Network-first — always fetch fresh, fall back to cache
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});

// Push notifications
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
    actions: [
      { action: 'open', title: '🏏 Pick My XI' },
      { action: 'dismiss', title: 'Later' }
    ]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || 'https://thorkd.github.io/KS-Xi';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('KS-Xi') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
