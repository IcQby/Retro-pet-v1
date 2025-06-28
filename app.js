const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const petImg = new Image();
petImg.src = 'icon/icon-192.png';

const width = 204;
const height = 204;

let petX = 0;
let direction = -1; // 1 = moving right, -1 = moving left

// Jump parameters
const jumpDistance = 150;  // horizontal distance of one hop in pixels
const jumpDuration = 100;  // number of animation frames per hop (higher = slower)
const baseY = canvas.height / 2 - height / 2;
const offset = 20;         // vertical offset so start/end aren’t on ground
const jumpHeight = 60;     // max jump height above baseY + offset

let frame = 0;

petImg.onload = () => {
  requestAnimationFrame(animate);
};

function drawPet(x, y) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  // Flip image horizontally when moving left
  if (direction === -1) {
    ctx.translate(x + width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + width / 2), 0);
  }

  ctx.drawImage(petImg, x, y, width, height);

  ctx.restore();
}

function animate() {
  // hopPhase from 0 to 1 for each hop cycle
  let relativeX = (petX % hopWidth + hopWidth) % hopWidth;
  const hopPhase = relativeX / hopWidth;

  // Speed faster at edges, slower at peak:
  // Use absolute cosine: max at 0 and 1, min at 0.5
  const speedMultiplier = Math.abs(Math.cos(Math.PI * hopPhase));
  // Or alternatively: const speedMultiplier = 1 - Math.sin(Math.PI * hopPhase);

  const maxSpeed = 3;
  const effectiveSpeed = maxSpeed * speedMultiplier;

  petX += direction * effectiveSpeed;

  // Bounce and flip at edges
  if (petX + width > canvas.width) {
    direction = -1;
    petX = canvas.width - width;
  } else if (petX < 0) {
    direction = 1;
    petX = 0;
  }

  // Vertical arc (still smooth sine for natural hop)
  const petY = baseY - Math.sin(Math.PI * hopPhase) * hopHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  if (direction === -1) {
    ctx.translate(petX + width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(petX + width / 2), 0);
  }

  ctx.drawImage(petImg, petX, petY, width, height);
  ctx.restore();

  requestAnimationFrame(animate);
}

// Stats and interactions below (kept unchanged)

let pet = {
  happiness: 50,
  hunger: 50,
  cleanliness: 50,
  health: 50,
};

function updateStats() {
  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}

// Interaction functions
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

window.onload = () => {
  updateStats();
  askPushPermissionAndSubscribe();
  // Animation starts when image is loaded (handled by petImg.onload above)
};
