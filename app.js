// ═══════════════════════════════════════
// TRAINING PLAN DATA
// ═══════════════════════════════════════
const PLAN = [
  { week: 1, focus: "Починаємо", workouts: [
    { type: "easy", km: 3, desc: "Легкий темп, можеш розмовляти" },
    { type: "easy", km: 3, desc: "Зроби 5 хв розминки, 5 хв заминки" },
    { type: "long", km: 5, desc: "Перший довгий — без поспіху" }
  ]},
  { week: 2, focus: "Будуємо базу", workouts: [
    { type: "easy", km: 3, desc: "Рівний спокійний темп" },
    { type: "easy", km: 4, desc: "Додай 5 хв до минулого тижня" },
    { type: "long", km: 6, desc: "Повільно, дихай носом" }
  ]},
  { week: 3, focus: "Ростемо", workouts: [
    { type: "easy", km: 4, desc: "Легкий біг, контроль серця" },
    { type: "tempo", km: 4, desc: "Середина — 2 км у комфортному темпі" },
    { type: "long", km: 7, desc: "Терпіння — ключ тижня" }
  ]},
  { week: 4, focus: "Відновлення", workouts: [
    { type: "easy", km: 3, desc: "Дуже легко, відновлення" },
    { type: "easy", km: 4, desc: "Спокійний крейсерський темп" },
    { type: "long", km: 5, desc: "Легкий довгий, менше за мин. тиждень" }
  ]},
  { week: 5, focus: "Перший поріг", workouts: [
    { type: "easy", km: 5, desc: "Легкий контрольний темп" },
    { type: "tempo", km: 5, desc: "20 хв у темпі, де важко розмовляти" },
    { type: "long", km: 8, desc: "Перший раз більше 8 км — привіт!" }
  ]},
  { week: 6, focus: "Тримо темп", workouts: [
    { type: "easy", km: 5, desc: "Легко, але довше за звикла" },
    { type: "tempo", km: 6, desc: "3×1 км з відпочинком по 90 сек" },
    { type: "long", km: 9, desc: "9 км — вже справжній бігун" }
  ]},
  { week: 7, focus: "Двозначний рубіж", workouts: [
    { type: "easy", km: 6, desc: "Рівно, без змін темпу" },
    { type: "tempo", km: 6, desc: "25 хв безперервний темповий біг" },
    { type: "long", km: 10, desc: "🎯 Перші 10 км! Зупинись і відзначай" }
  ]},
  { week: 8, focus: "Відпочиваємо", workouts: [
    { type: "easy", km: 4, desc: "Дуже легко — ноги відпочивають" },
    { type: "easy", km: 5, desc: "Бережи темп, фокус на техніці" },
    { type: "long", km: 7, desc: "Легкий відновлювальний довгий" }
  ]},
  { week: 9, focus: "Нова висота", workouts: [
    { type: "easy", km: 6, desc: "Зроби динамічну розминку перед" },
    { type: "tempo", km: 7, desc: "30 хв темпового бігу" },
    { type: "long", km: 12, desc: "12 км — ти вже майже вдвічі більше" }
  ]},
  { week: 10, focus: "Набираємо оберти", workouts: [
    { type: "easy", km: 6, desc: "Легко, але впевнено" },
    { type: "tempo", km: 7, desc: "2×15 хв темп, відпочинок 2 хв" },
    { type: "long", km: 13, desc: "13 км — напівмарафон за обрієм" }
  ]},
  { week: 11, focus: "Пікове навантаження", workouts: [
    { type: "easy", km: 7, desc: "Тривалий легкий, збери ноги" },
    { type: "tempo", km: 8, desc: "35 хв темп, контролюй дихання" },
    { type: "long", km: 15, desc: "15 км! Ти готовий до більшого" }
  ]},
  { week: 12, focus: "Відновлення перед фіналом", workouts: [
    { type: "easy", km: 5, desc: "Дуже легко, бережи ноги" },
    { type: "easy", km: 6, desc: "Крейсерський, комфортний темп" },
    { type: "long", km: 8, desc: "Легкий довгий — перезарядка" }
  ]},
  { week: 13, focus: "Фінальний натиск", workouts: [
    { type: "easy", km: 7, desc: "Впевнений старт тижня" },
    { type: "tempo", km: 9, desc: "40 хв темп, стабільний ритм" },
    { type: "long", km: 17, desc: "17 км — рекорд тренувань!" }
  ]},
  { week: 14, focus: "Максимум", workouts: [
    { type: "easy", km: 7, desc: "Легко — ноги готуються" },
    { type: "tempo", km: 9, desc: "35 хв темп, ти вже знаєш як" },
    { type: "long", km: 19, desc: "19 км — майже фініш 💪" }
  ]},
  { week: 15, focus: "Звужуємо (тейпер)", workouts: [
    { type: "easy", km: 6, desc: "Легко, збережи енергію" },
    { type: "tempo", km: 7, desc: "20 хв темп, ніяких надзусиль" },
    { type: "long", km: 12, desc: "Останній довгий — насолоджуйся" }
  ]},
  { week: 16, focus: "Тиждень забігу", workouts: [
    { type: "easy", km: 4, desc: "Дуже легко, розім'яти ноги" },
    { type: "easy", km: 3, desc: "15 хв легкий біг + 5×100м прискорення" },
    { type: "race", km: 21, desc: "🏁 ДЕНЬ ЗАБІГУ! Насолоджуйся кожним кроком" }
  ]},
];

