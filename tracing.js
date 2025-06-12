const canvas = document.getElementById("tracingCanvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let lastX, lastY;

// Daily phrases to trace
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

// Draw phrase on canvas
function drawPhrase() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 40px Arial";
  ctx.strokeStyle = "lightgray";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const words = currentPhrase.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + " " + word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth < canvas.width * 0.9) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  const lineHeight = 50;
  const totalHeight = lines.length * lineHeight;
  const startY = (canvas.height - totalHeight) / 2;

  lines.forEach((line, index) => {
    ctx.strokeText(line, canvas.width / 2, startY + index * lineHeight);
  });
}

// Reset the canvas and redraw
function resetCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPhrase();
  document.getElementById("feedback").textContent = "";
}

// Get drawing coordinates
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
  
    return [
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY
    ];
  }
  

// Start drawing
function startDraw(e) {
  e.preventDefault();
  isDrawing = true;
  [lastX, lastY] = getCoords(e);
}

// Stop drawing and check accuracy
function stopDraw(e) {
  isDrawing = false;
  ctx.beginPath();
  checkAccuracy();
}

// Draw as user traces
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

// Accuracy checking
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

// Event listeners
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchend", stopDraw);
canvas.addEventListener("touchmove", draw);

// Make resetCanvas globally available
window.resetCanvas = resetCanvas;

// 🔥 Draw phrase when the page first loads
drawPhrase();
