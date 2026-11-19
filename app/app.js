// Leonida Trophy Guide — tracker logic, written for this guide.
// Data: app/data/trophies.json (official names/descriptions/grades + our own
// guides). Progress lives in localStorage; nothing leaves the browser unless
// you export it. No network calls besides loading the local data file.
const STORE_KEY = 'leonida-trophy-guide-progress-v1';
const SPOILER_KEY = 'leonida-trophy-guide-spoilers-v1';
const KIND_LABELS = {
  platinum: 'Platinum & 100%',
  story: 'Story',
  side: 'Side stories',
  robbery: 'Robbery',
  race: 'Races & stunts',
  activity: 'Activities',
  collection: 'Collection',
  money: 'Money & property',
  moment: 'Moments',
};
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]').filter((n) => trophies.some((t) => t.name === n)));
let spoilersOn = (localStorage.getItem(SPOILER_KEY) ?? 'on') === 'on';
let phaseFilter = null; // array of trophy ids, or null

const $ = (id) => document.getElementById(id);
const grid = $('trophyGrid');
const searchInput = $('search');
const gradeFilter = $('gradeFilter');
const kindFilter = $('kindFilter');
const statusFilter = $('statusFilter');
const spoilerToggle = $('spoilerToggle');

function refreshKindOptions() {
  kindFilter.replaceChildren();
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'All kinds';
  kindFilter.append(all);
  for (const kind of Object.keys(KIND_LABELS)) {
    const opt = document.createElement('option');
    opt.value = kind;
    const n = trophies.filter((t) => t.kind === kind).length;
    const got = trophies.filter((t) => t.kind === kind && earned.has(t.name)).length;
    opt.textContent = `${KIND_LABELS[kind]} (${got}/${n})`;
    kindFilter.append(opt);
  }
  kindFilter.value = currentKind;
}
let currentKind = 'all';
refreshKindOptions();
spoilerToggle.checked = spoilersOn;

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoilersOn ? 'on' : 'off');
  $('savedNote').textContent = `Progress saved in this browser · ${new Date().toLocaleTimeString()}.`;
}

function isSpoilerHidden(t) {
  return spoilersOn && t.hidden && !earned.has(t.name);
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  $('ring').style.setProperty('--pct', pct);
  $('ringText').textContent = `${n}/${total}`;
  $('ring').setAttribute('aria-label', `${n} of ${total} trophies earned`);
  $('earnedCount').textContent = n;
  $('earnedPct').textContent = `${pct}%`;
  $('gradeBars').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const all = trophies.filter((t) => t.grade === g).length;
      const got = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
      return `<b>${GRADE_LETTER[g]}</b> ${got}/${all}`;
    })
    .join(' &nbsp;·&nbsp; ');
  const left = trophies.filter((t) => t.grade !== 'platinum').length - n + (earned.has('Vice Got a Price!') ? 1 : 0);
  $('platinumLine').textContent = earned.has('Vice Got a Price!')
    ? 'Platinum Vice Got a Price! — earned. Leonida Legend.'
    : `Platinum Vice Got a Price! unlocks when the other ${trophies.length - 1} are earned (${Math.max(0, left)} to go).`;
}

