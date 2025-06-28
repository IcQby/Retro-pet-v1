const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const petImg = new Image();
petImg.src = 'icon/icon-192.png';  // Your icon file

let pet = {
  happiness: 50,
  hunger: 50,
  cleanliness: 50,
  health: 50,
};

// Horizontal position and velocity for hopping
let petX = 0;
let petVX = 2; // speed in pixels per frame

function updateStats() {
  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}
let petX = 0;
let petVX = 2;
const hopWidth = 100;  // horizontal length of one hop arc
const hopHeight = 40;  // max height of hop

function drawPet(x, y) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const width = 204;
  const height = 204;
  ctx.drawImage(petImg, x, y, width, height);
}

function animate() {
  petX += petVX;

  // Bounce horizontally at edges
  if (petX + 204 > canvas.width || petX < 0) petVX = -petVX;

  // Calculate vertical hop using sine wave mapped to hopWidth
  // petX % hopWidth gives horizontal position inside current hop cycle
  const hopPhase = (petX % hopWidth) / hopWidth; // from 0 to 1

  // Vertical position forms an arc: y = baseY - sin(pi * hopPhase) * hopHeight
  // sin(pi * hopPhase) goes 0 → 1 → 0 for a smooth arc
  const baseY = canvas.height / 2 - 204 / 2;
  const petY = baseY - Math.sin(Math.PI * hopPhase) * hopHeight;

  drawPet(petX, petY);
  requestAnimationFrame(animate);
}




function animate() {
  petX += petVX;

  if (petX + 180 > canvas.width || petX < 0) petVX = -petVX;

  drawPet(petX);
  requestAnimationFrame(animate);
}

// Interaction functions (with stats update)
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

  // Start animation only after image loaded
  if (petImg.complete) {
    animate();
  } else {
    petImg.onload = animate;
  }

  askPushPermissionAndSubscribe();
};