const TYPE_LABELS = { easy: "Легкий", tempo: "Темп", long: "Довгий", race: "ЗАБІГ", rest: "Відпочинок" };
const TYPE_CLASS  = { easy: "type-easy", tempo: "type-tempo", long: "type-long", race: "type-race", rest: "type-rest" };

// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let state = null;

function loadState() {
  const raw = localStorage.getItem('runplan_v2');
  if (raw) { try { state = JSON.parse(raw); return true; } catch(e){} }
  return false;
}
function saveState() { localStorage.setItem('runplan_v2', JSON.stringify(state)); }

// ═══════════════════════════════════════
// SETUP
// ═══════════════════════════════════════
let eventRows = [];

function addEventRow(name = '', date = '') {
  const id = Date.now();
  eventRows.push(id);
  const el = document.createElement('div');
  el.className = 'event-row';
  el.id = 'er-' + id;
  el.innerHTML = `
    <input type="text" class="form-input" placeholder="Назва (напр. 10 км забіг)" value="${name}" id="en-${id}">
    <input type="date" class="form-input" id="ed-${id}" value="${date}">
    <button class="btn-icon" onclick="removeEvent(${id})">×</button>
  `;
  document.getElementById('events-list').appendChild(el);
}

function removeEvent(id) {
  document.getElementById('er-' + id)?.remove();
  eventRows = eventRows.filter(x => x !== id);
}

function startPlan() {
  const startDate = document.getElementById('start-date').value;
  const endDate   = document.getElementById('end-date').value;
  if (!startDate) { alert('Вкажи дату початку!'); return; }

  const events = eventRows.map(id => ({
    name: document.getElementById('en-' + id)?.value || 'Подія',
    date: document.getElementById('ed-' + id)?.value || ''
  })).filter(e => e.date);

  state = { startDate, endDate, events, done: {} };
  saveState();
  showApp();
}

// ═══════════════════════════════════════
// APP
// ═══════════════════════════════════════
function showApp() {
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  renderAll();
}

function currentWeekIndex() {
  if (!state.startDate) return 0;
  const start = new Date(state.startDate);
  const now   = new Date();
  const diff  = Math.floor((now - start) / (7 * 24 * 3600 * 1000));
  return Math.max(0, Math.min(diff, 15));
}

function totalDone() {
  return Object.values(state.done).filter(Boolean).length;
}

function totalDoneKm() {
  let km = 0;
  Object.keys(state.done).forEach(k => {
    if (!state.done[k]) return;
    const [wi, di] = k.replace('w', '').split('d').map(Number);
    if (PLAN[wi] && PLAN[wi].workouts[di]) km += PLAN[wi].workouts[di].km;
  });
  return km;
}

function renderAll() {
  renderDashboard();
  renderPlan();
  renderStats();
}

