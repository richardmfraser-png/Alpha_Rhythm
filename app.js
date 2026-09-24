(() => {
  "use strict";
  const C = window.APP_CONFIG;
  const $ = (id) => document.getElementById(id);
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, "0");
  const isoDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parseDate = (s) => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
  const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const safe = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const defaultState = () => ({
    version: 1,
    profile: { name: "", instrument: "", mentor: "", startDate: isoDate(), weeks: C.program.defaultWeeks },
    settings: { targets: { ...C.program.defaultTargets }, includePrivateInCsv: false },
    goals: [],
    logs: {},
    weekly: {}
  });

  let state = loadState();
  let activeDate = isoDate();
  let activeView = "today";

  function loadState() {
    try {
      const raw = localStorage.getItem(C.storageKey);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...(parsed.profile || {}) },
        settings: {
          ...base.settings,
          ...(parsed.settings || {}),
          targets: { ...base.settings.targets, ...((parsed.settings || {}).targets || {}) }
        },
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        logs: parsed.logs || {},
        weekly: parsed.weekly || {}
      };
    } catch (e) {
      console.warn("Could not load saved data", e);
      return defaultState();
    }
  }
  function saveState() {
    localStorage.setItem(C.storageKey, JSON.stringify(state));
  }
  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.classList.remove("show"), 1800);
  }
  function ensureLog(dateKey) {
    if (!state.logs[dateKey]) {
      state.logs[dateKey] = {
        morningIntention: "",
        priorities: [0,1,2].map(() => ({ text: "", done: false })),
        habits: Object.fromEntries(C.habits.map(h => [h.id, { value: 0 }])),
        win: "", challenge: "", reflection: ""
      };
    }
    const log = state.logs[dateKey];
    if (!Array.isArray(log.priorities)) log.priorities = [0,1,2].map(() => ({text:"",done:false}));
    while (log.priorities.length < 3) log.priorities.push({text:"",done:false});
    log.habits = log.habits || {};
    C.habits.forEach(h => { if (!log.habits[h.id]) log.habits[h.id] = { value: 0 }; });
    return log;
  }
  function hasMeaningfulLog(log) {
    if (!log) return false;
    return Boolean(log.morningIntention || log.win || log.challenge || log.reflection ||
      log.priorities?.some(p => p.text || p.done) ||
      C.habits.some(h => num(log.habits?.[h.id]?.value) > 0));
  }
  function completionFor(log) {
    if (!log) return 0;
    const habitScores = C.habits.map(h => {
      const target = num(state.settings.targets[h.id]);
      if (target <= 0) return 1;
      return clamp(num(log.habits?.[h.id]?.value) / target, 0, 1);
    });
    const habitAvg = habitScores.length ? habitScores.reduce((a,b)=>a+b,0)/habitScores.length : 0;
    const priorities = (log.priorities || []).slice(0,3);
    const priorityAvg = priorities.length ? priorities.filter(p=>p.done).length/3 : 0;
    return Math.round((habitAvg * 0.7 + priorityAvg * 0.3) * 100);
  }
  function initials(name) {
    const parts = String(name || "Student").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0,2).map(x=>x[0]).join("").toUpperCase() || "ST";
  }
  function programDayInfo(dateKey) {
    const start = parseDate(state.profile.startDate || isoDate());
    const date = parseDate(dateKey);
    const diff = Math.floor((date - start) / 86400000) + 1;
    const total = Math.max(1, num(state.profile.weeks) * 7);
    return { day: diff, total, within: diff >= 1 && diff <= total };
  }
  function formatLongDate(dateKey) {
    return parseDate(dateKey).toLocaleDateString(undefined, { weekday:"long", month:"long", day:"numeric" });
  }
  function weekKey(dateKey = activeDate) {
    const d = parseDate(dateKey);
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((tmp - yearStart)/86400000)+1)/7);
    return `${tmp.getUTCFullYear()}-W${pad(weekNo)}`;
  }

  function renderBrand() {
    $("brandName").textContent = C.brand.appName;
    $("brandTagline").textContent = C.brand.tagline;
    document.title = C.brand.appName;
    $("profileInitials").textContent = initials(state.profile.name);
  }
  function renderToday() {
    const log = ensureLog(activeDate);
    const score = completionFor(log);
    const info = programDayInfo(activeDate);
    $("activeDate").value = activeDate;
    $("todayHeading").textContent = formatLongDate(activeDate);
    $("todaySubheading").textContent = activeDate === isoDate() ? "Show up. Do the work. Notice the progress." : "Review or update this day's record.";
    $("programDay").textContent = info.within ? `DAY ${info.day} OF ${info.total}` : (info.day < 1 ? "BEFORE SEMESTER START" : "AFTER PROGRAM WINDOW");
    $("todayScore").textContent = `${score}%`;
    qs(".score-ring").style.background = `conic-gradient(var(--accent) ${score*3.6}deg, #eadfbe 0deg)`;
    $("morningIntention").value = log.morningIntention || "";
    $("dailyWin").value = log.win || "";
    $("dailyChallenge").value = log.challenge || "";
    $("dailyReflection").value = log.reflection || "";
    renderPriorities(log);
    renderHabits(log);
  }
  function renderPriorities(log) {
    const wrap = $("priorityList");
    wrap.innerHTML = "";
    log.priorities.slice(0,3).forEach((p, idx) => {
      const row = document.createElement("div");
      row.className = "priority-row";
      row.innerHTML = `<input type="checkbox" aria-label="Mark deliverable ${idx+1} complete" ${p.done ? "checked" : ""}>
        <input type="text" aria-label="Deliverable ${idx+1}" placeholder="Deliverable ${idx+1}" value="${safe(p.text)}">`;
      const check = qs('input[type="checkbox"]', row);
      const input = qs('input[type="text"]', row);
      check.addEventListener("change", () => { p.done = check.checked; saveState(); renderTodayScoreOnly(); });
      input.addEventListener("input", () => { p.text = input.value; saveState(); });
      wrap.appendChild(row);
    });
    $("priorityCount").textContent = `${log.priorities.filter(p=>p.done).length} / 3`;
  }
  function renderHabits(log) {
    const wrap = $("habitGrid");
    wrap.innerHTML = "";
    C.habits.forEach(h => {
      const target = num(state.settings.targets[h.id]);
      const value = num(log.habits[h.id]?.value);
      const card = document.createElement("div");
      card.className = `habit-card ${target > 0 && value >= target ? "complete" : ""}`;
      card.innerHTML = `<div class="habit-title">${safe(h.label)}</div>
        <div class="habit-meta">Target: ${target} ${safe(h.unit)}</div>
        <div class="habit-input"><input type="number" min="0" step="5" value="${value}" aria-label="${safe(h.label)} minutes"><span>${safe(h.unit)}</span></div>`;
      const input = qs("input", card);
      input.addEventListener("input", () => {
        log.habits[h.id].value = Math.max(0, num(input.value));
        saveState();
        renderTodayScoreOnly();
        card.classList.toggle("complete", target > 0 && num(input.value) >= target);
      });
      wrap.appendChild(card);
    });
  }
  function renderTodayScoreOnly() {
    const log = ensureLog(activeDate);
    const score = completionFor(log);
    $("todayScore").textContent = `${score}%`;
    qs(".score-ring").style.background = `conic-gradient(var(--accent) ${score*3.6}deg, #eadfbe 0deg)`;
    $("priorityCount").textContent = `${log.priorities.filter(p=>p.done).length} / 3`;
  }

  function renderGoals() {
    const wrap = $("goalList");
    wrap.innerHTML = "";
    if (!state.goals.length) {
      wrap.innerHTML = `<div class="muted small">No goals yet. Add one for technique, performance, study, wellbeing or professional development.</div>`;
      return;
    }
    state.goals.forEach(goal => {
      const card = document.createElement("div");
      card.className = "goal-card";
      card.innerHTML = `<div class="goal-card-top"><div><div class="eyebrow">SEMESTER GOAL</div><h3>${safe(goal.title)}</h3></div>
        <div class="goal-actions"><button type="button" data-edit aria-label="Edit goal">Edit</button><button type="button" data-delete aria-label="Delete goal">Delete</button></div></div>
        <p class="muted">${safe(goal.why || "")}</p>
        <div class="goal-progress"><div class="progress-track"><div style="width:${clamp(num(goal.progress),0,100)}%"></div></div><input type="number" min="0" max="100" value="${clamp(num(goal.progress),0,100)}" aria-label="Goal progress percent"></div>`;
      const progress = qs('input[type="number"]', card);
      progress.addEventListener("change", () => { goal.progress = clamp(num(progress.value),0,100); saveState(); renderGoals(); });
      qs("[data-delete]", card).addEventListener("click", () => { if (confirm("Delete this goal?")) { state.goals = state.goals.filter(g=>g.id!==goal.id); saveState(); renderGoals(); }});
      qs("[data-edit]", card).addEventListener("click", () => editGoal(goal));
      wrap.appendChild(card);
    });
  }
  function editGoal(goal = null) {
    const title = prompt("Goal title", goal?.title || "");
    if (title === null || !title.trim()) return;
    const why = prompt("Why does this matter?", goal?.why || "") ?? "";
    if (goal) { goal.title = title.trim(); goal.why = why.trim(); }
    else state.goals.push({ id: `g${Date.now()}`, title: title.trim(), why: why.trim(), progress: 0 });
    saveState(); renderGoals();
  }

  function lastNDates(n, end = parseDate(activeDate)) {
    return Array.from({length:n}, (_,i)=>isoDate(addDays(end, i-(n-1))));
  }
  function calculateStreak() {
    let streak = 0;
    let d = parseDate(isoDate());
    for (let i=0;i<370;i++) {
      const key = isoDate(d);
      const log = state.logs[key];
      if (log && hasMeaningfulLog(log) && completionFor(log) >= C.program.completionThreshold) { streak++; d = addDays(d,-1); }
      else break;
    }
    return streak;
  }
  function renderProgress() {
    const dates = lastNDates(7, parseDate(isoDate()));
    const scores = dates.map(k => hasMeaningfulLog(state.logs[k]) ? completionFor(state.logs[k]) : 0);
    const logged = dates.filter(k=>hasMeaningfulLog(state.logs[k])).length;
    const avg = logged ? Math.round(dates.reduce((sum,k)=>sum+(hasMeaningfulLog(state.logs[k])?completionFor(state.logs[k]):0),0)/logged) : 0;
    const practice = dates.reduce((sum,k)=>sum+num(state.logs[k]?.habits?.practice?.value),0);
    $("statAvg").textContent = `${avg}%`;
    $("statStreak").textContent = calculateStreak();
    $("statPractice").textContent = practice;
    $("statLogged").textContent = logged;
    const chart = $("sevenDayChart"); chart.innerHTML = "";
    dates.forEach((k,i)=>{
      const d = parseDate(k); const val = scores[i];
      const col = document.createElement("div"); col.className = "bar-col";
      col.innerHTML = `<div class="bar-space"><div class="bar" style="height:${Math.max(4,val)}%" title="${val}%"></div></div><div class="bar-value">${val}%</div><div class="bar-label">${d.toLocaleDateString(undefined,{weekday:"short"}).slice(0,2)}</div>`;
      chart.appendChild(col);
    });
    renderSemesterTotals();
  }
  function renderSemesterTotals() {
    const start = parseDate(state.profile.startDate || isoDate());
    const totalDays = Math.max(1, num(state.profile.weeks)*7);
    const end = addDays(start, totalDays-1);
    const entries = Object.entries(state.logs).filter(([k,log]) => {
      const d = parseDate(k); return d >= start && d <= end && hasMeaningfulLog(log);
    });
    const totals = Object.fromEntries(C.habits.map(h=>[h.id,0]));
    let completionSum = 0;
    entries.forEach(([_,log]) => { completionSum += completionFor(log); C.habits.forEach(h=>totals[h.id]+=num(log.habits?.[h.id]?.value)); });
    const avg = entries.length ? Math.round(completionSum/entries.length) : 0;
    const rows = [
      ["Days logged", `${entries.length} / ${totalDays}`],
      ["Average completion on logged days", `${avg}%`],
      ...C.habits.map(h => [h.label, `${totals[h.id]} ${h.unit}`])
    ];
    $("semesterTotals").innerHTML = rows.map(([a,b])=>`<div class="total-row"><span>${safe(a)}</span><strong>${safe(b)}</strong></div>`).join("");
  }

  function weeklyDates() {
    const end = parseDate(activeDate);
    const day = end.getDay() || 7;
    const monday = addDays(end, 1-day);
    return Array.from({length:7},(_,i)=>isoDate(addDays(monday,i)));
  }
  function renderWeekly() {
    const key = weekKey(activeDate);
    const saved = state.weekly[key] || { focus:"", reflection:"", nextWeek:"" };
    $("weeklyFocus").value = saved.focus || "";
    $("weeklyReflection").value = saved.reflection || "";
    $("nextWeekFocus").value = saved.nextWeek || "";
    $("mentorSummary").textContent = mentorSummaryText();
  }
  function mentorSummaryText() {
    const dates = weeklyDates();
    const logs = dates.map(k=>[k,state.logs[k]]).filter(([_,l])=>hasMeaningfulLog(l));
    const avg = logs.length ? Math.round(logs.reduce((s,[_,l])=>s+completionFor(l),0)/logs.length) : 0;
    const totals = Object.fromEntries(C.habits.map(h=>[h.id,0]));
    let completedPriorities = 0;
    logs.forEach(([_,l])=> { C.habits.forEach(h=>totals[h.id]+=num(l.habits?.[h.id]?.value)); completedPriorities += (l.priorities||[]).filter(p=>p.done).length; });
    const wk = state.weekly[weekKey(activeDate)] || {};
    const startLabel = parseDate(dates[0]).toLocaleDateString(undefined,{month:"short",day:"numeric"});
    const endLabel = parseDate(dates[6]).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
    return `${C.brand.appName} - Weekly Mentor Summary\n${startLabel} - ${endLabel}\n\nStudent: ${state.profile.name || "Not set"}\nInstrument / pathway: ${state.profile.instrument || "Not set"}\nMentor: ${state.profile.mentor || "Not set"}\n\nConsistency\n- Days logged: ${logs.length} / 7\n- Average completion on logged days: ${avg}%\n- Daily deliverables completed: ${completedPriorities}\n${C.habits.map(h=>`- ${h.label}: ${totals[h.id]} ${h.unit}`).join("\n")}\n\nStudent weekly check-in\n- Main focus: ${wk.focus || "Not entered"}\n- Habit learning: ${wk.reflection || "Not entered"}\n- Adjustment for next week: ${wk.nextWeek || "Not entered"}\n\nPrivate daily reflections are not included.`;
  }

  function renderSettings() {
    $("profileName").value = state.profile.name || "";
    $("profileInstrument").value = state.profile.instrument || "";
    $("profileMentor").value = state.profile.mentor || "";
    $("profileStart").value = state.profile.startDate || isoDate();
    $("profileWeeks").value = state.profile.weeks || C.program.defaultWeeks;
    $("includePrivate").checked = !!state.settings.includePrivateInCsv;
    const wrap = $("targetSettings"); wrap.innerHTML = "";
    C.habits.forEach(h => {
      const div = document.createElement("div");
      div.innerHTML = `<label for="target-${safe(h.id)}">${safe(h.label)} (${safe(h.unit)})</label><input id="target-${safe(h.id)}" data-target-id="${safe(h.id)}" type="number" min="0" max="600" value="${num(state.settings.targets[h.id])}">`;
      wrap.appendChild(div);
    });
  }

  function showView(view) {
    activeView = view;
    qsa(".view").forEach(v => v.classList.toggle("active", v.dataset.view === view));
    qsa(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.target === view));
    if (view === "today") renderToday();
    if (view === "goals") renderGoals();
    if (view === "progress") renderProgress();
    if (view === "weekly") renderWeekly();
    if (view === "settings") renderSettings();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function downloadBlob(filename, text, type="text/plain") {
    const blob = new Blob([text], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),500);
  }
  function exportCsv() {
    const header = ["date","completion_percent","priorities_completed",...C.habits.map(h=>`${h.id}_${h.unit}`),"morning_intention","win","challenge"];
    if (state.settings.includePrivateInCsv) header.push("private_reflection");
    const esc = (v) => `"${String(v ?? "").replace(/"/g,'""')}"`;
    const rows = [header.map(esc).join(",")];
    Object.keys(state.logs).sort().forEach(k=>{
      const l = state.logs[k]; if (!hasMeaningfulLog(l)) return;
      const row = [k, completionFor(l), (l.priorities||[]).filter(p=>p.done).length, ...C.habits.map(h=>num(l.habits?.[h.id]?.value)), l.morningIntention, l.win, l.challenge];
      if (state.settings.includePrivateInCsv) row.push(l.reflection);
      rows.push(row.map(esc).join(","));
    });
    downloadBlob(`alpha-rhythm-${state.profile.name || "student"}.csv`, rows.join("\n"), "text/csv");
  }
  function exportJson() {
    downloadBlob(`alpha-rhythm-backup-${isoDate()}.json`, JSON.stringify(state,null,2), "application/json");
  }

  function bindInputs() {
    $("morningIntention").addEventListener("input", e=>{ ensureLog(activeDate).morningIntention=e.target.value; saveState(); });
    $("dailyWin").addEventListener("input", e=>{ ensureLog(activeDate).win=e.target.value; saveState(); });
    $("dailyChallenge").addEventListener("input", e=>{ ensureLog(activeDate).challenge=e.target.value; saveState(); });
    $("dailyReflection").addEventListener("input", e=>{ ensureLog(activeDate).reflection=e.target.value; saveState(); });
    $("activeDate").addEventListener("change", e=>{ activeDate=e.target.value||isoDate(); renderToday(); });
    $("prevDay").addEventListener("click", ()=>{ activeDate=isoDate(addDays(parseDate(activeDate),-1)); renderToday(); });
    $("nextDay").addEventListener("click", ()=>{ activeDate=isoDate(addDays(parseDate(activeDate),1)); renderToday(); });
    $("resetTargetsLink").addEventListener("click", ()=>showView("settings"));
    $("profileButton").addEventListener("click", ()=>showView("settings"));
    qsa(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.target)));
    $("addGoal").addEventListener("click", ()=>editGoal());
    $("saveWeekly").addEventListener("click", ()=>{
      state.weekly[weekKey(activeDate)] = { focus: $("weeklyFocus").value.trim(), reflection: $("weeklyReflection").value.trim(), nextWeek: $("nextWeekFocus").value.trim() };
      saveState(); renderWeekly(); toast("Weekly check-in saved");
    });
    $("copySummary").addEventListener("click", async ()=>{
      const text = mentorSummaryText();
      try { await navigator.clipboard.writeText(text); toast("Summary copied"); }
      catch { downloadBlob("alpha-rhythm-summary.txt",text); toast("Downloaded summary instead"); }
    });
    $("downloadSummary").addEventListener("click", ()=>downloadBlob(`alpha-rhythm-weekly-summary-${weekKey(activeDate)}.txt`, mentorSummaryText()));
    $("saveProfile").addEventListener("click", ()=>{
      state.profile.name=$("profileName").value.trim(); state.profile.instrument=$("profileInstrument").value.trim(); state.profile.mentor=$("profileMentor").value.trim(); state.profile.startDate=$("profileStart").value||isoDate(); state.profile.weeks=clamp(num($("profileWeeks").value)||C.program.defaultWeeks,1,52); saveState(); renderBrand(); toast("Profile saved");
    });
    $("saveTargets").addEventListener("click", ()=>{
      qsa("[data-target-id]").forEach(i=>state.settings.targets[i.dataset.targetId]=clamp(num(i.value),0,600)); saveState(); toast("Targets saved");
    });
    $("includePrivate").addEventListener("change", e=>{ state.settings.includePrivateInCsv=e.target.checked; saveState(); });
    $("exportCsv").addEventListener("click", exportCsv);
    $("exportJson").addEventListener("click", exportJson);
    $("importJson").addEventListener("change", e=>{
      const f=e.target.files?.[0]; if(!f) return; const reader=new FileReader(); reader.onload=()=>{ try { const parsed=JSON.parse(reader.result); state={...defaultState(),...parsed}; saveState(); renderAll(); toast("Backup restored"); } catch { alert("That file is not a valid Alpha Rhythm backup."); } }; reader.readAsText(f); e.target.value="";
    });
    $("clearData").addEventListener("click", ()=>{
      if(confirm("Clear all Alpha Rhythm data on this device? This cannot be undone.")) { localStorage.removeItem(C.storageKey); state=defaultState(); activeDate=isoDate(); renderAll(); openOnboarding(); }
    });
  }

  function openOnboarding() {
    $("onboardStart").value = state.profile.startDate || isoDate();
    if (typeof $("onboardingDialog").showModal === "function") $("onboardingDialog").showModal();
  }
  function bindOnboarding() {
    $("onboardingForm").addEventListener("submit", e=>{
      e.preventDefault();
      const name=$("onboardName").value.trim(); if(!name) return;
      state.profile.name=name; state.profile.instrument=$("onboardInstrument").value.trim(); state.profile.startDate=$("onboardStart").value||isoDate(); saveState();
      $("onboardingDialog").close(); renderAll(); toast("Welcome to Alpha Rhythm");
    });
  }
  function renderAll() { renderBrand(); renderToday(); renderGoals(); renderProgress(); renderWeekly(); renderSettings(); }
  function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("service-worker.js").catch(()=>{});
  }
  function init() {
    bindInputs(); bindOnboarding(); renderAll(); registerServiceWorker();
    if (!state.profile.name) openOnboarding();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
