/* Leonida Trophy Ledger — app logic.
   Plain script, no modules, no network: loads data/trophies.json once,
   keeps progress in localStorage, renders four views. */
'use strict';

const STORE_KEY = 'leonida-trophy-ledger-v1';
const KINDS = ['all', 'story', 'activities', 'collectibles', 'side', 'completion', 'platinum'];
const KIND_LABEL = { story: 'Story', activities: 'Activities', collectibles: 'Collectibles', side: 'Side stories', completion: 'Completion', platinum: 'Platinum' };
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

let DATA = null;
let TROPHIES = [];
let byId = new Map();
let state = loadState();
let selectedId = null;
let activeView = 'ledger';
let kindFilter = 'all';

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        earned: new Set(p.earned || []),
        counters: p.counters || {},
        revealed: new Set(p.revealed || []),
        spoilersHidden: !!p.spoilersHidden,
      };
    }
  } catch (e) { /* fall through to a fresh state */ }
  return { earned: new Set(), counters: {}, revealed: new Set(), spoilersHidden: false };
}

function saveState() {
  const payload = {
    earned: [...state.earned],
    counters: state.counters,
    revealed: [...state.revealed],
    spoilersHidden: state.spoilersHidden,
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(payload));
  const note = document.getElementById('saved-note');
  if (note) note.textContent = 'Saved in this browser · ' + new Date().toLocaleTimeString();
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtNum(n) { return n.toLocaleString('en-US'); }
function srcBadges(list) {
  return (list || []).map((n) => '<span class="src">[' + n + ']</span>').join(' ');
}
function citeText(text) {
  // Turn trailing [n] markers in guide prose into styled citation badges.
  return esc(text).replace(/\[(\d)\]/g, '<span class="src">[$1]</span>');
}
function isCovered(t) {
  return state.spoilersHidden && t.hidden && !state.earned.has(t.id) && !state.revealed.has(t.id);
}
function guideSourcesOf(t) {
  const s = new Set();
  (t.steps || []).forEach((st) => (st.src || []).forEach((n) => { if (n > 2) s.add(n); }));
  return s;
}
function isSingleSource(t) { return guideSourcesOf(t).size <= 1; }
function audit() {
  const g = (grade) => TROPHIES.filter((t) => t.grade === grade).length;
  const totalSteps = TROPHIES.reduce((a, t) => a + t.steps.length, 0);
  const citedSteps = TROPHIES.reduce((a, t) => a + t.steps.filter((s) => s.src && s.src.length).length, 0);
  return {
    total: TROPHIES.length,
    platinum: g('platinum'), gold: g('gold'), silver: g('silver'), bronze: g('bronze'),
    hidden: TROPHIES.filter((t) => t.hidden).length,
    guidesCited: TROPHIES.filter((t) => t.sources && t.sources.length).length,
    stepsCited: citedSteps, totalSteps,
    sources: DATA.sources.length,
    confirmed: TROPHIES.filter((t) => t.missable === 'missable').length,
    possibly: TROPHIES.filter((t) => t.missable === 'possibly-missable').length,
    watch: TROPHIES.filter((t) => t.missable === 'watch').length,
    unconfirmed: TROPHIES.filter((t) => t.unconfirmed).length,
    disagreements: TROPHIES.filter((t) => t.disagreement).length,
    singleSource: TROPHIES.filter(isSingleSource).length,
  };
}

/* ---------- header ---------- */
function renderHeader() {
  const earned = state.earned.size;
  document.getElementById('earned-count').textContent = earned;
  document.getElementById('progress-fill').style.width = (earned / TROPHIES.length * 100) + '%';
  const chips = ['platinum', 'gold', 'silver', 'bronze'].map((gr) => {
    const total = TROPHIES.filter((t) => t.grade === gr).length;
    const got = TROPHIES.filter((t) => t.grade === gr && state.earned.has(t.id)).length;
    return '<span class="gchip"><b>' + got + '</b>/' + total + ' ' + gr + '</span>';
  }).join('');
  document.getElementById('grade-chips').innerHTML = chips;
  const a = audit();
  const items = [
    [a.total, 'official trophies'],
    [a.platinum + 'P · ' + a.gold + 'G · ' + a.silver + 'S · ' + a.bronze + 'B', 'grade split'],
    [a.hidden, 'hidden'],
    [a.guidesCited + '/' + a.total, 'guides citing a source'],
    [a.stepsCited + '/' + a.totalSteps, 'steps cited'],
    [a.sources, 'sources read ' + DATA.sourcesRead],
    [a.confirmed, 'confirmed missable'],
    [a.possibly, 'possibly missable'],
    [a.watch, 'watch'],
    [a.unconfirmed, 'unconfirmed'],
    [a.singleSource, 'single-source'],
    [a.disagreements, 'disagreements shown'],
  ];
  document.getElementById('audit-strip').innerHTML = items.map(([v, l]) =>
    '<span class="a-item"><b>' + esc(v) + '</b> <span class="a-label">' + esc(l) + '</span></span>').join('');
  document.getElementById('spoiler-btn').textContent = state.spoilersHidden ? 'Hidden' : 'Shown';
}

/* ---------- ledger ---------- */
function renderKindChips() {
  const wrap = document.getElementById('kind-chips');
  wrap.innerHTML = KINDS.map((k) => {
    const list = k === 'all' ? TROPHIES : TROPHIES.filter((t) => t.kind === k);
    const got = list.filter((t) => state.earned.has(t.id)).length;
    const label = k === 'all' ? 'All' : KIND_LABEL[k];
    return '<button class="kchip' + (kindFilter === k ? ' active' : '') + '" data-kind="' + k + '">' +
      esc(label) + ' <span class="n">' + got + '/' + list.length + '</span></button>';
  }).join('');
  wrap.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    kindFilter = b.dataset.kind; renderLedger();
  }));
}

