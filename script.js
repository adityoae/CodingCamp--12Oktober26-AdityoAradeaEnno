// Local Storage
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Greeting
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const greetingEl = document.getElementById("greeting");
const nameInput = document.getElementById("name-input");
const nameSaveBtn = document.getElementById("name-save");

let userName = loadData("userName", "");

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  if (hour >= 18 && hour < 22) return "Good Evening";
  return "Good Night";
}

function updateGreeting() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-GB"); // format 24 jam HH:MM:SS
  dateEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const base = getGreeting(now.getHours());
  greetingEl.textContent = userName ? base + ", " + userName : base;
}

nameSaveBtn.addEventListener("click", function () {
  userName = nameInput.value.trim();
  saveData("userName", userName);
  updateGreeting();
});

nameInput.value = userName;
updateGreeting();
setInterval(updateGreeting, 1000);

//Focus Timer
const TIMER_SECONDS = 25 * 60;
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("timer-start");
const stopBtn = document.getElementById("timer-stop");
const resetBtn = document.getElementById("timer-reset");

let remaining = TIMER_SECONDS;
let timerId = null;

function renderTimer() {
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  timerDisplay.textContent = minutes + ":" + seconds;
}

function startTimer() {
  if (timerId !== null) return; // cegah interval ganda
  timerId = setInterval(function () {
    remaining--;
    renderTimer();
    if (remaining <= 0) {
      stopTimer();
      alert("Waktu fokus selesai!");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  stopTimer();
  remaining = TIMER_SECONDS;
  renderTimer();
}

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
renderTimer();

//To-Do List
const taskInput = document.getElementById("task-input");
const taskAddBtn = document.getElementById("task-add");
const taskList = document.getElementById("task-list");
const taskMessage = document.getElementById("task-message");

let tasks = loadData("tasks", []);

function isDuplicate(text, ignoreId) {
  const target = text.toLowerCase();
  return tasks.some(function (task) {
    return task.id !== ignoreId && task.text.toLowerCase() === target;
  });
}
                                                                            
function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet. Add your first one above.";
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach(function (task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", function () {
      task.done = checkbox.checked;
      saveData("tasks", tasks);
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-ghost btn-small";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () {
      const newText = prompt("Edit task:", task.text);
      if (newText === null) return; // user menekan Cancel
      const trimmed = newText.trim();
      if (trimmed === "") return;
      if (isDuplicate(trimmed, task.id)) {
        taskMessage.textContent = "Task already exists.";
        return;
      }
      task.text = trimmed;
      taskMessage.textContent = "";
      saveData("tasks", tasks);
      renderTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger btn-small";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveData("tasks", tasks);
      renderTasks();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === "") {
    taskMessage.textContent = "Please type a task first.";
    return;
  }
  if (isDuplicate(text, null)) {
    taskMessage.textContent = "Task already exists.";
    return;
  }
  tasks.push({ id: Date.now(), text: text, done: false });
  saveData("tasks", tasks);
  taskInput.value = "";
  taskMessage.textContent = "";
  renderTasks();
}

taskAddBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") addTask();
});
renderTasks();


   // QUICK LINK

const linkNameInput = document.getElementById("link-name");
const linkUrlInput = document.getElementById("link-url");
const linkAddBtn = document.getElementById("link-add");
const linkListEl = document.getElementById("link-list");
const linkMessage = document.getElementById("link-message");

const defaultLinks = [
  { name: "Google", url: "https://www.google.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "Calendar", url: "https://calendar.google.com" }
];

let links = loadData("links", defaultLinks);

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) return "https://" + url;
  return url;
}

function renderLinks() {
  linkListEl.innerHTML = "";

  links.forEach(function (link, index) {
    const wrapper = document.createElement("div");
    wrapper.className = "link-item";

    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.name;

    const removeBtn = document.createElement("button");
    removeBtn.className = "link-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "x";
    removeBtn.setAttribute("aria-label", "Remove " + link.name);
    removeBtn.addEventListener("click", function () {
      links.splice(index, 1);
      saveData("links", links);
      renderLinks();
    });

    wrapper.appendChild(anchor);
    wrapper.appendChild(removeBtn);
    linkListEl.appendChild(wrapper);
  });
}

linkAddBtn.addEventListener("click", function () {
  const name = linkNameInput.value.trim();
  const url = linkUrlInput.value.trim();
  if (name === "" || url === "") {
    linkMessage.textContent = "Fill in both the name and the URL.";
    return;
  }
  links.push({ name: name, url: normalizeUrl(url) });
  saveData("links", links);
  linkNameInput.value = "";
  linkUrlInput.value = "";
  linkMessage.textContent = "";
  renderLinks();
});

renderLinks();

/* ============================================================
   5. LIGHT / DARK MODE
   ============================================================ */
const themeBtn = document.getElementById("theme-toggle");
let theme = loadData("theme", "light");

function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

themeBtn.addEventListener("click", function () {
  theme = theme === "dark" ? "light" : "dark";
  saveData("theme", theme);
  applyTheme();
});

applyTheme();