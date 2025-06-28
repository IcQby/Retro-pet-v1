const CACHE_NAME = 'retro-pet-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/icon/icon-192.png',
  '/icon/icon-512.png'
];

// Cache files on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Background Sync for example: sync 'feed-pet' action
self.addEventListener('sync', event => {
  if (event.tag === 'sync-feed-pet') {
    event.waitUntil(syncFeedPet());
  }
});

async function syncFeedPet() {
  // Simulate syncing feed pet action with server or storage
  console.log('[Service Worker] Syncing feed pet action...');
  // Implement real sync logic here if needed
  return Promise.resolve();
}

// Push Notification event
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Retro Pet', body: 'You have a new notification!' };
  const options = {
    body: data.body,
    icon: '/icon/icon-192.png',
    badge: '/icon/icon-192.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
