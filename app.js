
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const petImg = new Image();
petImg.src = 'icon/icon-192.png';

const width = 204;
const height = 204;

const baseY = canvas.height / 2 - height / 2; // vertical baseline for hopping (centered)
const hopHeight = 40; // max vertical hop height


let direction = -1; // start moving left
let hopProgress = 0; // 0..1 for hop arc progress
const maxHopSpeed = 0.008; // controls hop speed

let petX = canvas.width; // start offscreen right

petImg.onload = () => {
  animate();
};

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (petX > canvas.width - width) {
    // Entering: move left linearly at fixed speed, no hop, no flip
    petX -= 2; // adjust speed here
  } else {
    // Fully inside: update hopProgress for arc (0..1 back and forth)
    hopProgress += direction * maxHopSpeed;
    if (hopProgress >= 1) {
      hopProgress = 1;
      direction = -1;
    } else if (hopProgress <= 0) {
      hopProgress = 0;
      direction = 1;
    }
    // Move horizontally with speed modulated by hop phase (cosine)
    const speedMultiplier = Math.abs(Math.cos(Math.PI * hopProgress));
    const hopSpeed = 3 * speedMultiplier;
    petX += direction * hopSpeed;
    // Clamp petX to edges and flip direction if needed
    if (petX <= 0) {
      petX = 0;
      direction = 1;
    } else if (petX + width >= canvas.width) {
      petX = canvas.width - width;
      direction = -1;
    }
  }

  // Vertical position: baseY if entering, otherwise arc
  const petY = petX > canvas.width - width
    ? baseY
    : baseY - Math.sin(Math.PI * hopProgress) * hopHeight;

  ctx.save();
  // Flip horizontally if going left and fully inside
  if (direction === -1 && petX <= canvas.width - width) {
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