// ── DASHBOARD ──
function renderDashboard() {
  const wi        = currentWeekIndex();
  const doneCount = totalDone();
  const doneKm    = totalDoneKm();
  const pct       = Math.round((doneCount / 48) * 100);

  document.getElementById('s-week').textContent = wi + 1;
  document.getElementById('s-done').textContent = doneCount;
  document.getElementById('s-km').textContent   = doneKm;
  document.getElementById('prog-pct').textContent  = pct + '%';
  document.getElementById('prog-bar').style.width  = pct + '%';

  if (state.endDate) {
    const days = Math.max(0, Math.ceil((new Date(state.endDate) - new Date()) / (24 * 3600 * 1000)));
    document.getElementById('s-days').textContent = days;
  }

  // Event markers on progress bar
  const markers = document.getElementById('events-markers');
  markers.innerHTML = '';
  if (state.endDate) {
    const start = new Date(state.startDate);
    const end   = new Date(state.endDate);
    const total = end - start;
    state.events.forEach(ev => {
      if (!ev.date) return;
      const evDate = new Date(ev.date);
      const pctPos = Math.min(100, Math.max(0, ((evDate - start) / total) * 100));
      const m = document.createElement('div');
      m.className = 'event-marker';
      m.style.left = pctPos + '%';
      m.innerHTML = `<div class="event-marker-dot"></div><div class="event-marker-label">${ev.name}</div>`;
      markers.appendChild(m);
    });
  }

  // Current week workouts
  const week = PLAN[wi];
  document.getElementById('week-title').textContent = `ТИЖДЕНЬ ${wi + 1} — ${week.focus.toUpperCase()}`;
  const container = document.getElementById('current-workouts');
  container.innerHTML = '';
  const days = ['Тренування 1', 'Тренування 2', 'Тренування 3'];
  week.workouts.forEach((w, di) => {
    const key    = `w${wi}d${di}`;
    const isDone = !!state.done[key];
    const el     = document.createElement('div');
    el.className = 'workout-card' + (isDone ? ' done' : '');
    el.onclick   = () => toggleWorkout(wi, di);
    el.innerHTML = `
      <div class="workout-day">${days[di]}</div>
      <div class="workout-type-badge ${TYPE_CLASS[w.type]}">${TYPE_LABELS[w.type]}</div>
      <div class="workout-distance">${w.km} <span style="font-size:1rem;color:var(--text2)">км</span></div>
      <div class="workout-desc">${w.desc}</div>
    `;
    container.appendChild(el);
  });
}

