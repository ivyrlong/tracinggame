const canvas = document.getElementById("tracingCanvas");
const wrapper = document.getElementById("canvasWrapper");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let lastX, lastY;

const phrases = [
  "If sinners try to entice you, do not consent.-- Proverbs 1:10",
  "Stop being afraid.--Luke 5:10",
  "I called out to Jehovah, and he answered me.--Jonah 2:2",
  "Love one another.--John 15:17",
  "Rejoice in the hope.--Romans 12:12",
  "Pray constantly.--1 Thessalonians 5:17",
  "Hope does not lead to disappointment.--Romans 5:5",
  "Blessed is the man who puts his trust in Jehovah.--Jeremiah 17:7",
  "Praise the name of Jehovah.--Psalm 113:1",
  "Jehovah is very tender in affection.--James 5:11",
];
let currentPhrase = phrases[new Date().getDate() % phrases.length];

// Dynamically resize canvas to allow one big word per screen
function resizeCanvas() {
  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;

  const words = currentPhrase.split(" ");
  const wordHeight = screenHeight * 0.9; // Each word gets 90% of the screen
  const canvasHeight = words.length * wordHeight;

  canvas.width = screenWidth;
  canvas.height = canvasHeight;

  drawPhrase();
}

function drawPhrase() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const words = currentPhrase.split(" ");
  const wordHeight = window.innerHeight * 0.9;
  const fontSize = wordHeight * 0.6;

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.strokeStyle = "lightgray";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  words.forEach((word, index) => {
    const y = index * wordHeight + wordHeight / 2;
    ctx.strokeText(word, canvas.width / 2, y);
  });
}

function resetCanvas() {
  resizeCanvas();
  document.getElementById("feedback").textContent = "";
}

function scrollCanvas(direction) {
  const scrollStep = window.innerHeight * 0.9;
  wrapper.scrollBy({ top: direction * scrollStep, behavior: "smooth" });
}

function getCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX, clientY;
  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
}

function startDraw(e) {
  e.preventDefault();
  isDrawing = true;
  [lastX, lastY] = getCoords(e);
}

function stopDraw(e) {
  isDrawing = false;
  ctx.beginPath();
  checkAccuracy();
}

function draw(e) {
  e.preventDefault();
  if (!isDrawing) return;

  const [x, y] = getCoords(e);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  [lastX, lastY] = [x, y];
}

function checkAccuracy() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let tracedPixels = 0;
  let correctPixels = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];

    if (r === 0 && g === 0 && b === 0) {
      tracedPixels++;
      const baseGray = imageData[i - 4];
      if (baseGray >= 180 && baseGray <= 200) {
        correctPixels++;
      }
    }
  }

  const score =
    tracedPixels === 0 ? 0 : Math.round((correctPixels / tracedPixels) * 100);
  document.getElementById("feedback").textContent =
    score >= 80
      ? `Great job! Accuracy: ${score}% 🎉`
      : `Keep practicing! Accuracy: ${score}%`;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchend", stopDraw);
canvas.addEventListener("touchmove", draw);

window.addEventListener("resize", resizeCanvas);

window.resetCanvas = resetCanvas;
window.scrollCanvas = scrollCanvas;

resizeCanvas();
