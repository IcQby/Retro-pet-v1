const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

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

function drawPet(x) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Body
  ctx.fillStyle = '#ff99cc';
  ctx.fillRect(x + 20, 60, 120, 80);

  // Head
  ctx.fillRect(x + 60, 20, 80, 60);

  // Ears
  ctx.fillStyle = '#ff66aa';
  ctx.beginPath();
  ctx.moveTo(x + 60, 20);
  ctx.lineTo(x + 50, 10);
  ctx.lineTo(x + 70, 20);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 140, 20);
  ctx.lineTo(x + 150, 10);
  ctx.lineTo(x + 130, 20);
  ctx.fill();

  // Eyes
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(x + 90, 50, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 130, 50, 8, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#ff66aa';
  ctx.beginPath();
  ctx.ellipse(x + 110, 80, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = '#ff99cc';
  ctx.fillRect(x + 30, 140, 20, 30);
  ctx.fillRect(x + 70, 140, 20, 30);
  ctx.fillRect(x + 110, 140, 20, 30);
  ctx.fillRect(x + 150, 140, 20, 30);
}

// Animation loop
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
  animate();
  askPushPermissionAndSubscribe();
};
