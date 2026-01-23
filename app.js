const modelURL = "https://wilsonmath.github.io/RecycleML/models/model.json";
const metadataURL = "https://wilsonmath.github.io/RecycleML/models/metadata.json";

let model, labelContainer, maxPredictions;
let currentKey = null;
let recycledCurrentImage = false;

const nameToKey = {
  "plastic bottle": "plastic", 
  "plastic bott...": "plastic",
  "aluminum can": "metal",
  "paper":"paper",
};

let recycleData = JSON.parse(localStorage.getItem("recycleData")) || {
  plastic: 0,
  paper: 0,
  metal: 0
};

function updateDashboard() {
  document.getElementById("plasticnum").textContent = recycleData.plastic || 0;
  document.getElementById("papernum").textContent = recycleData.paper || 0;
  document.getElementById("metalnum").textContent = recycleData.metal || 0;
}

async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
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
  updateDashboard();
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
  const container = document.getElementById("picture-container");
  container.innerHTML = "";
  img.width = 300;
  img.height = 300;
  container.appendChild(img);
  predict(img);
  };


init();
