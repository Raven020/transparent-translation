const CACHE_NAME = 'transparent-v1';

const ASSETS = [
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/data.js',
  'js/lexicon.js',
  'img/cross.png',
  'img/cross-192.png',
  'img/cross-512.png',
  'fonts/Roboto-Regular.woff2',
  'fonts/Roboto-Regular-Greek.woff2',
  'fonts/Roboto-Italic.woff2',
  'fonts/Roboto-Italic-Greek.woff2',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
  );
});
