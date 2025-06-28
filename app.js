const pet = {
  happiness: 100,
  hunger: 100,
  cleanliness: 100,
  health: 100,
};
function updateStats() {
  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}
function drawPet() {
  const ctx = document.getElementById('pet-canvas').getContext('2d');
  ctx.clearRect(0, 0, 160, 160);
  ctx.fillStyle = '#0f0';
  ctx.fillRect(60, 60, 40, 40);
}
function decayStats() {
  pet.happiness = Math.max(pet.happiness - 1, 0);
  pet.hunger = Math.max(pet.hunger - 2, 0);
  pet.cleanliness = Math.max(pet.cleanliness - 1, 0);
  pet.health = Math.max(pet.health - 1, 0);
  updateStats();
  drawPet();
  savePet();
}
function feedPet() {
  pet.hunger = Math.min(pet.hunger + 20, 100);
  updateStats();
}
function playWithPet() {
  pet.happiness = Math.min(pet.happiness + 20, 100);
  updateStats();
}
function cleanPet() {
  pet.cleanliness = Math.min(pet.cleanliness + 20, 100);
  updateStats();
}
function sleepPet() {
  pet.happiness = Math.min(pet.happiness + 10, 100);
  pet.health = Math.min(pet.health + 10, 100);
  updateStats();
}
function healPet() {
  pet.health = Math.min(pet.health + 30, 100);
  updateStats();
}
function savePet() {
  localStorage.setItem("retroPet", JSON.stringify(pet));
}
function loadPet() {
  const saved = JSON.parse(localStorage.getItem("retroPet"));
  if (saved) Object.assign(pet, saved);
}
loadPet();
updateStats();
drawPet();
setInterval(decayStats, 60000);