function filteredTrophies() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const grade = document.getElementById('grade-select').value;
  const status = document.getElementById('status-select').value;
  const missOnly = document.getElementById('missable-only').checked;
  const unOnly = document.getElementById('unearned-only').checked;
  return TROPHIES.filter((t) => {
    if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
    if (grade && t.grade !== grade) return false;
    if (status === 'earned' && !state.earned.has(t.id)) return false;
    if (status === 'open' && state.earned.has(t.id)) return false;
    if (unOnly && state.earned.has(t.id)) return false;
    if (missOnly && t.missable === 'safe') return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.kind).toLowerCase();
      if (!isCovered(t) && !hay.includes(q)) return false;
      if (isCovered(t) && !('hidden trophy').includes(q)) return false;
    }
    return true;
  }).sort((a, b) => (a.stage - b.stage) || (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id));
}

function flagHtml(t) {
  let out = '';
  if (t.missable === 'possibly-missable') out += '<span class="flag possibly-missable">Possibly missable</span>';
  if (t.missable === 'missable') out += '<span class="flag missable">Missable</span>';
  if (t.missable === 'watch') out += '<span class="flag watch">Watch</span>';
  if (t.unconfirmed) out += '<span class="flag unconfirmed">Unconfirmed</span>';
  return out;
}

