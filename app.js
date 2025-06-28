const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const petImg = new Image();
petImg.src = 'icon/icon-192.png';

let pet = {
  happiness: 50,
  hunger: 50,
  cleanliness: 50,
  health: 50,
};

// Hop parameters
const hopWidth = 100;  // horizontal length of one hop arc (pixels)
const hopHeight = 40;  // max height of hop (pixels)
const hopDuration = 1700; // ms per hop (1.7 seconds)

// Calculated parameters
const fps = 60; // approx
const framesPerHop = (hopDuration / 1000) * fps;
const baseSpeed = hopWidth / framesPerHop; // base horizontal speed per frame if linear

// Animation state
let petX = 0;
let petDirection = 1; // 1: moving right, -1: moving left
let petFlip = false;  // whether image is flipped horizontally

// Time tracking for smooth animation
let lastTime = null;

function updateStats() {
  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}

function drawPet(x, y) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const width = 204;
  const height = 204;
  
  ctx.save();

  if (petFlip) {
    // Flip horizontally around center of pet image
    ctx.translate(x + width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x - width / 2, 0);
  }

  ctx.drawImage(petImg, x, y, width, height);
  ctx.restore();
}

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime; // ms elapsed since last frame
  lastTime = timestamp;

  // Calculate hop phase [0,1] in current hop cycle based on petX mod hopWidth
  let hopPhase = (petX % hopWidth) / hopWidth;

  // We want horizontal speed to slow near the peak of the arc:
  // Use derivative of sine arc shape to modulate speed, slowing near sin(pi * hopPhase) max at 0.5
  // speed multiplier = cos(pi * hopPhase), which is 1 at 0, 0 at 0.5,  -1 at 1 (we take abs)
  // We'll use absolute cosine to keep speed positive and symmetric

  const speedMultiplier = Math.abs(Math.cos(Math.PI * hopPhase));
  const speedThisFrame = baseSpeed * speedMultiplier;

  // Update petX position
  petX += petDirection * speedThisFrame * (deltaTime / (1000 / fps));

  // Bounce at edges and flip image horizontally
  if (petX + 204 > canvas.width) {
    petX = canvas.width - 204;
    petDirection = -1;
    petFlip = true; // flip horizontally facing left
  } else if (petX < 0) {
    petX = 0;
    petDirection = 1;
    petFlip = false; // flip back facing right
  }

  // Calculate vertical position for smooth hop arc
  hopPhase = (petX % hopWidth) / hopWidth;
  const baseY = canvas.height / 2 - 204 / 2;
  const petY = baseY - Math.sin(Math.PI * hopPhase) * hopHeight;

  drawPet(petX, petY);
  requestAnimationFrame(animate);
}

// Interaction functions with stats update
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

// Background sync registration
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

// Push notification subscription (optional)
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
    const vapidPublicKey = 'BOrX-ZnfnDcU7wXcmnI7kVvIVFQeZzxpDvLrFqXdeB-lKQAzP8Hy2LqzWdN-s2Yfr3Kr-Q8OjQ_k3X1KNk1-7LI';
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    }).then(subscription => {
      console.log('User subscribed to push:', subscription);
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

  if (petImg.complete) {
    requestAnimationFrame(animate);
  } else {
    petImg.onload = () => requestAnimationFrame(animate);
  }

  askPushPermissionAndSubscribe();
};
