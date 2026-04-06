// ASTRA Frontend Logic Engine

// === DOM Elements ===
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const wakeBtn = document.getElementById("wake-btn");
const micGraphics = document.getElementById("mic-graphics");
const liveTranscript = document.getElementById("live-transcript");
const commandLog = document.getElementById("command-log");
const remindersList = document.getElementById("reminders-list");
const setupModal = document.getElementById("setupModal");
const subButton = document.getElementById("subButton");

// === State & Audio ===
let isListening = false;
let isProcessing = false;
let userName = "Commander";
const WAKE_WORD = "astra";

// Initialize Speech Synthesis
const synth = window.speechSynthesis;
let astraVoice = null;

// Ensure voices are loaded
synth.onvoiceschanged = () => {
    const voices = synth.getVoices();
    // Try to find a good English female voice for ASTRA
    astraVoice = voices.find(v => v.name.includes("Zira") || v.name.includes("Female") || v.name.includes("Google UK English Female")) || voices[0];
};

// === Core Functions ===

function setStatus(state) {
    statusIndicator.className = `status-pill ${state}`;
    micGraphics.className = `mic-ripple ${state === 'listening' ? 'listening-active' : ''}`;

    if (state === 'sleeping') {
        statusText.innerText = "Sleeping";
        isListening = false;
        wakeBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> Initialize';
    } else if (state === 'listening') {
        statusText.innerText = "Listening";
        isListening = true;
        wakeBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i> Sleep Mode';
    } else if (state === 'processing') {
        statusText.innerText = "Processing";
        isProcessing = true;
    }
}

function addLog(message, type = "astra") {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = document.createElement("div");
    logItem.className = `log-entry ${type}`;
    logItem.innerHTML = `<span class="time">[${time}]</span> ${message}`;
    commandLog.appendChild(logItem);
    commandLog.scrollTop = commandLog.scrollHeight; // Auto-scroll
}

function speak(text) {
    if (synth.speaking) synth.cancel(); // Stop talking if already talking

    addLog(text, "astra");
    setStatus("processing");

    const utterance = new SpeechSynthesisUtterance(text);
    if (astraVoice) utterance.voice = astraVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    utterance.onend = () => {
        if (isListening) setStatus("listening");
        else setStatus("sleeping");
        isProcessing = false;
    };

    synth.speak(utterance);
}

// === Backend Communication ===

async function launchOSApp(appName) {
    try {
        const res = await fetch('http://localhost:5500/api/launch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName })
        });
        const data = await res.json();
        if (data.success) speak(`Opening ${appName}.`);
        else speak(`I couldn't find ${appName} in my launch dictionary.`);
    } catch (e) {
        speak("Failed to connect to the backend server.");
        console.error(e);
    }
}

async function sendSystemCommand(action) {
    try {
        const res = await fetch('http://localhost:5500/api/system', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        const data = await res.json();
        if (data.success) speak(`Executing system command: ${action}.`);
        else speak("System command not recognized.");
    } catch (e) {
        speak("System execution failed.");
    }
}

async function askAI(prompt) {
    speak("Processing...");
    try {
        const res = await fetch('http://localhost:5500/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (data.success) speak(data.response);
        else speak("Sorry, my AI brain encountered an error.");
    } catch (e) {
        speak("I cannot reach the AI server right now.");
    }
}

async function closeOSApp(appName) {
    try {
        const res = await fetch('http://localhost:5500/api/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName })
        });
        const data = await res.json();
        if (data.success) speak(`Closing ${appName}.`);
        else speak(`I couldn't close ${appName}. It might not be open right now.`);
    } catch (e) {
        speak("Failed to connect to the backend server to close it.");
        console.error(e);
    }
}

async function buildWebsite(topic) {
    speak(`I am writing the code for a website about ${topic}. This might take a few seconds.`);
    try {
        const res = await fetch('http://localhost:5500/api/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
        });
        const data = await res.json();
        if (data.success && data.url) {
            speak("Website generation complete. Opening your new site now.");
            window.open(data.url, '_blank');
        } else {
            speak("I encountered an error while trying to build the website.");
        }
    } catch (e) {
        speak("Failed to reach the backend builder module.");
        console.error(e);
    }
}

// === UI Extensions (Pomodoro) ===
let pomodoroTimer = null;
let pomodoroTimeLeft = 25 * 60; // 25 mins
let isPomodoroActive = false;

function formatPomodoroTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updatePomodoroUI() {
    const timeEl = document.getElementById("pomodoro-time");
    if (timeEl) timeEl.innerText = formatPomodoroTime(pomodoroTimeLeft);
}