function renderRows() {
  const list = filteredTrophies();
  document.getElementById('list-count').textContent = 'Showing ' + list.length + ' of ' + TROPHIES.length;
  const wrap = document.getElementById('trophy-rows');
  wrap.innerHTML = list.map((t) => {
    const covered = isCovered(t);
    const cited = t.steps.filter((s) => s.src && s.src.length).length;
    const name = covered
      ? '<span class="covered-name">Hidden trophy</span>'
      : '<span class="tname">' + esc(t.name) + '</span>';
    const desc = covered
      ? '<span class="tdesc">Stage ' + t.stage + ' · ' + esc(KIND_LABEL[t.kind] || t.kind) + ' · covered by the spoiler shield</span>'
      : '<span class="tdesc">' + esc(t.description) + '</span>';
    return '<div class="trow' + (state.earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + '" data-id="' + t.id + '">' +
      '<input type="checkbox" data-earn="' + t.id + '"' + (state.earned.has(t.id) ? ' checked' : '') + ' aria-label="Mark earned">' +
      '<span class="grade ' + t.grade + '">' + t.grade + '</span>' +
      '<span>' + name + '<br>' + desc + '</span>' +
      '<span class="tmeta">' + flagHtml(t) + ' <span title="Steps citing a source">' + cited + '/' + t.steps.length + ' cited</span></span>' +
      '</div>';
  }).join('');
  wrap.querySelectorAll('.trow').forEach((row) => {
    row.addEventListener('click', (ev) => {
      if (ev.target.matches('input[type="checkbox"]')) return;
      selectedId = Number(row.dataset.id); renderLedger();
    });
  });
  wrap.querySelectorAll('input[data-earn]').forEach((box) => {
    box.addEventListener('change', () => { toggleEarned(Number(box.dataset.earn)); });
  });
  // next up: first unearned trophies in roadmap order
  const next = TROPHIES.filter((t) => !state.earned.has(t.id))
    .sort((a, b) => (a.stage - b.stage) || (a.id - b.id)).slice(0, 3);
  document.getElementById('next-up').innerHTML = next.length
    ? '<b>Next up:</b> ' + next.map((t) => isCovered(t) ? 'Hidden trophy (Stage ' + t.stage + ')' : esc(t.name)).join(' · ')
    : '<b>All 55 earned.</b> The platinum is yours.';
}

function counterHtml(t) {
  if (!t.target) return '';
  const val = Math.min(state.counters[t.id] || 0, t.target);
  const pct = Math.round(val / t.target * 100);
  const step = t.target >= 100000 ? 5000 : 1;
  return '<div class="counter-box"><span><b>Progress counter</b> — ' + esc(t.unit) + '</span>' +
    '<button class="cbtn" data-cminus="' + t.id + '" aria-label="Decrease">−</button>' +
    '<span class="cval">' + fmtNum(val) + ' / ' + fmtNum(t.target) + '</span>' +
    '<button class="cbtn" data-cplus="' + t.id + '" data-step="' + step + '" aria-label="Increase">+</button>' +
    '<span class="counter-bar"><div style="width:' + pct + '%"></div></span><span>' + pct + '%</span></div>';
}

function renderDetail() {
  const panel = document.getElementById('detail-panel');
  const t = byId.get(selectedId) || TROPHIES[0];
  if (!t) { panel.innerHTML = ''; return; }
  selectedId = t.id;
  const covered = isCovered(t);
  if (covered) {
    panel.innerHTML = '<div class="detail-head"><span class="grade ' + t.grade + '">' + t.grade + '</span>' +
      '<h2>Hidden trophy</h2></div>' +
      '<p>This story trophy is covered by your spoiler shield. It sits in <b>Stage ' + t.stage + '</b> (' +
      esc(DATA.stages[t.stage - 1].name) + '), kind <b>' + esc(KIND_LABEL[t.kind] || t.kind) + '</b>.</p>' +
      '<p>Earn it in the game and mark it here, or reveal it by hand — revealing is saved with your progress.</p>' +
      '<button class="earn-btn" id="reveal-btn">Reveal this trophy</button>';
    document.getElementById('reveal-btn').addEventListener('click', () => {
      state.revealed.add(t.id); saveState(); renderAll();
    });
    return;
  }
  const earned = state.earned.has(t.id);
  let html = '<div class="detail-head"><span class="grade ' + t.grade + '">' + t.grade + '</span>' +
    '<h2>' + esc(t.name) + '</h2>' +
    '<button class="earn-btn' + (earned ? ' earned' : '') + '" id="earn-btn">' + (earned ? 'Earned ✓ — undo' : 'Mark earned') + '</button></div>';
  html += '<div class="detail-flags">' + flagHtml(t) +
    '<span class="flag">Stage ' + t.stage + '</span><span class="flag">' + esc(KIND_LABEL[t.kind] || t.kind) + '</span>' +
    (t.hidden ? '<span class="flag">Hidden on PSN</span>' : '') + '</div>';
  html += '<div class="official"><span class="off-label">Official description</span>' + esc(t.description) + '</div>';
  html += '<p class="in-short"><b>In short:</b> ' + citeText(t.summary) + '</p>';
  if (t.missable === 'possibly-missable' || t.missable === 'missable') {
    html += '<div class="callout"><h3>' + (t.missable === 'missable' ? 'Missable — read before you play' : 'Possibly missable — sources disagree') + '</h3><p>' +
      (t.disagreement ? citeText(t.disagreement) : 'This trophy can be missed; follow the flagged step before the window closes.') + '</p></div>';
  } else if (t.disagreement) {
    html += '<div class="callout"><h3>Sources disagree</h3><p>' + citeText(t.disagreement) + '</p></div>';
  }
  if (t.unconfirmed) {
    html += '<div class="callout"><h3>Unconfirmed</h3><p>' + citeText(t.unconfirmed) + '</p></div>';
  }
  html += '<h3 class="serif">The guide, step by step</h3><ol class="steps">' +
    t.steps.map((s) => '<li>' + citeText(s.text) + '</li>').join('') + '</ol>';
  html += counterHtml(t);
  if (t.deeper) html += '<div class="deeper"><h3>Going deeper</h3><p>' + citeText(t.deeper) + '</p></div>';
  html += '<p class="src-line" style="margin-top:10px;color:var(--muted);font-size:12.5px">Sources for this guide: ' +
    t.sources.map((n) => { const s = DATA.sources[n - 1]; return '[' + n + '] ' + esc(s.name); }).join(' · ') + '</p>';
  panel.innerHTML = html;
  document.getElementById('earn-btn').addEventListener('click', () => toggleEarned(t.id));
  const minus = panel.querySelector('[data-cminus]');
  const plus = panel.querySelector('[data-cplus]');
  if (minus) minus.addEventListener('click', () => bumpCounter(t, -1));
  if (plus) plus.addEventListener('click', () => bumpCounter(t, 1));
}

function bumpCounter(t, direction) {
  const step = t.target >= 100000 ? 5000 : 1;
  const cur = state.counters[t.id] || 0;
  const next = Math.max(0, Math.min(t.target, cur + direction * step));
  state.counters[t.id] = next;
  if (next >= t.target) state.earned.add(t.id);
  saveState(); renderAll();
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id); else state.earned.add(id);
  saveState(); renderAll();
}

