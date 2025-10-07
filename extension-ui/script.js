const focusDuration = 25 * 60;
let remainingSeconds = focusDuration;
let focusTimerInterval = null;

const focusTimer = document.getElementById("focusTimer");
const startFocusBtn = document.getElementById("startFocus");
const resetFocusBtn = document.getElementById("resetFocus");
const focusHint = document.getElementById("focusHint");
const themeToggle = document.getElementById("themeToggle");
const quickActionButtons = document.querySelectorAll(".pill");
const noteForm = document.getElementById("noteForm");
const noteInput = document.getElementById("noteInput");
const noteList = document.getElementById("noteList");

const STORAGE_KEYS = {
  THEME: "extension-ui:theme",
  NOTES: "extension-ui:notes",
  SETTINGS: "extension-ui:settings",
};

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
}

function updateTimerDisplay() {
  focusTimer.textContent = formatTime(remainingSeconds);
}

function setTimerHint(text, status = "idle") {
  focusHint.textContent = text;
  focusHint.dataset.status = status;
}

function stopTimer() {
  if (focusTimerInterval) {
    clearInterval(focusTimerInterval);
    focusTimerInterval = null;
  }
}

function startFocusSession() {
  if (focusTimerInterval) return;
  const endTime = Date.now() + remainingSeconds * 1000;
  setTimerHint("保持专注，加油！", "running");
  startFocusBtn.textContent = "暂停";

  focusTimerInterval = setInterval(() => {
    const diff = Math.round((endTime - Date.now()) / 1000);
    remainingSeconds = Math.max(diff, 0);
    updateTimerDisplay();

    if (remainingSeconds === 0) {
      stopTimer();
      startFocusBtn.textContent = "开始";
      setTimerHint("时间到！记得奖励自己一次休息。", "complete");
      remainingSeconds = focusDuration;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseFocusSession() {
  stopTimer();
  setTimerHint("已暂停。点击开始继续。", "paused");
  startFocusBtn.textContent = "开始";
}

startFocusBtn.addEventListener("click", () => {
  if (focusTimerInterval) {
    pauseFocusSession();
  } else {
    startFocusSession();
  }
});

resetFocusBtn.addEventListener("click", () => {
  stopTimer();
  remainingSeconds = focusDuration;
  updateTimerDisplay();
  setTimerHint("点击“开始”启动新一轮专注。", "idle");
  startFocusBtn.textContent = "开始";
});

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  const icon = theme === "dark" ? "☀️" : "🌙";
  themeToggle.querySelector(".theme-toggle__icon").textContent = icon;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}

themeToggle.addEventListener("click", toggleTheme);

(function initializeTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme === "dark") {
    applyTheme("dark");
  }
})();

function renderNotes(notes) {
  noteList.innerHTML = "";
  notes.forEach((note, index) => {
    const item = document.createElement("li");
    item.className = "note";

    const text = document.createElement("span");
    text.className = "note__text";
    text.textContent = note;

    const delBtn = document.createElement("button");
    delBtn.className = "note__delete";
    delBtn.type = "button";
    delBtn.setAttribute("aria-label", `删除速记 ${index + 1}`);
    delBtn.innerHTML = "&times;";
    delBtn.addEventListener("click", () => {
      notes.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      renderNotes(notes);
    });

    item.appendChild(text);
    item.appendChild(delBtn);
    noteList.appendChild(item);
  });
}

function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("无法解析存储的笔记，将清空。");
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    return [];
  }
}

const notes = loadNotes();
renderNotes(notes);

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = noteInput.value.trim();
  if (!value) return;
  notes.unshift(value);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  renderNotes(notes);
  noteForm.reset();
});

quickActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    switch (action) {
      case "focus":
        setTimerHint("已准备好，点击开始立即进入专注。");
        break;
      case "break":
        setTimerHint("稍后记得起身走动，喝杯水放松一下！");
        break;
      case "summary":
        setTimerHint("总结提示：回顾今日完成的 3 件事，并计划明天的重点。");
        break;
      default:
        break;
    }
    button.classList.add("pill--active");
    setTimeout(() => button.classList.remove("pill--active"), 800);
  });
});

(function restoreSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return;
    const settings = JSON.parse(stored);
    Object.entries(settings).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) {
        input.checked = Boolean(value);
      }
    });
  } catch (error) {
    console.warn("无法解析设置，将使用默认值。");
  }
})();

const settingInputs = document.querySelectorAll(".setting__input");
settingInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const settings = Array.from(settingInputs).reduce((acc, item) => {
      acc[item.id] = item.checked;
      return acc;
    }, {});
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  });
});

updateTimerDisplay();
