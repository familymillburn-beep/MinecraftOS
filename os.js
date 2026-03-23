// ---------- Lock screen ----------
function updateLockTime() {
  const t = document.getElementById("lockTime");
  const d = document.getElementById("lockDate");
  if (!t || !d) return;
  const now = new Date();
  t.textContent = now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
  d.textContent = now.toLocaleDateString([], {weekday: "long", month: "long", day: "numeric"});
}
setInterval(updateLockTime, 1000);
updateLockTime();

document.getElementById("unlockBtn").onclick = tryUnlock;
document.getElementById("password").addEventListener("keydown", e => {
  if (e.key === "Enter") tryUnlock();
});

function tryUnlock() {
  const pwd = document.getElementById("password").value.trim();
  if (pwd === "1234") {
    document.getElementById("lock-screen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
    notify("Welcome back, Alicia ✨");
  } else {
    notify("Incorrect PIN");
  }
}

// ---------- Clock & widgets ----------
function updateDesktopTime() {
  const clock = document.getElementById("taskbar-clock");
  const wt = document.getElementById("widgetTime");
  const wd = document.getElementById("widgetDate");
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
  const dateStr = now.toLocaleDateString([], {weekday: "short", month: "short", day: "numeric"});
  if (clock) clock.textContent = timeStr;
  if (wt) wt.textContent = timeStr;
  if (wd) wd.textContent = dateStr;
}
setInterval(updateDesktopTime, 1000);
updateDesktopTime();

// ---------- Start menu & quick panel ----------
function toggleStartMenu() {
  document.getElementById("start-menu").classList.toggle("hidden");
  document.getElementById("quick-panel").classList.add("hidden");
}

function toggleQuickPanel() {
  document.getElementById("quick-panel").classList.toggle("hidden");
  document.getElementById("start-menu").classList.add("hidden");
}

// ---------- Themes & wallpapers ----------
const wallpapers = [
  "radial-gradient(circle at top, #22c55e, #0f172a 55%)",
  "radial-gradient(circle at top, #a855f7, #020617 55%)",
  "radial-gradient(circle at top, #0ea5e9, #020617 55%)"
];

function setWallpaper(index) {
  const wp = document.getElementById("wallpaper");
  if (!wp) return;
  wp.style.background = wallpapers[index] || wallpapers[0];
  notify("Wallpaper updated");
}

function setTheme(mode) {
  if (mode === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
  notify("Theme: " + mode);
}

// ---------- Notifications ----------
function notify(message) {
  const container = document.getElementById("notifications");
  const n = document.createElement("div");
  n.className = "notification";
  n.textContent = message;
  container.appendChild(n);
  setTimeout(() => {
    n.style.opacity = "0";
    setTimeout(() => n.remove(), 200);
  }, 3000);
}

// ---------- Window manager ----------
let zCounter = 10;
let winIdCounter = 0;
const windows = new Map(); // id -> {winEl, taskEl, minimized, maximized}

const apps = {
  notes: {
    title: "Notes",
    body: `<textarea placeholder="Write anything..."></textarea>`
  },
  files: {
    title: "Files",
    body: `
      <div class="file-list">
        <strong>Home</strong><br>
        ├─ Documents<br>
        ├─ Projects<br>
        ├─ Pictures<br>
        └─ Downloads<br><br>
        <em>Imagine this wired to real data later.</em>
      </div>
    `
  },
  browser: {
    title: "Nova Browser",
    body: `
      <div class="browser-bar">
        <input id="browserUrl" placeholder="Type a URL (fake)">
        <button onclick="fakeBrowse()">Go</button>
      </div>
      <div class="browser-view" id="browserView">
        This is a simulated browser. You could embed iframes or docs here.
      </div>
    `
  },
  terminal: {
    title: "Terminal",
    body: `
      <div class="terminal" id="termOut">
        NovaOS Shell v1.0<br>
        Type "help" and press Enter.<br><br>
      </div>
      <input class="terminal-input" id="termIn" placeholder="command...">
    `
  },
  music: {
    title: "Music",
    body: `
      <p><strong>Now Playing:</strong> <span id="songLabel">Nothing</span></p>
      <button onclick="playSong('Lo-fi Focus')">Lo-fi Focus</button>
      <button onclick="playSong('Chill Synthwave')">Chill Synthwave</button>
      <button onclick="playSong('Rainy Study')">Rainy Study</button>
      <p style="font-size:11px;opacity:0.8;margin-top:8px;">(No audio yet—just the UI. You can wire audio later.)</p>
    `
  },
  about: {
    title: "About NovaOS",
    body: `
      <p><strong>NovaOS</strong></p>
      <p>A browser-based desktop environment designed to feel more modern than a traditional OS.</p>
      <ul>
        <li>Lock screen & login</li>
        <li>Glassmorphism windows</li>
        <li>Start menu, quick settings, widgets</li>
        <li>Theme & wallpaper switching</li>
      </ul>
    `
  },
  settings: {
    title: "Settings",
    body: `
      <p><strong>Personalization</strong></p>
      <p>Use Quick Settings (☰) to change theme and wallpaper.</p>
      <p><strong>Ideas to extend:</strong></p>
      <ul>
        <li>User profiles</li>
        <li>Real file system (localStorage)</li>
        <li>App store</li>
      </ul>
    `
  }
};

function openApp(name) {
  const app = apps[name];
  if (!app) return;

  // If an app is already open, just focus it
  for (const [id, data] of windows.entries()) {
    if (data.appName === name) {
      focusWindow(id);
      return;
    }
  }

  const id = "win-" + (++winIdCounter);
  const win = document.createElement("div");
  win.className = "window";
  win.dataset.id = id;
  win.style.top = (70 + Math.random() * 80) + "px";
  win.style.left = (80 + Math.random() * 120) + "px";
  win.style.zIndex = ++zCounter;

  win.innerHTML = `
    <div class="window-header">
      <div class="window-title">${app.title}</div>
      <div class="window-controls">
        <button class="win-btn win-min"></button>
        <button class="win-btn win-max"></button>
        <button class="win-btn win-close"></button>
      </div>
    </div>
    <div class="window-body">
      ${app.body}
    </div>
  `;

  document.getElementById("windows").appendChild(win);

  const taskBtn = document.createElement("button");
  taskBtn.className = "taskbar-window-btn active";
  taskBtn.textContent = app.title;
  taskBtn.onclick = () => focusWindow(id);
  document.getElementById("taskbar-windows").appendChild(taskBtn);

  windows.set(id, {
    appName: name,
    winEl: win,
    taskEl: taskBtn,
    minimized: false,
    maximized: false,
    prevRect: null
  });

  wireWindowControls(id);
  makeDraggable(win);
  focusWindow(id);

  // Extra wiring for specific apps
  if (name === "terminal") setupTerminal(win);
}

function focusWindow(id) {
  const data = windows.get(id);
  if (!data) return;
  for (const [wid, wdata] of windows.entries()) {
    wdata.taskEl.classList.toggle("active", wid === id);
  }
  data.winEl.style.zIndex = ++zCounter;
  data.winEl.classList.remove("hidden");
  data.minimized = false;
}

function closeWindow(id) {
  const data = windows.get(id);
  if (!data) return;
  data.winEl.remove();
  data.taskEl.remove();
  windows.delete(id);
}

function toggleMinimize(id) {
  const data = windows.get(id);
  if (!data) return;
  data.minimized = !data.minimized;
  data.winEl.classList.toggle("hidden", data.minimized);
  if (!data.minimized) focusWindow(id);
}

function toggleMaximize(id) {
  const data = windows.get(id);
  if (!data) return;
  const win = data.winEl;
  if (!data.maximized) {
    data.prevRect = {
      top: win.style.top,
      left: win.style.left,
      width: win.style.width,
      height: win.style.height
    };
    win.style.top = "10px";
    win.style.left = "10px";
    win.style.width = "calc(100% - 20px)";
    win.style.height = "calc(100% - 60px)";
    data.maximized = true;
  } else {
    if (data.prevRect) {
      win.style.top = data.prevRect.top;
      win.style.left = data.prevRect.left;
      win.style.width = data.prevRect.width || "420px";
      win.style.height = data.prevRect.height || "280px";
    }
    data.maximized = false;
  }
}

function wireWindowControls(id) {
  const data = windows.get(id);
  if (!data) return;
  const win = data.winEl;
  const minBtn = win.querySelector(".win-min");
  const maxBtn = win.querySelector(".win-max");
  const closeBtn = win.querySelector(".win-close");

  minBtn.onclick = () => toggleMinimize(id);
  maxBtn.onclick = () => toggleMaximize(id);
  closeBtn.onclick = () => closeWindow(id);

  win.onmousedown = () => focusWindow(id);
}

// Dragging
function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  header.addEventListener("mousedown", e => {
    const id = win.dataset.id;
    const data = windows.get(id);
    if (data && data.maximized) return; // don't drag maximized
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    win.style.left = (e.clientX - offsetX) + "px";
    win.style.top = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    document.body.style.userSelect = "auto";
  });
}

// ---------- App logic ----------
function fakeBrowse() {
  const urlInput = document.getElementById("browserUrl");
  const view = document.getElementById("browserView");
  if (!urlInput || !view) return;
  const url = urlInput.value.trim() || "https://example.com";
  view.textContent = `Pretending to browse: ${url}\n\nYou could embed real content with iframes later.`;
}

function setupTerminal(win) {
  const out = win.querySelector("#termOut");
  const input = win.querySelector("#termIn");
  if (!out || !input) return;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const cmd = input.value.trim();
      input.value = "";
      handleCommand(cmd, out);
    }
  });
}

