let audioCtx;
let oscillator;
let gainNode;
let analyser;
let animFrameId;
let isPlaying = false;
let currentWave = 'sine';

const freqSlider = document.getElementById("freqSlider");
const volSlider = document.getElementById("volSlider");
const freqValue = document.getElementById("freqValue");
const freqBig = document.getElementById("freqBig");
const volValue = document.getElementById("volValue");
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

// Waveform buttons
document.querySelectorAll('.wave-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentWave = btn.dataset.wave;
    if (oscillator) {
      oscillator.type = currentWave;
    }
  });
});

// Logarithmic mapping: slider 0–1000 → frequency 20–22000 Hz
const FREQ_MIN = 20;
const FREQ_MAX = 22000;
function sliderToFreq(sliderVal) {
  return Math.round(FREQ_MIN * Math.pow(FREQ_MAX / FREQ_MIN, sliderVal / 1000));
}

function updateFreqDisplay(hz) {
  const display = hz >= 1000 ? (hz / 1000).toFixed(2).replace(/\.?0+$/, '') + 'k' : hz;
  freqValue.textContent = hz;
  freqBig.textContent = display;
}

// Set initial display to match slider default (1000 → 22kHz)
updateFreqDisplay(sliderToFreq(parseInt(freqSlider.value)));

// Update frequency
freqSlider.oninput = () => {
  const hz = sliderToFreq(parseInt(freqSlider.value));
  freqValue.textContent = hz;
  if (oscillator) {
    oscillator.frequency.setValueAtTime(hz, audioCtx.currentTime);
  }
};

// Update volume
volSlider.oninput = () => {
  volValue.textContent = parseFloat(volSlider.value).toFixed(2);
  if (gainNode) {
    gainNode.gain.setValueAtTime(volSlider.value, audioCtx.currentTime);
  }
};

// Canvas sizing
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 120;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Idle animation (static waveform preview)
function drawIdleWave() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const amp = 18;
  const freq = 3;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 229, 160, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 0;

  for (let x = 0; x < W; x++) {
    const t = (x / W) * Math.PI * 2 * freq;
    const y = H / 2 + Math.sin(t) * amp;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Live oscilloscope
function drawOscilloscope() {
  animFrameId = requestAnimationFrame(drawOscilloscope);

  const W = canvas.width, H = canvas.height;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(dataArray);

  ctx.clearRect(0, 0, W, H);

  // Glow effect
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 229, 160, 0.12)';
  ctx.lineWidth = 5;
  ctx.shadowBlur = 0;

  for (let i = 0; i < bufferLength; i++) {
    const x = (i / bufferLength) * W;
const y = (1 - (dataArray[i] + 1) / 2) * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Sharp line
  ctx.beginPath();
  ctx.strokeStyle = '#00e5a0';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#00e5a0';

  for (let i = 0; i < bufferLength; i++) {
    const x = (i / bufferLength) * W;
const y = (1 - (dataArray[i] + 1) / 2) * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

window.toggleTone = toggleTone;

function toggleTone() {
  const btn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const playLabel = document.getElementById("playLabel");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");

  if (!isPlaying) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;

    oscillator.type = currentWave;
    oscillator.frequency.setValueAtTime(sliderToFreq(parseInt(freqSlider.value)), audioCtx.currentTime);

    gainNode.gain.setValueAtTime(volSlider.value, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    oscillator.start();

    isPlaying = true;
    btn.classList.add("active");
    playIcon.textContent = '■';
    playLabel.textContent = 'STOP';
    statusDot.classList.add('active');
    statusLabel.classList.add('active');
    statusLabel.textContent = 'ACTIVE';

    drawOscilloscope();

  } else {
    cancelAnimationFrame(animFrameId);
    oscillator.stop();
    audioCtx.close();

    isPlaying = false;
    btn.classList.remove("active");
    playIcon.textContent = '▶';
    playLabel.textContent = 'PLAY';
    statusDot.classList.remove('active');
    statusLabel.classList.remove('active');
    statusLabel.textContent = 'STANDBY';

    drawIdleWave();
  }
}

// Initial idle draw
drawIdleWave();


function scaleDevice() {
  const device = document.querySelector('.device');
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const naturalW = 600;
  const naturalH = device.scrollHeight; // actual content height

  const scaleX = vw / naturalW;
  const scaleY = vh / naturalH;

  const scale = Math.min(scaleX, scaleY, 1);
  device.style.transform = `scale(${scale})`;
  device.style.transformOrigin = 'top center';
}

window.addEventListener('resize', scaleDevice);
window.addEventListener('load', scaleDevice);