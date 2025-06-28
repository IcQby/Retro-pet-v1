const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 300;

const width = 100, height = 100;
const groundY = canvas.height - height - 20;

let petImgLeft = new Image();
petImgLeft.src = 'icon/icon-192.png';
let petImgRight = new Image();

let petX = canvas.width - width - 10;  // Start near right edge inside canvas
let petY = groundY;
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1;  // moving left initially
let facing = -1;     // facing left initially

function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

// Once left image loads, build the right‑facing version
petImgLeft.onload = () => {
  const off = document.createElement('canvas');
  off.width = width; off.height = height;
  const offctx = off.getContext('2d');
  offctx.translate(width, 0);
  offctx.scale(-1, 1);
  offctx.drawImage(petImgLeft, 0, 0, width, height);
  petImgRight.src = off.toDataURL();
  petImgRight.onload = () => {
    startJump();       // start jumping once images are ready
    requestAnimationFrame(animate);
  };
};

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gravity and movement
  vy += gravity;
  petX += vx;
  petY += vy;

  // Bounce off left wall
  if (petX <= 0) {
    petX = 0;
    direction = 1;
    facing = 1;
    vx = Math.abs(vx);
  }
  // Bounce off right wall
  else if (petX + width >= canvas.width) {
    petX = canvas.width - width;
    direction = -1;
    facing = -1;
    vx = -Math.abs(vx);
  }

  // Bounce off ground
  if (petY >= groundY) {
    petY = groundY;
    startJump();
  }

  // Draw bounding box for debugging
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.strokeRect(petX, petY, width, height);

  // Draw the pet image based on facing direction
  if (facing === 1) {
    ctx.drawImage(petImgRight, petX, petY, width, height);
  } else {
    ctx.drawImage(petImgLeft, petX, petY, width, height);
  }

  requestAnimationFrame(animate);
}

petImg.onload = () => {
  animate();
};



// The rest of your code (stats, interactions, background sync, push) stays the same...


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