function renderSourcesColumn() {
  const wrap = document.getElementById('sources-column');
  const counts = DATA.sources.map((s) => TROPHIES.filter((t) => t.sources.includes(s.n)).length);
  wrap.innerHTML = '<h2>Sources</h2>' + DATA.sources.map((s, i) =>
    '<div class="source-item"><span class="snum">' + s.n + '</span><b>' + esc(s.name) + '</b>' +
    '<span class="sloc">' + esc(s.locator) + '</span>' +
    '<span class="smeta">Read ' + esc(s.read) + ' · ' + esc(s.scope) + ' · cited by ' + counts[i] + ' of 55 guides</span></div>').join('');
}

function renderLedger() { renderKindChips(); renderRows(); renderDetail(); renderSourcesColumn(); }

/* ---------- roadmap ---------- */
function renderRoadmap() {
  const wrap = document.getElementById('stages');
  wrap.innerHTML = DATA.stages.map((st) => {
    const list = TROPHIES.filter((t) => t.stage === st.n);
    const got = list.filter((t) => state.earned.has(t.id)).length;
    const pct = list.length ? Math.round(got / list.length * 100) : 0;
    return '<div class="panel stage"><div class="stage-head"><h3>Stage ' + st.n + ' — ' + esc(st.name) + '</h3>' +
      '<span class="stage-hours">~' + st.hours + ' h</span><span class="stage-count">' + got + '/' + list.length + ' earned</span></div>' +
      '<div class="stage-bar"><div style="width:' + pct + '%"></div></div>' +
      '<p class="stage-note">' + citeText(st.note) + '</p>' +
      '<div class="tchips">' + list.map((t) => {
        const flagged = t.missable !== 'safe' || t.unconfirmed;
        const label = isCovered(t) ? 'Hidden trophy' : t.name;
        return '<button class="tchip' + (state.earned.has(t.id) ? ' earned' : '') + (flagged ? ' flagged' : '') + '" data-chip="' + t.id + '">' + esc(label) + '</button>';
      }).join('') + '</div></div>';
  }).join('');
  wrap.querySelectorAll('[data-chip]').forEach((c) => c.addEventListener('click', () => {
    selectedId = Number(c.dataset.chip); switchView('ledger');
  }));
  const flagged = TROPHIES.filter((t) => t.missable !== 'safe');
  document.getElementById('watch-panel').innerHTML = '<h2>Missable watch-list</h2>' + flagged.map((t) =>
    '<div class="watch-item"><b>' + esc(t.name) + '</b>' + flagHtml(t) + '<br>' + citeText(watchReason(t)) + '</div>').join('');
  document.getElementById('rules-panel').innerHTML = '<h2>Ground rules</h2><ul class="rules-list">' +
    DATA.groundRules.map((r) => '<li>' + citeText(r) + '</li>').join('') + '</ul>';
  document.getElementById('method-panel').innerHTML = '<h2>How this roadmap was built</h2>' +
    '<p>The stages group the trophies by what their official descriptions ask for: the ones naming a mission or chapter come first, the ones counting a collection or an activity fill the long checklist stage, and the named side-story finales — absent from the 100% checklist — close the run. Hour estimates follow the published roadmaps\u2019 stage splits, and every claim above carries the sources it rests on.</p>';
}
function watchReason(t) {
  if (t.name === 'Positive Mental Attitude') return 'Lucia\u2019s Chapter 1 balcony meditation may count toward the 18 and vanishes after Chapter 1; whether it is strictly required is unconfirmed [3][4][7].';
  if (t.name === 'Strangers & Freaks') return 'One counting strand, Yago\u2019s, includes the time-sensitive Race Against Yago in Chapter 3 — run it when it appears [4].';
  if (t.name === 'This Was No Boat Accident') return 'Kenton becomes temporarily unavailable mid-story; his line returns later, so the gap is a pause, not a lockout [3].';
  return t.summary;
}

