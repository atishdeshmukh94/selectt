// Selectt PWA Service Worker
const CACHE_NAME = 'selectt-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png'
];

// Install Event - Resiliently cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          // Continue caching remaining assets even if one fails
          console.warn('[PWA SW] Pre-cache skipped for:', asset);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate Event - clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-First for Navigation, Stale-While-Revalidate for same-origin static assets
self.addEventListener('fetch', (event) => {
  // Only handle http/https GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Never intercept cross-origin third-party requests (Cloudflare, Google, Facebook, Gallabox, etc.)
  // Let the browser handle cross-origin network requests natively without SW interference
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Avoid caching API responses, admin calls, or backend endpoints
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/') || url.pathname.startsWith('/uploads/')) {
    return;
  }

  // Navigation requests (HTML / direct URLs): Network-first with instant index.html fallback for SPA
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Same-origin static assets: Cache-first / Stale-While-Revalidate with guaranteed Response return
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Asynchronously update cache in background (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Not in cache: fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      });
    })
  );
});