function startPomodoro() {
    if (isPomodoroActive) return;
    pomodoroTimeLeft = 25 * 60;
    isPomodoroActive = true;

    document.getElementById("pomodoro-status").innerText = "Focusing";
    document.getElementById("pomodoro-container").style.borderColor = "var(--status-process)";

    speak("Starting 25 minute focus session. Stay productive.");

    pomodoroTimer = setInterval(() => {
        pomodoroTimeLeft--;
        updatePomodoroUI();
        if (pomodoroTimeLeft <= 0) {
            clearInterval(pomodoroTimer);
            isPomodoroActive = false;
            document.getElementById("pomodoro-status").innerText = "Finished";
            document.getElementById("pomodoro-container").style.borderColor = "var(--status-listen)";
            speak("Focus session complete. Great job! Take a 5 minute break.");
        }
    }, 1000);
}

function stopPomodoro() {
    if (!isPomodoroActive) return;
    clearInterval(pomodoroTimer);
    isPomodoroActive = false;
    pomodoroTimeLeft = 25 * 60;
    updatePomodoroUI();
    document.getElementById("pomodoro-status").innerText = "Ready";
    document.getElementById("pomodoro-container").style.borderColor = "var(--border-glow)";
    speak("Focus timer stopped.");
}

// === Command Parsing Engine ===

async function processCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase().trim();
    let commandPayload = "";

    // 1. WAKE WORD OR DIRECT COMMAND DETECTION
    if (lowerTranscript.startsWith(WAKE_WORD) || lowerTranscript.includes(WAKE_WORD)) {
        // Strip out Astra if it exists
        commandPayload = lowerTranscript.replace(new RegExp(`.*${WAKE_WORD}\\s*`), '').trim();
    } else {
        // If they didn't say Astra, check if they started with a direct action command
        const directCommands = ["open ", "close ", "shut down ", "search ", "find ", "play ", "weather", "build a website", "make a website", "code a website", "create a website"];
        const isDirect = directCommands.some(cmd => lowerTranscript.startsWith(cmd) || lowerTranscript === cmd);

        if (isDirect) {
            commandPayload = lowerTranscript;
        } else {
            console.log("Ignored: Wake word not detected & no direct command phrase -> " + transcript);
            return; // Ignore completely
        }
    }

    if (!commandPayload) {
        speak(`Yes, ${userName}?`);
        return;
    }

    addLog(`You: ${transcript}`, "user");

    // 1. DYNAMIC MODULES & ANALYTICS PIPELINE (Backend)
    try {
        const res = await fetch('http://localhost:5500/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: commandPayload })
        });
        const data = await res.json();

        // If a plugin module handled it, speak the response and stop.
        if (data.handled) {
            if (data.actionData && data.actionData.type === 'SPEAK_REMINDERS') {
                const reminders = Array.from(document.querySelectorAll("#reminders-list li:not(.placeholder)")).map(li => li.innerText);
                let reminderText = "";
                if (reminders.length > 0) {
                    reminderText = ` You also have these active reminders: ${reminders.join(", ")}.`;
                } else {
                    reminderText = ` You have no active reminders scheduled today.`;
                }
                speak(data.response + reminderText);
                return;
            }

            if (data.response) speak(data.response);
            return;
        }
    } catch (e) {
        console.error("Backend Dynamic Processor failed:", e);
    }

    // 1.2 THEME & POMODORO (Frontend)
    if (commandPayload.includes("enable light mode") || commandPayload.includes("enable light theme")) {
        document.body.classList.add("light-mode");
        speak("Light mode enabled.");
        return;
    }
    if (commandPayload.includes("enable dark mode") || commandPayload.includes("enable dark theme")) {
        document.body.classList.remove("light-mode");
        speak("Dark mode enabled.");
        return;
    }
    if (commandPayload.includes("start focus mode") || commandPayload.includes("start focus timer")) {
        startPomodoro();
        return;
    }
    if (commandPayload.includes("stop focus mode") || commandPayload.includes("stop focus timer")) {
        stopPomodoro();
        return;
    }

    // 1.5 CODE GENERATION COMMANDS
    const prefixes = ["build a website about ", "make a website about ", "code a website about ", "create a website about ", "build a website for ", "make a website for "];
    const matchedPrefix = prefixes.find(p => commandPayload.startsWith(p));

    if (matchedPrefix) {
        const topic = commandPayload.replace(matchedPrefix, "").trim();
        buildWebsite(topic);
        return;
    }

    // 2. CLOSE APPLICATIONS (Backend TaskKill)
    if (commandPayload.startsWith("close ") || commandPayload.startsWith("shut down ")) {
        // e.g "close chrome", "close youtube"
        const appName = commandPayload.replace("close ", "").replace("shut down ", "").replace("the ", "");
        closeOSApp(appName);
        return;
    }

    // 3. OPEN APPLICATIONS (Backend)
    if (commandPayload.startsWith("open ") && !commandPayload.includes("youtube") && !commandPayload.includes("github") && !commandPayload.includes("amazon")) {
        const appName = commandPayload.replace("open ", "");
        launchOSApp(appName);
        return;
    }

    // 4. WEB COMMANDS
    if (commandPayload.includes("open youtube")) {
        speak("Opening YouTube.");
        window.open("https://www.youtube.com");
        return;
    }
    if (commandPayload.includes("open github")) {
        speak("Opening GitHub.");
        window.open("https://github.com");
        return;
    }
    if (commandPayload.includes("open amazon")) {
        speak("Opening Amazon.");
        window.open("https://www.amazon.com");
        return;
    }

    // 5. SEARCH COMMANDS
    if (commandPayload.startsWith("search ") || commandPayload.startsWith("find ")) {
        let query = commandPayload.replace("search ", "").replace("find ", "").trim();

        if (query === "youtube") {
            speak("Opening YouTube.");
            window.open("https://www.youtube.com");
            return;
        }

        // Contextual routing: "search youtube cats" or "search on youtube for cats"
        if (query.includes("youtube for ") || query.includes("on youtube for ") || query.startsWith("youtube ")) {
            query = query.replace("youtube for ", "").replace("on youtube for ", "").replace("youtube ", "").trim();
            speak(`Searching YouTube for ${query}.`);
            window.open(`https://www.youtube.com/results?search_query=${query.split(' ').join('+')}`);
            return;
        }
        // Fallback: Default Google Search
        else {
            query = query.replace("google for ", "").replace("for ", "");
            speak(`Searching the web for ${query}.`);
            window.open(`https://www.google.com/search?q=${query.split(' ').join('+')}`);
            return;
        }
    }

    // 6. SYSTEM COMMANDS (Backend)
    if (commandPayload === "shutdown" || commandPayload === "restart" || commandPayload === "lock computer") {
        sendSystemCommand(commandPayload);
        return;
    }

    // 6. MEDIA COMMANDS (Basic Browser Routing)
    // Note: Deep media control requires complex integrations. For now, we mock.
    if (commandPayload.includes("play music")) {
        speak("Opening your default music player dashboard.");
        window.open("https://open.spotify.com");
        return;
    }

    // 7. WEATHER COMMAND
    if (commandPayload.includes("weather")) {
        // We'll search Google for weather directly to bypass API key requirements for this demo
        speak("Checking the weather forecast.");
        window.open("https://www.google.com/search?q=weather");
        return;
    }

    // 8. REMINDERS
    if (commandPayload.startsWith("remind me to ")) {
        const reminderText = commandPayload.replace("remind me to ", "");

        const li = document.createElement("li");
        li.innerHTML = `<i class="fa-solid fa-clock"></i> ${reminderText}`;

        // Remove placeholder if present
        const placeholder = remindersList.querySelector(".placeholder");
        if (placeholder) placeholder.remove();

        remindersList.appendChild(li);
        speak(`Reminder set to ${reminderText}.`);
        return;
    }

    // 9. AI FALLBACK
    // If it doesn't match predefined regex rules above, send it to OpenAI
    askAI(commandPayload);
}