/* ---------- matrix ---------- */
function renderMatrix() {
  const a = audit();
  const on3 = TROPHIES.filter((t) => guideSourcesOf(t).size >= 3).length;
  const on2 = TROPHIES.filter((t) => guideSourcesOf(t).size === 2).length;
  const on1 = TROPHIES.filter((t) => guideSourcesOf(t).size <= 1).length;
  document.getElementById('matrix-summary').innerHTML =
    'Guides resting on <b>3+</b> guide sources: <b>' + on3 + '</b> · on <b>2</b>: <b>' + on2 + '</b> · on <b>1</b>: <b>' + on1 + '</b> · ' +
    ' disagreements flagged: <b>' + a.disagreements + '</b> · unconfirmed: <b>' + a.unconfirmed + '</b>. (The two official lists, sources 1–2, back every trophy\u2019s name, description and grade.)';
  const head = '<tr><th class="name">Trophy</th>' + DATA.sources.map((s) => '<th title="' + esc(s.name) + '">[' + s.n + ']</th>').join('') + '<th>Flags</th></tr>';
  const rows = TROPHIES.map((t) => {
    const cells = DATA.sources.map((s) => {
      const n = t.steps.filter((st) => (st.src || []).includes(s.n)).length;
      if (n > 0) return '<td class="hit">' + n + '</td>';
      if (t.sources.includes(s.n)) return '<td class="dot">·</td>';
      return '<td></td>';
    }).join('');
    let flags = '';
    if (isSingleSource(t)) flags += '<span class="flag unconfirmed">Single-source</span> ';
    if (t.disagreement) flags += '<span class="flag watch">Disagreement</span> ';
    if (t.unconfirmed) flags += '<span class="flag unconfirmed">Unconfirmed</span> ';
    const name = isCovered(t) ? '<i>Hidden trophy</i>' : esc(t.name);
    return '<tr><td class="name">' + name + '</td>' + cells + '<td>' + flags + '</td></tr>';
  }).join('');
  document.getElementById('matrix-table').innerHTML = head + rows;
}

