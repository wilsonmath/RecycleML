const modelURL = "https://wilsonmath.github.io/RecycleML/models/model.json";
const metadataURL = "https://wilsonmath.github.io/RecycleML/models/metadata.json";

let model, labelContainer, maxPredictions;
let currentKey = null;
let recycledCurrentImage = false;

const nameToKey = {
  "plastic bottles": "plastic",
  "plastic bottle": "plastic",
  "plastic bott...": "plastic",
  "aluminum cans": "metal",
  "aluminum can": "metal",
  "paper": "paper",
};

let recycleData = JSON.parse(localStorage.getItem("recycleData")) || {
  plastic: 0,
  paper: 0,
  metal: 0
};

function animateCount(id, endValue, duration = 1000) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const range = endValue - start;
  if (range === 0) {
    el.textContent = endValue;
    return;
  }
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.floor(start + range * progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateDashboard(animate = false) {
  if (animate) {
    animateCount("plasticnum", recycleData.plastic || 0);
    animateCount("papernum", recycleData.paper || 0);
    animateCount("metalnum", recycleData.metal || 0);
  } else {
    document.getElementById("plasticnum").textContent = recycleData.plastic || 0;
    document.getElementById("papernum").textContent = recycleData.paper || 0;
    document.getElementById("metalnum").textContent = recycleData.metal || 0;
  } 
}

async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container");
  if (labelContainer) {
    labelContainer.innerHTML = "";
  }
  document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
  updateDashboard(false);
}

async function predict(input) {
  recycledCurrentImage = false;
  const msg = document.getElementById("recycle-msg");
  msg.textContent = "";
  const prediction = await model.predict(input);
  let bestPrediction = null;
  let maxProbability = 0;

  for (let i = 0; i < prediction.length; i++) {
    if (prediction[i].probability > maxProbability) {
      maxProbability = prediction[i].probability;
      bestPrediction = prediction[i];
    }
  }
  const predictionText = document.getElementById("prediction-text");
  const recycleBtn = document.getElementById("recycleBtn");
  if (bestPrediction && maxProbability > 0.5) {
    const key =
      nameToKey[bestPrediction.className.toLowerCase()] ||
      bestPrediction.className.toLowerCase();

    currentKey = key;
    predictionText.textContent = bestPrediction.className;
    recycleBtn.disabled = false;
    recycleBtn.textContent = "Recycle Now";
  } else {
    currentKey = null;
    predictionText.textContent = "Uncertain, try again";
    recycleBtn.disabled = true;
  }}

document.getElementById("recycleBtn").onclick = function() {
  if (!currentKey || recycledCurrentImage) return;
  if (recycleData[currentKey] === undefined) {
    recycleData[currentKey] = 0;
  }
  recycleData[currentKey]++;
  localStorage.setItem("recycleData", JSON.stringify(recycleData));
  updateDashboard(true);
  recycledCurrentImage = true;
  this.disabled = true;
  const msg = document.getElementById("recycle-msg");
  msg.textContent = `Added ${currentKey} to dashboard!`;
  setTimeout(() => (msg.textContent = ""), 3000);
};
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const container = document.getElementById("picture-container");
    if (container) {
      container.innerHTML = "";
      img.width = 300;
      img.height = 300;
      container.appendChild(img);
    }
    await predict(img);
  };
}

init();
