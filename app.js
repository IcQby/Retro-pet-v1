const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

let pet = {
  happiness: 50,
  hunger: 50,
  cleanliness: 50,
  health: 50,
};

// Position & animation variables for hopping pig
let posX = 40;             // start near left edge (same as original rect)
let direction = 1;         // 1 = right, -1 = left
const speed = 2;           // horizontal speed in pixels per frame
let hopOffset = 0;         // vertical offset for hopping
let hopDirection = 1;      // 1 = up, -1 = down

// Update UI stats
function updateStats() {
  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}

// Animated drawPet with hopping pig
function drawPet() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update horizontal position
  posX += direction * speed;

  // Bounce back on edges (keep pig inside canvas)
  if (posX <= 0 || posX + 80 >= canvas.width) { // 80 is pig body width
    direction *= -1;
  }

  // Update hop vertical offset (simple up-down)
  hopOffset += hopDirection * 0.5;
  if (hopOffset > 6 || hopOffset < 0) {
    hopDirection *= -1;
  }

  // Draw pig body with hopping vertical offset
  const baseY = 40;  // original y position of pig body
  const y = baseY - hopOffset;

  // Pink square body
  ctx.fillStyle = '#ff99cc';
  ctx.fillRect(posX, y, 80, 80);

  // Eyes
  ctx.fillStyle = 'black';
  ctx.fillRect(posX + 20, y + 30, 10, 10);
  ctx.fillRect(posX + 50, y + 30, 10, 10);

  // Nose
  ctx.fillStyle = '#ff66aa';
  ctx.fillRect(posX + 30, y + 60, 20, 15);
}

// Animation loop
function animate() {
  drawPet();
  requestAnimationFrame(animate);
}

// Basic interaction functions
function feedPet() {
  pet.hunger = Math.max(0, pet.hunger - 15);
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
  registerBackgroundSync('sync-feed-pet');
}

function playWithPet() {
  pet.happiness = Math.min(100, pet.happiness + 10);
  pet.hunger = Math.min(100, pet.hunger + 5);
  updateStats();
}

function cleanPet() {
  pet.cleanliness = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
}

function sleepPet() {
  pet.health = Math.min(100, pet.health + 10);
  pet.hunger = Math.min(100, pet.hunger + 10);
  updateStats();
}

function healPet() {
  pet.health = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
}

// Background sync registration (generalized tag)
function registerBackgroundSync(tag) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register(tag).then(() => {
        console.log(`Background sync registered for ${tag}`);
      }).catch(err => {
        console.log('Background sync registration failed:', err);
      });
    });
  }
}

// Push notification subscription

function askPushPermissionAndSubscribe() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push messaging not supported');
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      subscribeUserToPush();
    } else {
      console.log('Push permission denied');
    }
  });
}

function subscribeUserToPush() {
  navigator.serviceWorker.ready.then(registration => {
    // TODO: Replace with your own VAPID public key for production
    const vapidPublicKey = 'BOrX-ZnfnDcU7wXcmnI7kVvIVFQeZzxpDvLrFqXdeB-lKQAzP8Hy2LqzWdN-s2Yfr3Kr-Q8OjQ_k3X1KNk1-7LI';
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    }).then(subscription => {
      console.log('User subscribed to push:', subscription);
      // TODO: Send subscription to your server
    }).catch(err => {
      console.log('Failed to subscribe user:', err);
    });
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Initialize app
window.onload = () => {
  updateStats();
  askPushPermissionAndSubscribe();
  animate();
};
