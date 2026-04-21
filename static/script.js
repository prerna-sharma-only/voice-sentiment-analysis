const btn = document.getElementById("micBtn");
const status = document.getElementById("status");
const textBtn = document.getElementById("textBtn");
const textInput = document.getElementById("textInput");
const glow = document.getElementById("mouseGlow");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = false;

let isListening = false;

// 🎤 MIC
btn.onclick = () => {
    if (!isListening) {
        recognition.start();
        status.innerText = "🎤 Listening...";
        isListening = true;
        btn.innerText = "🛑 Stop";
    } else {
        recognition.stop();
        status.innerText = "Stopped";
        isListening = false;
        btn.innerText = "🎙️ Start Talking";
    }
};

// 🎤 RESULT
recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    console.log("🎙️ Recognized:", text);
    recognition.stop();
    analyzeText(text);
};

// 🎤 END
recognition.onend = () => {
    isListening = false;
    btn.innerText = "🎙️ Start Talking";
};

// ❌ ERROR
recognition.onerror = (event) => {
    console.error("Speech error:", event.error);
    status.innerText = "Mic Error: " + event.error;
};

// ✍️ TEXT
textBtn.onclick = () => {
    const text = textInput.value.trim();
    if (!text) return alert("Enter text");
    analyzeText(text);
};

textInput.addEventListener("keypress", e => {
    if (e.key === "Enter") textBtn.click();
});

// 🔥 API
async function analyzeText(text) {
    status.innerText = "Processing...";

    try {
        const res = await fetch("/analyze-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!res.ok) {
            throw new Error("Server responded with error");
        }

        const data = await res.json();
        console.log("📦 Response:", data);

        document.getElementById("text").innerText = text;
        document.getElementById("main").innerText =
            (data.emotion || "unknown") + " (" + (data.sentiment || "unknown") + ")";
        document.getElementById("message").innerText =
            data.message || "";

        status.innerText = "Done ✅";

    } catch (err) {
        console.error("❌ Fetch error:", err);
        status.innerText = "Server error ❌";
    }
}

// 🖱️ EFFECT
document.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

// ✨ SCROLL
function revealOnScroll() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add("active");
        }
    });
}
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();
