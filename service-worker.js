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

// Install event - caching app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches if needed
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - serve cached or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Background Sync event example
self.addEventListener('sync', event => {
  console.log('Service Worker sync event:', event.tag);
  if (event.tag.startsWith('sync-')) {
    event.waitUntil(doBackgroundSync(event.tag));
  }
});

async function doBackgroundSync(tag) {
  // Placeholder: simulate sync delay
  console.log(`[Service Worker] Background syncing: ${tag}`);
  // Here you would sync queued data with your backend
  return Promise.resolve();
}

// Push Notification event
self.addEventListener('push', event => {
  let data = { title: 'Retro Pet', body: 'You have a new notification!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: '/icon/icon-192.png',
    badge: '/icon/icon-192.png',
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
