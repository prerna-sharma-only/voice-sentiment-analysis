const btn = document.getElementById("micBtn");
const status = document.getElementById("status");

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

//  Wave animation
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser;
let dataArray;

async function setupAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioCtx.createMediaStreamSource(stream);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawWave();
}

const canvas = document.getElementById("wave");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = 150;

function drawWave() {
    requestAnimationFrame(drawWave);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    let sliceWidth = canvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        let v = dataArray[i] / 255;
        let y = v * canvas.height;

        ctx.lineTo(x, y);
        x += sliceWidth;
    }

    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.stroke();
}

//  start audio when button clicked
btn.onclick = () => {
    recognition.start();
    status.innerText = "Listening...";
    setupAudio(); //  important
};

//  Click
btn.onclick = () => {
    recognition.start();
    status.innerText = "Listening...";
};

let chart; // global chart

//  Result (ONLY ONE FUNCTION)
recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;
    status.innerText = "Processing...";

    const res = await fetch("/analyze-text", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ text })
    });

    const data = await res.json();

    // Update UI
    document.getElementById("text").innerText = text;
    document.getElementById("main").innerText = data.main;
    document.getElementById("message").innerText = data.message;

    //  Background fix
    document.body.className = data.main || "default";

    //  Chart
    const ctxChart = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy(); // destroy old chart

    chart = new Chart(ctxChart, {
        type: "bar",
        data: {
            labels: Object.keys(data.emotions),
            datasets: [{
                label: "Emotion %",
                data: Object.values(data.emotions),
                backgroundColor: [
                    "#ff4b5c", "#00ffcc", "#ffd700",
                    "#4facfe", "#ff8c00", "#9b59b6"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            },
            scales: {
                x: { ticks: { color: "white" } },
                y: { ticks: { color: "white" } }
            }
        }
    });

    //  Voice reply
    const speech = new SpeechSynthesisUtterance(data.message);
    speechSynthesis.speak(speech);

    //  Save history
    let history = JSON.parse(localStorage.getItem("moods")) || [];
    history.push(data);
    localStorage.setItem("moods", JSON.stringify(history));

    displayHistory();

    status.innerText = "Done ✅";
};

//  Show history
function displayHistory() {
    const historyDiv = document.getElementById("history");
    let history = JSON.parse(localStorage.getItem("moods")) || [];

    historyDiv.innerHTML = "<h3>Past Moods</h3>";

    history.slice(-5).forEach(item => {
        historyDiv.innerHTML += `<p>${item.text} → ${item.main}</p>`;
    });
}

displayHistory();
const cursor = document.getElementById("cursor");

document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});
const pCanvas = document.getElementById("particles");
const pCtx = pCanvas.getContext("2d");

pCanvas.width = window.innerWidth;
pCanvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 80; i++) {
    particles.push({
        x: Math.random() * pCanvas.width,
        y: Math.random() * pCanvas.height,
        size: Math.random() * 3,
        speed: Math.random() * 1
    });
}

function drawParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) p.y = pCanvas.height;

        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fillStyle = "rgba(255,255,255,0.3)";
        pCtx.fill();
    });

    requestAnimationFrame(drawParticles);
}
drawParticles();
