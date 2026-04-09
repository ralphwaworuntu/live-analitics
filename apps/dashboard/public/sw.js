const CACHE_NAME = 'sentinel-cache-v1';
const DYNAMIC_CACHE = 'sentinel-dynamic-v1';

// Asset statis esensial yang akan di-cache saat install
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install Event: Caching initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate untuk request API/Data, Cache First untuk Static
self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response terlebih dahulu (Stale)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Validasi response dari jaringan sebelum update cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            // Hindari caching request chrome-extension atau API eksternal yang tidak diperlukan
            if (!event.request.url.startsWith('chrome-extension')) {
               cache.put(event.request, responseToCache);
            }
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback untuk kondisi offline murni jika cache juga tidak ada
        // Bisa diarahkan ke offline page jika cache kosong
      });

      // Kembalikan cache segera sambil fetching network di background (Revalidate)
      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Event
self.addEventListener('push', (event) => {
  const defaultPayload = {
    title: 'Peringatan Darurat',
    body: 'Terjadi pembaruan taktis baru di lapangan.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: '/' }
  };

  let payload = defaultPayload;
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || defaultPayload.icon,
    badge: payload.badge || defaultPayload.badge,
    vibrate: [200, 100, 200, 100, 200, 100, 200], // Sinyal SOS bergetar
    data: payload.data || defaultPayload.data,
    requireInteraction: true // Memaksa user menutup notifikasi secara eksplisit (standar ops)
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Fokus jika sudah terbuka
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Buka window baru jika belum ada
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