/* ---------- save view ---------- */
function exportPayload() {
  return JSON.stringify({
    app: 'leonida-trophy-ledger',
    version: 1,
    earned: [...state.earned].sort((a, b) => a - b),
    counters: state.counters,
    revealed: [...state.revealed].sort((a, b) => a - b),
    spoilersHidden: state.spoilersHidden,
  }, null, 2);
}
function renderSave() {
  document.getElementById('export-text').value = exportPayload();
  const countersInProgress = TROPHIES.filter((t) => t.target && (state.counters[t.id] || 0) > 0 && (state.counters[t.id] || 0) < t.target).length;
  const coveredCount = TROPHIES.filter((t) => isCovered(t)).length;
  const kindRows = KINDS.slice(1).map((k) => {
    const list = TROPHIES.filter((t) => t.kind === k);
    const got = list.filter((t) => state.earned.has(t.id)).length;
    return '<tr><td>Earned — ' + esc(KIND_LABEL[k]) + '</td><td>' + got + ' / ' + list.length + '</td></tr>';
  }).join('');
  document.getElementById('state-breakdown').innerHTML = '<table class="state-table">' +
    '<tr><td>Earned total</td><td>' + state.earned.size + ' / 55</td></tr>' +
    '<tr><td>Counters in progress</td><td>' + countersInProgress + '</td></tr>' +
    '<tr><td>Revealed by hand</td><td>' + state.revealed.size + '</td></tr>' +
    '<tr><td>Still covered by the spoiler shield</td><td>' + coveredCount + '</td></tr>' + kindRows + '</table>';
  document.getElementById('spoiler-explainer').textContent = state.spoilersHidden
    ? 'The spoiler shield is ON: the ' + TROPHIES.filter((t) => t.hidden).length + ' trophies PlayStation lists as hidden stay covered — name and description replaced — until you earn or reveal each one. The setting is saved in this browser and travels with your export.'
    : 'The spoiler shield is OFF: hidden trophies show their real names and descriptions. Turn it on from the Spoilers toggle in the header to cover the ' + TROPHIES.filter((t) => t.hidden).length + ' hidden trophies until they are earned or revealed.';
}
function doImport() {
  const confirm = document.getElementById('import-confirm');
  const file = document.getElementById('import-file').files[0];
  const finish = (text) => {
    try {
      const p = JSON.parse(text);
      if (!Array.isArray(p.earned)) throw new Error('no earned list');
      state.earned = new Set(p.earned.filter((n) => byId.has(n)));
      state.counters = {};
      Object.entries(p.counters || {}).forEach(([k, v]) => { if (byId.has(Number(k))) state.counters[k] = Math.max(0, Number(v) || 0); });
      state.revealed = new Set((p.revealed || []).filter((n) => byId.has(n)));
      state.spoilersHidden = !!p.spoilersHidden;
      saveState(); renderAll();
      confirm.textContent = 'Imported: ' + state.earned.size + ' earned, ' + Object.keys(state.counters).length + ' counters, ' + state.revealed.size + ' revealed.';
    } catch (e) {
      confirm.textContent = 'Import failed: that text is not a Leonida Trophy Ledger export.';
    }
  };
  if (file) { const r = new FileReader(); r.onload = () => finish(String(r.result)); r.readAsText(file); }
  else finish(document.getElementById('import-text').value);
}

/* ---------- view switching / wiring ---------- */
function switchView(name) {
  activeView = name;
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  document.querySelectorAll('#view-tabs button[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'roadmap') renderRoadmap();
  if (name === 'matrix') renderMatrix();
  if (name === 'save') renderSave();
  if (name === 'ledger') renderLedger();
}
function renderAll() {
  renderHeader();
  if (activeView === 'ledger') renderLedger();
  if (activeView === 'roadmap') renderRoadmap();
  if (activeView === 'matrix') renderMatrix();
  if (activeView === 'save') renderSave();
}

function wire() {
  document.querySelectorAll('#view-tabs button[data-view]').forEach((b) =>
    b.addEventListener('click', () => switchView(b.dataset.view)));
  document.getElementById('spoiler-btn').addEventListener('click', () => {
    state.spoilersHidden = !state.spoilersHidden; saveState(); renderAll();
  });
  document.getElementById('quick-export').addEventListener('click', () => switchView('save'));
  document.getElementById('quick-import').addEventListener('click', () => switchView('save'));
  ['search', 'grade-select', 'status-select', 'missable-only', 'unearned-only'].forEach((id) => {
    document.getElementById(id).addEventListener('input', renderLedger);
    document.getElementById(id).addEventListener('change', renderLedger);
  });
  document.getElementById('download-btn').addEventListener('click', () => {
    const blob = new Blob([exportPayload()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-trophy-ledger-progress.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  document.getElementById('copy-btn').addEventListener('click', () => {
    const ta = document.getElementById('export-text');
    ta.select();
    if (navigator.clipboard) navigator.clipboard.writeText(ta.value);
    document.getElementById('import-confirm').textContent = 'Export copied to the clipboard.';
  });
  document.getElementById('import-btn').addEventListener('click', doImport);
  document.getElementById('reset-btn').addEventListener('click', () => {
    state = { earned: new Set(), counters: {}, revealed: new Set(), spoilersHidden: false };
    saveState(); renderAll();
    document.getElementById('reset-confirm').textContent = 'All progress cleared from this browser.';
  });
}

fetch('data/trophies.json')
  .then((r) => r.json())
  .then((data) => {
    DATA = data;
    TROPHIES = data.trophies;
    byId = new Map(TROPHIES.map((t) => [t.id, t]));
    selectedId = TROPHIES[0].id;
    wire();
    renderAll();
  })
  .catch((err) => {
    document.getElementById('detail-panel').innerHTML = '<p>Could not load data/trophies.json: ' + esc(err.message) + '</p>';
  });