// ── PLAN ──
function renderPlan() {
  const wi        = currentWeekIndex();
  const container = document.getElementById('all-weeks');
  container.innerHTML = '';

  PLAN.forEach((week, wIdx) => {
    const isCurrentWk = wIdx === wi;

    const weekEvents = state.events.filter(ev => {
      if (!ev.date || !state.startDate) return false;
      const start  = new Date(state.startDate);
      const evDate = new Date(ev.date);
      const evWeek = Math.floor((evDate - start) / (7 * 24 * 3600 * 1000));
      return evWeek === wIdx;
    });

    const doneInWeek = week.workouts.map((_, di) => !!state.done[`w${wIdx}d${di}`]);
    const totalKm    = week.workouts.reduce((s, w) => s + w.km, 0);

    const dateStr = state.startDate ? (() => {
      const d = new Date(state.startDate);
      d.setDate(d.getDate() + wIdx * 7);
      return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    })() : '';

    const dotsHtml = doneInWeek.map(d => `<div class="mini-dot${d ? ' done' : ''}"></div>`).join('');

    const block = document.createElement('div');
    block.className = 'week-block' + (isCurrentWk ? ' current-wk open' : '');
    block.id = 'wb-' + wIdx;
    block.innerHTML = `
      <div class="week-header" onclick="toggleWeek(${wIdx})">
        <div class="week-left">
          <div class="week-num">ТИЖД ${wIdx + 1}</div>
          <div>
            <div style="font-weight:600;font-size:14px">${week.focus}</div>
            <div class="week-focus">${dateStr}</div>
          </div>
        </div>
        <div class="week-right">
          <div class="week-km">${totalKm} км</div>
          <div class="week-progress-mini">${dotsHtml}</div>
          <div class="week-chevron">▼</div>
        </div>
      </div>
      <div class="week-body">
        ${weekEvents.map(e => `<div class="event-tag">🎯 ${e.name} — ${new Date(e.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}</div>`).join('')}
        <div class="week-workouts" id="ww-${wIdx}"></div>
      </div>
    `;
    container.appendChild(block);

    const days       = ['Тренування 1', 'Тренування 2', 'Тренування 3'];
    const wContainer = block.querySelector(`#ww-${wIdx}`);
    week.workouts.forEach((w, di) => {
      const key    = `w${wIdx}d${di}`;
      const isDone = !!state.done[key];
      const el     = document.createElement('div');
      el.className = 'workout-card' + (isDone ? ' done' : '');
      el.onclick   = () => toggleWorkout(wIdx, di);
      el.innerHTML = `
        <div class="workout-day">${days[di]}</div>
        <div class="workout-type-badge ${TYPE_CLASS[w.type]}">${TYPE_LABELS[w.type]}</div>
        <div class="workout-distance">${w.km} <span style="font-size:1rem;color:var(--text2)">км</span></div>
        <div class="workout-desc">${w.desc}</div>
      `;
      wContainer.appendChild(el);
    });
  });
}

// ── STATS ──
function renderStats() {
  const totalPlanKm = PLAN.reduce((s, w) => s + w.workouts.reduce((a, x) => a + x.km, 0), 0);
  const doneKm      = totalDoneKm();
  const doneCount   = totalDone();

  document.getElementById('sv-total').textContent    = totalPlanKm + ' км';
  document.getElementById('sv-done-km').textContent  = doneKm + ' км';
  document.getElementById('sv-workouts').textContent = `${doneCount} / 48`;

  // KM bar chart
  const chart = document.getElementById('kms-chart');
  chart.innerHTML = '';
  const maxKm = Math.max(...PLAN.map(w => w.workouts.reduce((s, x) => s + x.km, 0)));
  const wi    = currentWeekIndex();
  PLAN.forEach((week, wIdx) => {
    const weekKm = week.workouts.reduce((s, x) => s + x.km, 0);
    const pctH   = (weekKm / maxKm) * 100;
    const bar    = document.createElement('div');
    bar.className = 'kms-bar' + (wIdx < wi ? ' done-bar' : wIdx === wi ? ' current-bar' : '');
    bar.style.height = pctH + '%';
    bar.title = `Тиждень ${wIdx + 1}: ${weekKm} км`;
    chart.appendChild(bar);
  });

  // Type breakdown
  const types = { easy: 0, tempo: 0, long: 0, race: 0 };
  PLAN.forEach((w, wi) => w.workouts.forEach((wo, di) => {
    if (state.done[`w${wi}d${di}`]) types[wo.type] = (types[wo.type] || 0) + wo.km;
  }));
  const typeEl    = document.getElementById('type-breakdown');
  typeEl.innerHTML = '';
  const typeTotal = Object.values(types).reduce((a, b) => a + b, 0) || 1;
  Object.entries(types).forEach(([t, km]) => {
    const pct = Math.round(km / typeTotal * 100);
    typeEl.innerHTML += `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span class="${TYPE_CLASS[t]}">${TYPE_LABELS[t]}</span>
          <span style="color:var(--text2)">${km} км · ${pct}%</span>
        </div>
        <div style="height:6px;background:var(--surface2);border-radius:100px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:100px;transition:width 0.6s"></div>
        </div>
      </div>`;
  });
}

// ═══════════════════════════════════════
// INTERACTIONS
// ═══════════════════════════════════════
function toggleWorkout(wi, di) {
  const key = `w${wi}d${di}`;
  state.done[key] = !state.done[key];
  saveState();
  if (state.done[key]) {
    const km = PLAN[wi].workouts[di].km;
    showToast(`✅ +${km} км · Відмінно!`);
  }
  renderAll();
}

function toggleWeek(wIdx) {
  document.getElementById('wb-' + wIdx).classList.toggle('open');
}

function switchView(view) {
  ['dashboard', 'plan', 'stats'].forEach(v => {
    document.getElementById('view-' + v).style.display = v === view ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-tab').forEach((btn, i) => {
    btn.classList.toggle('active', ['dashboard', 'plan', 'stats'][i] === view);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function resetApp() {
  if (confirm('Скинути весь прогрес і налаштування?')) {
    localStorage.removeItem('runplan_v2');
    location.reload();
  }
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
window.onload = () => {
  const today = new Date();
  document.getElementById('start-date').value = today.toISOString().split('T')[0];
  const end = new Date(today);
  end.setDate(end.getDate() + 16 * 7);
  document.getElementById('end-date').value = end.toISOString().split('T')[0];

  if (loadState()) showApp();
};
