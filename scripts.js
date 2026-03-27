let audioCtx;
let oscillator;
let gainNode;
let isPlaying = false;

const freqSlider = document.getElementById("freqSlider");
const volSlider = document.getElementById("volSlider");
const freqValue = document.getElementById("freqValue");
const volValue = document.getElementById("volValue");

// Update frequency
freqSlider.oninput = () => {
    freqValue.textContent = freqSlider.value;
    if (oscillator) {
        oscillator.frequency.setValueAtTime(freqSlider.value, audioCtx.currentTime);
    }
};

// Update volume
volSlider.oninput = () => {
    volValue.textContent = volSlider.value;
    if (gainNode) {
        gainNode.gain.setValueAtTime(volSlider.value, audioCtx.currentTime);
    }
};

// Make function accessible to button
window.toggleTone = toggleTone;

function toggleTone() {
    const btn = document.getElementById("playBtn");

    if (!isPlaying) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freqSlider.value, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(volSlider.value, audioCtx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();

        isPlaying = true;
        btn.textContent = "Stop";
        btn.classList.add("active");

    } else {
        oscillator.stop();
        audioCtx.close();

        isPlaying = false;
        btn.textContent = "Play";
        btn.classList.remove("active");
    }
}