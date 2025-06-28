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

const hopWidth = 100;
const hopHeight = 40;
const hopDuration = 1700; // ms for one hop

let petDirection = 1; // 1 for right, -1 for left
let petFlip = false;

let hopProgress = 0;  // 0..1 progress in current hop
let petXStart = 0;    // starting x position of current hop

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
    // flip horizontally around center of pet
    ctx.translate(x + width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x - width / 2, 0);
  }

  ctx.drawImage(petImg, x, y, width, height);
  ctx.restore();
}

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Update hopProgress [0,1]
  hopProgress += deltaTime / hopDuration;
  if (hopProgress > 1) hopProgress = 1;

  // Use easing to slow down horizontally near the peak
  // speed modulated by |cos(pi * hopProgress)|, integrated over progress:
  // But since we control position directly by hopProgress, we can just ease hopProgress with easing function
  // Let's use an ease-in-out function for smooth progress:
  // easeInOutSine: f(t) = 0.5 * (1 - cos(pi * t))
  const easedProgress = 0.5 * (1 - Math.cos(Math.PI * hopProgress));

  // Calculate horizontal position based on start, direction and easedProgress
  let petX = petXStart + petDirection * hopWidth * easedProgress;

  // Calculate vertical position (arc)
  const baseY = canvas.height / 2 - 204 / 2;
  const petY = baseY - Math.sin(Math.PI * hopProgress) * hopHeight;

  drawPet(petX, petY);

  // If hop complete, reset for next hop
  if (hopProgress >= 1) {
    hopProgress = 0;

    // Update petXStart for next hop
    petXStart = petX;

    // Check edges and flip direction and image if needed
    if (petXStart + 204 >= canvas.width) {
      petXStart = canvas.width - 204;
      petDirection = -1;
      petFlip = true;
    } else if (petXStart <= 0) {
      petXStart = 0;
      petDirection = 1;
      petFlip = false;
    }
  }

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
