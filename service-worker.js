// service-worker.js
self.addEventListener('install', event => {
  console.log('Service Worker: Installed');
  self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', event => {
  // Optional: you can cache or proxy here
});
