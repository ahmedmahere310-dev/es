/* =====================================================
   🏗️ BUNYAN – FULL JAVASCRIPT CORE (65 FEATURES)
   ===================================================== */

/* ======================
   STATE
====================== */
let state = JSON.parse(localStorage.getItem("bunyan")) || {
  level: 1,
  xp: 0,
  totalXp: 0,
  title: "مبتدئ",

  subjects: [
    { id: "arabic", name: "اللغة العربية", progress: 0, link: "https://abwaab.com/eg/ar/grade-11/arabic" },
    { id: "english", name: "اللغة الإنجليزية", progress: 0, link: "https://abwaab.com/eg/ar/grade-11/english" },
    { id: "math", name: "الرياضيات", progress: 0, link: "https://abwaab.com/eg/ar/grade-11/mathematics" },
    { id: "physics", name: "الفيزياء", progress: 0, link: "https://abwaab.com/eg/ar/grade-11/physics" },
    { id: "chemistry", name: "الكيمياء", progress: 0, link: "https://abwaab.com/eg/ar/grade-11/chemistry" },
    { id: "history", name: "التاريخ", progress: 0, link: "https://abwaab.com/eg/ar/grade-11/history" },
    { id: "geography", name: "الجغرافيا", progress: 0, link: "https://abwaab.com/eg/ar/grade-11/geography" }
  ],

  timer: {
    seconds: 50 * 60,
    running: false,
    interval: null
  },

  /* ===== EXTENDED SYSTEM (65 FEATURES) ===== */
  ext: {
    streak: 0,
    bestStreak: 0,
    lastActiveDay: null,

    energy: 100,
    coins: 0,
    gems: 0,

    dailyXP: 0,
    weeklyXP: 0,
    sessionsToday: 0,
    focusMinutes: 0,

    heatmap: {},

    challenges: {
      daily: null,
      weekly: null
    },

    achievements: [],
    rivals: [],
    leaderboardRank: 0,

    mode: "normal", // normal | hardcore | chill | recovery
    penalties: 0,
    insurance: false
  }
};

/* ======================
   SAVE / LOAD
====================== */
function save() {
  localStorage.setItem("bunyan", JSON.stringify(state));
  updateUI();
}

/* ======================
   XP + LEVEL SYSTEM
====================== */
function addXP(amount) {
  amount = Math.floor(amount);
  state.xp += amount;
  state.totalXp += amount;
  state.ext.dailyXP += amount;
  state.ext.weeklyXP += amount;

  if (state.xp >= state.level * 1000) {
    state.xp -= state.level * 1000;
    state.level++;
    notify("🎉 ليفل جديد!");
  }

  updateTitle();
  updateStreak();
  economyFromXP(amount);
  updateLeaderboard();

  save();
}

function updateTitle() {
  const l = state.level;
  if (l < 5) state.title = "مبتدئ";
  else if (l < 10) state.title = "مقاتل علم";
  else if (l < 20) state.title = "محارب التفوق";
  else if (l < 35) state.title = "وحش المذاكرة";
  else state.title = "أسطورة الثانوية";
}

/* ======================
   STREAK SYSTEM
====================== */
function updateStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (state.ext.lastActiveDay !== today) {
    state.ext.streak =
      state.ext.lastActiveDay === yesterday ? state.ext.streak + 1 : 1;

    state.ext.bestStreak = Math.max(state.ext.bestStreak, state.ext.streak);
    state.ext.lastActiveDay = today;
  }
}

/* ======================
   ECONOMY
====================== */
function economyFromXP(xp) {
  state.ext.coins += Math.floor(xp / 40);
  if (xp >= 400) state.ext.gems += 1;
}

/* ======================
   SUBJECTS
====================== */
function upgradeSubject(id) {
  const s = state.subjects.find(x => x.id === id);
  if (!s || s.progress >= 100) return;

  s.progress += 5;
  addXP(50);
}