function renderRoadmap() {
  const list = $('phaseList');
  list.replaceChildren();
  for (const phase of doc.roadmap) {
    const done = phase.trophies.filter((id) => earned.has(byId.get(id).name)).length;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'phase';
    btn.innerHTML = '';
    const h = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'phase-num';
    num.textContent = phase.phase;
    h.append(num, document.createTextNode(phase.title));
    const p = document.createElement('p');
    p.textContent = phase.text;
    const count = document.createElement('span');
    count.className = 'phase-count';
    count.innerHTML = `Trophies in this phase: <span class="done">${done}</span> / ${phase.trophies.length} earned — tap to filter the list`;
    btn.append(h, p, count);
    btn.addEventListener('click', () => {
      phaseFilter = phase.trophies;
      $('listTitle').textContent = `Phase ${phase.phase}: ${phase.title}`;
      renderList();
      document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
    });
    list.append(btn);
  }
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
  card.id = `trophy-${t.id}`;
  card.dataset.name = t.name;
  if (isSpoilerHidden(t)) {
    card.classList.add('spoiler-hidden');
    const head = document.createElement('div');
    head.className = 'card-head';
    const medal = document.createElement('span');
    medal.className = `medal ${t.grade}`;
    medal.textContent = '?';
    const name = document.createElement('h3');
    name.className = 'card-name';
    name.textContent = 'Hidden trophy';
    head.append(medal, name);
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'A hidden trophy — its name, description and guide stay secret until you earn it (or turn the spoiler setting off).';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'earned-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'Mark as earned';
    btn.addEventListener('click', () => toggleEarned(t));
    card.append(head, note, btn);
    return card;
  }
  const head = document.createElement('div');
  head.className = 'card-head';
  const medal = document.createElement('span');
  medal.className = `medal ${t.grade}`;
  medal.textContent = GRADE_LETTER[t.grade];
  medal.title = t.grade;
  const name = document.createElement('h3');
  name.className = 'card-name';
  name.textContent = t.name;
  head.append(medal, name);
  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = t.description;
  const tags = document.createElement('div');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${t.grade}`;
  gradeTag.textContent = t.grade;
  tags.append(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[t.kind];
  tags.append(kindTag);
  if (t.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'hidden';
    tags.append(hiddenTag);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = '⚠ missable';
    m.title = t.missableNote ?? '';
    tags.append(m);
  }
  if (t.id === 25) {
    const ts = document.createElement('span');
    ts.className = 'tag timesensitive';
    ts.textContent = '⏱ time-sensitive step';
    ts.title = 'Race Against Yago in Chapter 3 is time-sensitive.';
    tags.append(ts);
  }
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  const details = document.createElement('details');
  details.className = 'tips';
  const summary = document.createElement('summary');
  summary.textContent = `Tips (${t.tips.length})`;
  const ul = document.createElement('ul');
  for (const tip of t.tips) {
    const li = document.createElement('li');
    li.textContent = tip;
    ul.append(li);
  }
  details.append(summary, ul);
  const src = document.createElement('p');
  src.className = 'card-sources';
  src.innerHTML = '';
  const b = document.createElement('b');
  b.textContent = 'Sources: ';
  src.append(b, document.createTextNode(t.sources.join(' · ')));
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earned-btn';
  const isEarned = earned.has(t.name);
  btn.setAttribute('aria-pressed', String(isEarned));
  btn.textContent = isEarned ? '✓ Earned — tap to undo' : 'Mark as earned';
  btn.addEventListener('click', () => toggleEarned(t));
  card.append(head, desc, tags, guide, details, src, btn);
  return card;
}

function toggleEarned(t) {
  if (earned.has(t.name)) earned.delete(t.name);
  else earned.add(t.name);
  save();
  renderProgress();
  renderRoadmap();
  renderList();
}

function visibleTrophies() {
  const q = searchInput.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (phaseFilter && !phaseFilter.includes(t.id)) return false;
    if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
    if (kindFilter.value !== 'all' && t.kind !== kindFilter.value) return false;
    if (statusFilter.value === 'earned' && !earned.has(t.name)) return false;
    if (statusFilter.value === 'remaining' && earned.has(t.name)) return false;
    if (statusFilter.value === 'missable' && !(t.missable || t.id === 25)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderList() {
  refreshKindOptions();
  const list = visibleTrophies();
  grid.replaceChildren(...list.map(trophyCard));
  $('emptyMsg').hidden = list.length > 0;
  const shown = list.filter((t) => earned.has(t.name)).length;
  $('listCount').textContent = `${list.length} shown · ${shown} earned in this view` +
    (phaseFilter ? ' · tap the “All trophies” heading to clear the phase filter' : '');
  if (!phaseFilter) $('listTitle').textContent = 'All trophies';
}

function renderSources() {
  const ul = $('sourceList');
  ul.replaceChildren();
  for (const s of doc.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.label;
    a.rel = 'noopener';
    li.append(a, document.createTextNode(` — ${s.usedFor}`));
    ul.append(li);
  }
}

$('listTitle').style.cursor = 'pointer';
$('listTitle').addEventListener('click', () => {
  phaseFilter = null;
  renderList();
});
searchInput.addEventListener('input', renderList);
gradeFilter.addEventListener('change', renderList);
kindFilter.addEventListener('change', () => {
  currentKind = kindFilter.value;
  renderList();
});
statusFilter.addEventListener('change', renderList);
spoilerToggle.addEventListener('change', () => {
  spoilersOn = spoilerToggle.checked;
  save();
  renderList();
});

$('exportBtn').addEventListener('click', () => {
  const payload = { game: doc.game, platform: doc.platform, exportedAt: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list in file');
    const known = new Set(trophies.map((t) => t.name));
    const imported = names.filter((n) => known.has(n));
    earned = new Set(imported);
    save();
    renderProgress();
    renderRoadmap();
    renderList();
    $('savedNote').textContent = `Imported ${imported.length} earned trophies from ${file.name}.`;
  } catch (err) {
    $('savedNote').textContent = `Import failed: ${err.message}. Nothing changed.`;
  }
  event.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies in this browser?')) return;
  earned = new Set();
  save();
  renderProgress();
  renderRoadmap();
  renderList();
});

// Deep links: #roadmap scrolls to the roadmap; #trophy-<id> opens that trophy's
// card (and its tips) and scrolls to it — handy for sharing one guide.
function applyHash() {
  const hash = location.hash;
  if (hash === '#roadmap') {
    $('roadmap').scrollIntoView();
    return;
  }
  const m = hash.match(/^#trophy-(\d+)$/);
  if (!m) return;
  const t = byId.get(Number(m[1]));
  if (!t) return;
  phaseFilter = null;
  gradeFilter.value = 'all';
  kindFilter.value = 'all';
  statusFilter.value = 'all';
  searchInput.value = '';
  renderList();
  const card = $(`trophy-${t.id}`);
  if (!card) return;
  card.classList.add('flash');
  card.scrollIntoView({ block: 'center' });
  const details = card.querySelector('details');
  if (details) details.open = true;
}

renderProgress();
renderRoadmap();
renderList();
renderSources();
applyHash();
