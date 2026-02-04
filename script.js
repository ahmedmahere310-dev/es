
import { GoogleGenAI } from "https://esm.sh/@google/genai@^1.39.0";

// --- State ---
let tasks = JSON.parse(localStorage.getItem('taskflow_v3')) || [];
let timeLeft = 25 * 60;
let timerId = null;
let isTimerRunning = false;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- DOM Elements ---
const taskList = document.getElementById('taskList');
const totalPointsEl = document.getElementById('totalPoints');
const timerDisplay = document.getElementById('timerDisplay');
const btnTimer = document.getElementById('btnTimer');
const aiInput = document.getElementById('aiInput');
const btnExtract = document.getElementById('btnExtract');
const focusWidget = document.getElementById('focusWidget');
const widgetTitle = document.getElementById('widgetTaskTitle');
const toast = document.getElementById('toast');

// --- Initialization ---
function init() {
    render();
    setupEventListeners();
}

function setupEventListeners() {
    btnTimer.onclick = toggleTimer;
    btnExtract.onclick = handleAIExtraction;
    document.getElementById('btnCommunity').onclick = () => document.getElementById('communityPanel').classList.remove('hidden');
    document.getElementById('btnCloseCommunity').onclick = () => document.getElementById('communityPanel').classList.add('hidden');
    document.getElementById('btnWidgetComplete').onclick = () => {
        const topTask = getTopTask();
        if (topTask) toggleTask(topTask.id);
    };
    document.getElementById('btnWidgetJump').onclick = () => {
        const topTask = getTopTask();
        if (topTask) jumpToTask(topTask.id);
    };
}

// --- Logic ---
function save() {
    localStorage.setItem('taskflow_v3', JSON.stringify(tasks));
    render();
}

function getTopTask() {
    return tasks.filter(t => !t.completed).sort((a, b) => {
        const p = { high: 2, medium: 1, low: 0 };
        return p[b.priority] - p[a.priority];
    })[0];
}

function toggleTask(id) {
    tasks = tasks.map(t => {
        if (t.id === id) {
            const newState = !t.completed;
            if (newState) showToast("رائع! المهمة أنجزت. أضفها للمجتمع لكسب نقاط ✨");
            return { ...t, completed: newState };
        }
        return t;
    });
    save();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
}

function publishTask(id) {
    tasks = tasks.map(t => {
        if (t.id === id) {
            const points = t.priority === 'high' ? 50 : 20;
            showToast(`تم النشر! +${points} نقطة تأثير 🚀`);
            return { ...t, isPublished: true, impactPoints: points };
        }
        return t;
    });
    save();
}

async function handleAIExtraction() {
    const text = aiInput.value.trim();
    if (!text) return;

    btnExtract.disabled = true;
    btnExtract.innerText = "جاري التحليل...";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `حول هذا النص لمهام بصيغة JSON: "${text}". لكل مهمة حدد: title, priority (high, medium, low).`,
            config: {
                responseMimeType: "application/json"
            }
        });

        const newItems = JSON.parse(response.text || "[]");
        newItems.forEach(item => {
            tasks.unshift({
                id: Date.now() + Math.random(),
                title: item.title,
                priority: item.priority || 'medium',
                completed: false,
                createdAt: Date.now()
            });
        });

        aiInput.value = "";
        showToast("تمت إضافة المهام بنجاح 🧠");
    } catch (e) {
        showToast("حدث خطأ في الاتصال بالذكاء الاصطناعي");
    } finally {
        btnExtract.disabled = false;
        btnExtract.innerText = "حلل وأضف";
        save();
    }
}

function toggleTimer() {
    if (isTimerRunning) {
        clearInterval(timerId);
        btnTimer.innerText = "استكمال";
    } else {
        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerId);
                showToast("انتهى وقت التركيز! ☕");
                timeLeft = 25 * 60;
            }
        }, 1000);
        btnTimer.innerText = "إيقاف مؤقت";
    }
    isTimerRunning = !isTimerRunning;
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function jumpToTask(id) {
    const el = document.getElementById(`task-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-indigo-400');
        setTimeout(() => el.classList.remove('ring-4', 'ring-indigo-400'), 2000);
    }
}

function showToast(msg) {
    const content = toast.querySelector('div');
    content.innerText = msg;
    toast.classList.remove('hidden');
    toast.classList.add('animate-toast');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// --- Rendering ---
function render() {
    // Total Points
    const pts = tasks.reduce((acc, t) => acc + (t.impactPoints || 0), 0);
    totalPointsEl.innerText = `${pts} نقطة`;

    // Tasks
    taskList.innerHTML = '';
    tasks.forEach(t => {
        const item = document.createElement('div');
        item.id = `task-${t.id}`;
        item.className = `p-4 bg-white border rounded-2xl flex items-center justify-between group transition-all ${t.completed ? 'task-completed' : ''}`;
        item.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <input type="checkbox" ${t.completed ? 'checked' : ''} class="w-5 h-5 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                <div>
                    <div class="font-bold text-sm truncate">${t.title}</div>
                    <span class="text-[9px] px-2 py-0.5 rounded uppercase font-black priority-${t.priority}">${t.priority}</span>
                </div>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                ${t.completed && !t.isPublished ? `<button class="publish-btn text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">نشر 🚀</button>` : ''}
                <button class="delete-btn text-slate-300 hover:text-red-500">✕</button>
            </div>
        `;

        item.querySelector('input').onclick = () => toggleTask(t.id);
        item.querySelector('.delete-btn').onclick = () => deleteTask(t.id);
        const pub = item.querySelector('.publish-btn');
        if (pub) pub.onclick = () => publishTask(t.id);

        taskList.appendChild(item);
    });

    // Widget Logic
    const topTask = getTopTask();
    if (topTask) {
        focusWidget.classList.remove('hidden');
        widgetTitle.innerText = topTask.title;
    } else {
        focusWidget.classList.add('hidden');
    }
}

init();
