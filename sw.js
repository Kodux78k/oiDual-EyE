const CACHE_NAME = 'infodose-cache-v1';
const OFFLINE_URL = '/index.html';
const ASSETS = [
  '/', '/index.html', '/manifest.json',
  // adicione assets essenciais (fonts, icons) se desejar
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // strategy: network-first for navigation, cache-first for others
  if (evt.request.mode === 'navigate') {
    evt.respondWith(
      fetch(evt.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(r => r || fetch(evt.request).then(resp=>{
      // optional: cache new
      return resp;
    })).catch(() => {})
  );
});