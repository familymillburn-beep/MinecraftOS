// Boot
setTimeout(() => {
  document.getElementById("boot").classList.add("hidden");
  document.getElementById("desktop").classList.remove("hidden");
}, 1500);

// Clock
function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}
setInterval(updateClock, 1000);
updateClock();

// Start menu
function toggleStartMenu() {
  const menu = document.getElementById("start-menu");
  menu.classList.toggle("hidden");
}

// App definitions
const apps = {
  notes: {
    title: "Notes",
    body: `<textarea placeholder="Type your notes here..."></textarea>`
  },
  files: {
    title: "File Manager",
    body: `
      <div class="file-list">
        <strong>Home</strong><br>
        ├─ Documents<br>
        ├─ Pictures<br>
        ├─ Projects<br>
        └─ Downloads<br><br>
        <em>(You can fake a file system here later.)</em>
      </div>
    `
  },
  terminal: {
    title: "Terminal",
    body: `
      <div class="terminal" id="terminalOutput">
        WebDesk OS Shell v1.0<br>
        type "help" and press Enter<br><br>
      </div>
      <input id="terminalInput" placeholder="command..." style="width:100%;margin-top:4px;font-size:13px;">
    `
  },
  about: {
    title: "About WebDesk OS",
    body: `
      <p><strong>WebDesk OS</strong></p>
      <p>A tiny browser-based desktop environment.</p>
      <ul>
        <li>Windows & taskbar</li>
        <li>Start menu</li>
        <li>Notes, Files, Terminal</li>
      </ul>
      <p>Hosted on GitHub Pages.</p>
    `
  }
};

let zIndexCounter = 10;
let windowIdCounter = 0;
const openWindows = new Map(); // id -> {winEl, taskEl}

// Open app
function openApp(name) {
  const app = apps[name];
  if (!app) return;

  const id = "win-" + (++windowIdCounter);

  const win = document.createElement("div");
  win.className = "window";
  win.dataset.winId = id;
  win.style.top = (60 + Math.random() * 120) + "px";
  win.style.left = (80 + Math.random() * 200) + "px";
  win.style.zIndex = ++zIndexCounter;

  win.innerHTML = `
    <div class="window-header">
      <span class="title">${app.title}</span>
      <div class="controls">
        <button class="btn btn-min"></button>
        <button class="btn btn-close"></button>
      </div>
    </div>
    <div class="window-body">
      ${app.body}
    </div>
  `;

  document.getElementById("windows").appendChild(win);
  makeDraggable(win);

  // Taskbar button
  const taskBtn = document.createElement("div");
  taskBtn.className = "taskbar-button";
  taskBtn.textContent = app.title;
  taskBtn.onclick = () => focusWindow(win);
  document.getElementById("taskbar-apps").appendChild(taskBtn);

  openWindows.set(id, {winEl: win, taskEl: taskBtn});

  // Controls
  const closeBtn = win.querySelector(".btn-close");
  const minBtn = win.querySelector(".btn-min");

  closeBtn.onclick = () => closeWindow(id);
  minBtn.onclick = () => toggleMinimize(id);

  win.onmousedown = () => focusWindow(win);

  // Extra wiring for terminal
  if (name === "terminal") {
    const input = win.querySelector("#terminalInput");
    const output = win.querySelector("#terminalOutput");
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const cmd = input.value.trim();
        input.value = "";
        handleCommand(cmd, output);
      }
    });
  }

  // Hide start menu when opening
  document.getElementById("start-menu").classList.add("hidden");
}

function focusWindow(win) {
  win.style.zIndex = ++zIndexCounter;
}

function closeWindow(id) {
  const entry = openWindows.get(id);
  if (!entry) return;
  entry.winEl.remove();
  entry.taskEl.remove();
  openWindows.delete(id);
}

function toggleMinimize(id) {
  const entry = openWindows.get(id);
  if (!entry) return;
  const isHidden = entry.winEl.classList.toggle("hidden");
  if (!isHidden) focusWindow(entry.winEl);
}

// Dragging
function makeDraggable(el) {
  const header = el.querySelector(".window-header");
  let offsetX = 0, offsetY = 0, dragging = false;

  header.onmousedown = (e) => {
    dragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    document.body.style.userSelect = "none";
    focusWindow(el);
  };

  document.onmousemove = (e) => {
    if (!dragging) return;
    el.style.left = (e.clientX - offsetX) + "px";
    el.style.top = (e.clientY - offsetY) + "px";
  };

  document.onmouseup = () => {
    dragging = false;
    document.body.style.userSelect = "auto";
  };
}

// Simple terminal commands
function handleCommand(cmd, output) {
  if (!cmd) return;
  output.innerHTML += `> ${cmd}<br>`;
  switch (cmd.toLowerCase()) {
    case "help":
      output.innerHTML += "Commands: help, about, clear, time<br>";
      break;
    case "about":
      output.innerHTML += "WebDesk OS Shell v1.0 - browser desktop<br>";
      break;
    case "clear":
      output.innerHTML = "";
      break;
    case "time":
      output.innerHTML += new Date().toString() + "<br>";
      break;
    default:
      output.innerHTML += "Unknown command<br>";
  }
  output.scrollTop = output.scrollHeight;
}
