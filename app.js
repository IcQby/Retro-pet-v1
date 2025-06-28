
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const petImg = new Image();
petImg.src = 'icon/icon-192.png';

const width = 204;
const height = 204;

let direction = -1; // start going left
let hopProgress = 1; // 0 to 1, start at the right side (1 means hop completed, about to flip)
const hopWidth = 200;
const hopHeight = 40;
const baseY = canvas.height / 2 - height / 2;
const maxSpeed = 0.008; // hop progress increment per frame (tweak for speed)

function animate() {
  // Update hopProgress
  hopProgress += direction * maxSpeed;

  // Clamp and flip direction if completed hop
  if (hopProgress >= 1) {
    hopProgress = 1;
    direction = -1; // go left
  } else if (hopProgress <= 0) {
    hopProgress = 0;
    direction = 1;  // go right
  }

  // Calculate petX position based on hopProgress and direction
  petX = direction === 1
    ? hopProgress * (canvas.width - width)
    : (1 - hopProgress) * (canvas.width - width);

  // Calculate vertical arc (sin wave)
  const petY = baseY - Math.sin(Math.PI * hopProgress) * hopHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Flip image horizontally if going left
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
