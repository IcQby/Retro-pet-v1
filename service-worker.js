const CACHE_NAME = 'retro-pet-cache-v2'; // Increment cache version when updating
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon/icon-192.png',
  './icon/icon-512.png'
];

// Install: cache files and activate new service worker immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Activate worker immediately after install
});

// Activate: clean up old caches and take control of clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Take control of all clients ASAP
});

// Fetch: serve cached files, update cache with network responses
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached response immediately
        fetch(event.request).then(response => {
          // Update cache in background
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
        });
        return cachedResponse;
      }
      return fetch(event.request).then(response => {
        // Ca
