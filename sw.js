const CACHE_NAME = 'es-store-v2';
const ASSETS = [
  './index.html', './shop.html', './orders.html',
  './product.html', './fire.js', './manifest.json'
];

// Install - cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
    .then(c => c.addAll(ASSETS).catch(() => {}))
    .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Fetch - network first, fallback cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com')) return;
  e.respondWith(
    fetch(e.request)
    .then(r => {
      if (r && r.status === 200) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return r;
    })
    .catch(() => caches.match(e.request))
  );
});

// Push notification
self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(d.title || '🛍️ طلب جديد — Es Store', {
      body: d.body || 'وصل طلب جديد!',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'new-order',
      renotify: true,
      data: { url: './admin.html' }
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('admin') && 'focus' in c) return c.focus();
      }
      return clients.openWindow ? clients.openWindow('./admin.html') : null;
    })
  );
});const CACHE_NAME = 'es-store-v2';
const ASSETS = [
  './index.html', './shop.html', './orders.html',
  './product.html', './fire.js', './manifest.json'
];

// Install - cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
    .then(c => c.addAll(ASSETS).catch(() => {}))
    .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Fetch - network first, fallback cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com')) return;
  e.respondWith(
    fetch(e.request)
    .then(r => {
      if (r && r.status === 200) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return r;
    })
    .catch(() => caches.match(e.request))
  );
});

// Push notification
self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(d.title || '🛍️ طلب جديد — Es Store', {
      body: d.body || 'وصل طلب جديد!',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'new-order',
      renotify: true,
      data: { url: './admin.html' }
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('admin') && 'focus' in c) return c.focus();
      }
      return clients.openWindow ? clients.openWindow('./admin.html') : null;
    })
  );
});