function handleCommand(cmd, out) {
  if (!cmd) return;
  out.innerHTML += `> ${cmd}<br>`;
  switch (cmd.toLowerCase()) {
    case "help":
      out.innerHTML += "Commands: help, about, clear, time, notify<br>";
      break;
    case "about":
      out.innerHTML += "NovaOS Shell v1.0 - browser desktop<br>";
      break;
    case "clear":
      out.innerHTML = "";
      break;
    case "time":
      out.innerHTML += new Date().toString() + "<br>";
      break;
    case "notify":
      notify("Hello from the terminal");
      break;
    default:
      out.innerHTML += "Unknown command<br>";
  }
  out.scrollTop = out.scrollHeight;
}

function playSong(name) {
  const label = document.getElementById("songLabel");
  if (label) label.textContent = name;
  notify("Now playing: " + name);
}

// Close panels when clicking desktop
document.addEventListener("click", e => {
  const start = document.getElementById("start-menu");
  const quick = document.getElementById("quick-panel");
  const startBtn = document.getElementById("start-button");
  const quickBtn = document.getElementById("quick-toggle");

  if (!start.contains(e.target) && e.target !== startBtn) {
    start.classList.add("hidden");
  }
  if (!quick.contains(e.target) && e.target !== quickBtn) {
    quick.classList.add("hidden");
  }
}, true);