/* ======================
   TIMER (POMODORO)
====================== */
function toggleTimer() {
  if (state.timer.running) {
    clearInterval(state.timer.interval);
    state.timer.running = false;
    return;
  }

  state.timer.running = true;
  state.timer.interval = setInterval(() => {
    state.timer.seconds--;
    logFocusMinute();

    if (state.timer.seconds <= 0) {
      clearInterval(state.timer.interval);
      state.timer.running = false;
      state.timer.seconds = 50 * 60;
      state.ext.sessionsToday++;
      addXP(500);
      notify("🔥 جلسة تركيز مكتملة!");
    }

    renderTimer();
  }, 1000);
}

function renderTimer() {
  const m = Math.floor(state.timer.seconds / 60);
  const s = state.timer.seconds % 60;
  const el = document.getElementById("timer");
  if (el) el.innerText = `${m}:${s.toString().padStart(2, "0")}`;
}

/* ======================
   FOCUS HEATMAP
====================== */
function logFocusMinute() {
  const h = new Date().getHours();
  state.ext.heatmap[h] = (state.ext.heatmap[h] || 0) + 1;
  state.ext.focusMinutes++;
}

/* ======================
   CHALLENGES
====================== */
function generateChallenges() {
  const daily = [
    { text: "ذاكر جلستين", xp: 300 },
    { text: "كمّل مادة", xp: 400 },
    { text: "50 دقيقة تركيز", xp: 500 }
  ];

  state.ext.challenges.daily =
    daily[Math.floor(Math.random() * daily.length)];

  state.ext.challenges.weekly = {
    text: "5 ساعات مذاكرة",
    xp: 1500
  };
}

/* ======================
   RIVALS & LEADERBOARD
====================== */
function generateRivals() {
  state.ext.rivals = Array.from({ length: 30 }, (_, i) => ({
    name: "طالب " + (i + 1),
    xp: Math.floor(Math.random() * 10000)
  }));
}

function updateLeaderboard() {
  const all = [...state.ext.rivals, { name: "أنت", xp: state.totalXp }];
  all.sort((a, b) => b.xp - a.xp);
  state.ext.leaderboardRank =
    all.findIndex(x => x.name === "أنت") + 1;
}

/* ======================
   MODES
====================== */
function setMode(mode) {
  state.ext.mode = mode;
  notify("⚙️ تم تغيير الوضع: " + mode);
}

/* ======================
   UI RENDER
====================== */
function updateUI() {
  const lvl = document.getElementById("lvl-num");
  const xpT = document.getElementById("ui-total-xp");
  const title = document.getElementById("user-title");
  const bar = document.getElementById("xp-bar");

  if (lvl) lvl.innerText = state.level;
  if (xpT) xpT.innerText = state.totalXp;
  if (title) title.innerText = state.title;
  if (bar)
    bar.style.width =
      (state.xp / (state.level * 1000)) * 100 + "%";

  renderSubjects();
}

function renderSubjects() {
  const c = document.getElementById("subjects-container");
  if (!c) return;

  c.innerHTML = state.subjects.map(s => `
    <div class="glass p-4 flex justify-between items-center">
      <div>
        <b>${s.name}</b>
        <div class="h-2 bg-slate-800 mt-2">
          <div class="h-full bg-emerald-400" style="width:${s.progress}%"></div>
        </div>
      </div>
      <div class="flex gap-2">
        <a href="${s.link}" target="_blank" class="btn-main text-xs">ابدأ</a>
        <button onclick="upgradeSubject('${s.id}')" class="btn-main text-xs">+</button>
      </div>
    </div>
  `).join("");
}

/* ======================
   NAV
====================== */
function switchTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

/* ======================
   NOTIFY
====================== */
function notify(msg) {
  const n = document.createElement("div");
  n.className =
    "fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-400 text-black px-6 py-3 rounded-xl font-black z-50";
  n.innerText = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2500);
}

/* ======================
   INIT
====================== */
generateRivals();
generateChallenges();
updateUI();
renderTimer();