// === Speech Recognition Engine ===

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // We use onend loop instead
    recognition.interimResults = true; // Show text as user speaks

    recognition.onstart = () => {
        setStatus("listening");
        liveTranscript.innerText = "Listening...";
    };

    recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }

        if (interim) liveTranscript.innerText = `"${interim}"`;

        if (final) {
            liveTranscript.innerText = `"${final}"`;
            if (!isProcessing) {
                processCommand(final);
            }
        }
    };

    // ALWAYS LISTENING LOOP
    recognition.onend = () => {
        if (isListening) { // Only restart if user hasn't explicitly clicked "sleep"
            try {
                recognition.start();
            } catch (e) { } // Ignore fast restart collisions
        }
    };

    recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
            setStatus('sleeping');
            addLog("Microphone access denied.", "system");
        }
    };

    // Toggle Button
    wakeBtn.addEventListener('click', () => {
        if (isListening) {
            isListening = false;
            recognition.stop();
            setStatus('sleeping');
            speak("ASTRA going into sleep mode.");
        } else {
            setStatus('listening');
            recognition.start();
            speak(getSmartGreeting() + ` I am ASTRA. Awaiting your command.`);
        }
    });

    function getSmartGreeting() {
        const hour = new Date().getHours();
        if (hour < 5) return "Good late night.";
        if (hour < 12) return "Good morning.";
        if (hour < 17) return "Good afternoon.";
        return "Good evening.";
    }

} else {
    addLog("Speech Recognition unsupported in this browser. Use Chrome/Edge.", "system");
    wakeBtn.disabled = true;
}

// === Setup Flow ===
function handleSetup() {
    const nameInput = document.getElementById("setup-name").value.trim();
    if (nameInput) userName = nameInput;
    setupModal.style.display = "none";
    addLog(`User profile loaded: ${userName}`, "system");
}
subButton.addEventListener('click', handleSetup);

// Auto-show modal
document.addEventListener('DOMContentLoaded', () => {
    setupModal.style.display = 'flex';
});
