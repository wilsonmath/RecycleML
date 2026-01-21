const modelURL = "https://wilsonmath.github.io/RecycleML/models/model.json";
const metadataURL = "https://wilsonmath.github.io/RecycleML/models/metadata.json";

let model, labelContainer, maxPredictions;
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
  var prediction = await model.predict(input);
  var bestPrediction = null;
  var maxProbability = 0;
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > maxProbability) {
      maxProbability = prediction[i].probability;
      bestPrediction = prediction[i];
    }
  }

  if (labelContainer.innerHTML == "Result") {
    labelContainer.innerHTML = "Verifying Result"
  }
  if (bestPrediction) {
    var resultText = bestPrediction.className;
    if (maxProbability > 0.5) {
      labelContainer.innerHTML = resultText
    } else { 
      labelContainer.innerHTML = "Uncertain, Please try Again"
    }
  }}
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
  labelContainer.innerHTML = "Verifying Result"
  await predict(img);
  };


init();
