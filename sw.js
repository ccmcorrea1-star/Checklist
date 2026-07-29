const CACHE_NAME = 'inspection-checklist-v3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './vendor/jspdf.umd.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);

      if (event.request.mode === 'navigate') {
        try {
          const response = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put('./index.html', response.clone());
          return response;
        } catch {
          return cached || caches.match('./index.html');
        }
      }

      return cached || fetch(event.request);
    })(),
  );
});
