const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const petImg = new Image();
petImg.src = 'icon/icon-192.png';

const width = 100;
const height = 100;
const groundY = canvas.height - height - 20;

let petX = canvas.width; // Start offscreen right
let petY = groundY;

let slidingIn = true;
let vx = 0;
let vy = 0;
let gravity = 0.4;
let direction = 1; // -1 = left, 1 = right
let jumping = false;

function startJump() {
  const jumpDuration = 1.9 * 60; // 1.7 seconds at ~60fps
  const jumpSpeed = 6;
  const angle = Math.PI * 65 / 180;
  vx = direction * jumpSpeed * Math.cos(angle);
  vy = -jumpSpeed * Math.sin(angle);
  jumping = true;
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (slidingIn) {
    petX -= 2;
    if (petX <= canvas.width - width - 10) {
      petX = canvas.width - width - 10;
      slidingIn = false;
      direction = -1; // move left
      startJump();
    }
  } else {
    if (jumping) {
      vy += gravity;
      petX += vx;
      petY += vy;

      if (petY >= groundY) {
        petY = groundY;

        // Hit left or right edge → bounce direction
        if (petX <= 0) {
          petX = 0;
          direction = 1;
        } else if (petX + width >= canvas.width) {
          petX = canvas.width - width;
          direction = -1;
        }

        startJump(); // next hop in current direction
      }
    }
  }

  ctx.save();

  // Flip if moving left
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
