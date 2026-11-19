// Leonida Trophy Guide — tracker for the 55 official GTA VI trophies.
// Plain static app: loads data/trophies.json, saves ticks in localStorage,
// exports and imports progress, filters the list, and hides story spoilers
// until their trophies are earned. No network, no libraries.

const KEY = "gta6-trophy-checklist";
const SPOILER_KEY = "leonida-spoilers";

const KIND_LABELS = {
  platinum: "Platinum",
  story: "Story",
  side: "Side story",
  collection: "Collection",
  activity: "Activity",
  race: "Race",
  robbery: "Robbery",
  money: "Money",
  moment: "Odd moment",
};

// Character requirements stated in the guides themselves.
const CHARACTER = { 22: "Lucia only", 27: "Jason only", 29: "Jason only" };

// "Going deeper" notes, written in our own words for the thinnest guides
// (activities and collections first). Every fact here comes from the data
// file — counts, places, character requirements and chapters — and each note
// is shown beside the sources of the trophy it belongs to. Nothing is
// invented; where the launch-week guides have no confirmed method, the guide
// says so instead.
const EXTRA = {
  14: "The checklist appears under Progress > Stats > 100% Completion after the story, but work you do earlier still counts. The big numbers are 300 stunts, 70 of the 80 Challenges, 200 of the 277 vehicles, all 8 bank vaults and all 39 illegal operations. That is why the Platinum takes around 200 hours: most of it is this one checklist, so treat every other trophy as progress toward it.",
  15: "Stunts come in several shapes — stunt jumps, flights under bridges, knife flights and base jumps all feed the same counter. The counter keeps running past 250, and it should: the 100% checklist asks for 300, so treat 250 as a milestone, not the finish. Keep a loop of the stunt spots that work and revisit them during cleanup.",
  16: "Nine activity types, one try of each. The guides name five of them — races, fishing, the shooting range, the arcade and the gym — and the rest are the other open-world pastimes you meet while exploring. Do not grind one activity: sample each once and move on, because a single attempt is all the counter wants.",
  17: "Two shooting ranges share 42 gold medals between them. Work one range at a time and clear its challenges in order; progress saves per challenge, so a gold you already hold stays held. Gold is about meeting the medal standard, not speed alone — retry a single challenge until the gold lands, then move to the next.",
  18: "Fourteen drone race locations, and the trophy wants a win at every one. A win counts per location, not per race, so there is no benefit in winning the same course twice. Clear the easy courses first to bank wins, learn the racing line on the tricky ones, and come back for them.",
  19: "Twenty different race wins. Repeating a race you already won adds nothing to the count, so keep moving to fresh races — street races, drone races and the rest. Wins you collect for other trophies, such as the Top Fun drone wins and Yago's street-racing strand, count here too.",
  20: "A fishing challenge against Cal — out-fish him rather than out-speed him. Steady reeling and a good spot matter more than rushing. The visit also counts as one of the nine activity types for Master of None, so it pulls double duty.",
  21: "Any arcade cabinet will do. Play one game through to its end — starting a game and walking away does not count. It is a quick trophy: do it whenever you pass an arcade, and it also counts as an activity type for Master of None.",
  22: "Andy's questline is Lucia-only, so play it as Lucia. It stays open after the credits, so there is no rush — and it does not count toward Strangers & Freaks, because it has its own trophy instead.",
  23: "Kenton's questline stays open after the credits, so finish it whenever you like during cleanup. Unlike Andy's, Billy's and Tyrone's strands, it counts toward Strangers & Freaks.",
  24: "Billy's questline stays open after the credits. Like Andy's and Tyrone's, it does not count toward Strangers & Freaks — it has its own trophy instead.",
  25: "Eight stranger strands count — and three do not. Andy's, Billy's and Tyrone's strands have their own trophies, so finishing them moves no counter here. After each strand, check the trophy's progress counter to see which ones counted. One strand is time-sensitive: Race Against Yago in Chapter 3 carries an hourglass icon, so do it the moment it appears.",
  26: "Randy's questline stays open after the credits, so finish it whenever you like during cleanup. It counts toward Strangers & Freaks.",
  27: "Tyrone's questline is Jason-only, so play it as Jason. It stays open after the credits, and it does not count toward Strangers & Freaks — it has its own trophy instead.",
  28: "Eighteen meditation spots in ten locations, shown as purple icons when you are close. Each outdoor spot counts twice if you meditate there with both characters, so bring your partner every time. The one spot that can vanish is Lucia's balcony meditation in Chapter 1: after Lucia is home, check the kitchen in the morning and follow her out to the balcony of Jason's house — and keep a Chapter 1 save until this trophy pops.",
  29: "Bret Vogel's hunting questline is Jason-only, so play it as Jason. It sends you after animals through target decks, and a clean head or heart shot keeps the carcass pristine, which is what the hunt wants.",
  30: "Cards are scattered across Leonida, and any three completed sets pop the Silver. Work on sets as you explore rather than hunting one set at a time — duplicates and stray cards add up across the map, and sets finish on their own over time.",
  31: "Open the WAiNK app and tag spots as you travel — a hundred tags across Leonida. The same app does double duty: scanning vehicles with WAiNK counts as discovering them, which feeds Whip It Good, so scan traffic as you drive and the two trophies climb together.",
  32: "Challenges live under Progress > Challenges, and many complete on their own while you play. Fifty pops this Bronze, but do not stop there: the 100% checklist needs 70 of the 80, so keep the challenge list open during cleanup and pick off the ones nearest to done.",
  33: "The easiest pairing is a bank vault job, which hands you a 4-star wanted level straight away with your partner already beside you. Escape together and the trophy pops once you have left the red heat zone — not just the flashing search area.",
  34: "Call your partner, then rob three shops in a row while the police are still chasing you. If the stars fade and you are only in the red heat zone, the chain breaks. The pop can take about 30 seconds after you leave the third shop, so give it a moment before hitting a fourth.",
  35: "Scan traffic with the WAiNK app while driving instead of hunting vehicles one by one — a scan counts as a discovery. One hundred pops this Bronze, but the 100% checklist needs 200 of the 277 base models, so keep scanning long after this one pops.",
  36: "Combat Focus is the slow-motion aim — press L3 and R3 while aiming. Pick a group of enemies, such as the guards at an illegal operation, and use an assault rifle so five fall inside a single use. Adrenaline extends Focus, so chain your shots while it lasts.",
  37: "At Vice City International Airport, steal a large passenger plane docked at a boarding bridge — the planes at gates E3 and E4 work, while planes parked out on the airfield do not count. Back out toward the runway, take off, and fly about 1 km away from the airport; the pop is delayed. Save first, because the police come fast.",
  38: "Tanks should be parked on the south side of Mile Zero Air Station, on the island at the far southwest of the map. Save first, get in, and drive and fire until it pops.",
  39: "The Chapter 3 mission Yasmani's Jewelry Jobs gives you the Snap Gun and opens jewelry store robberies. Go to a store's locked back door and use the Snap Gun on it — kicking the door in sets off the alarm. Inside the back room, find the note with the safe code, open the safe, and leave without being seen. Richardson Jewelry & Diamonds in Vice City is a good target. If someone spots you, reload rather than push on.",
  40: "Bank vaults unlock through That's Where The Money Is, an optional mission near the end of Chapter 4: tail an armored security van to a large bank and get into the vault while the guard has it open. You cannot carry all the bags alone, so bring your partner. A vault job gives you a 4-star wanted level straight away, so escaping one with your partner also earns Hot Together. The 100% checklist needs all eight vaults.",
  41: "Tail or ambush an armored truck, take it, and escape the heat — the trophy pops once you have left the red heat zone, not just the flashing search area.",
  42: "Cover every area of the map — driving and flying through each region fills it in. Fold it into your other travel: every trip to a mission, a race or a collectible also counts toward the map, so there is no need to grind it alone.",
  46: "The alley is Kingpin Bowling, an illegal operation you visit in Chapter 2. Bring Sticky Bombs and take all three key valuables: the luxury watch in an office, the shotgun on a table, and the contents of the office safe, which you blow open with a Sticky Bomb. Then escape the police. If you leave something behind, the operation comes back later — so this one is not missable.",
  52: "Marked Bills come from bank and payday loan jobs; sell them to your contacts to launder them. The $250,000 total is cumulative, so it builds across every job.",
  53: "The $100,000 total is cumulative across every kind of shop — weapons, clothes, food and the rest all count. It adds up on its own over a full playthrough, so there is no need to force it.",
  54: "Buy the eight garages in the Vice City Real Estate app, which unlocks after the Chapter 2 mission Daily Driver; together they cost about $160,000. Garages the story gives you do not count. Buy them early — you need the free spaces to register cars for On the Spot.",
  55: "The Chapter 2 mission Moses opens the app: take a stolen car to Moses, choose Respray, then Register. From Chapter 3 you can also register cars with a standard tracker at Pay 'n' Spray. Each car needs a free garage space, so buy garages first and register cheap cars.",
};

// Story windows worth respecting, drawn from the data file.
const WATCH_LIST = [
  "Race Against Yago (Chapter 3) — Yago's street-racing strand carries an hourglass icon; do it the moment it appears, because the strand counts toward Strangers & Freaks.",
  "Lucia's balcony meditation (Chapter 1) — one of the 18 meditation spots sits at Jason's house and disappears after the chapter; meditate there before the story moves on.",
  "Keep manual saves — one at the start of every chapter and one untouched save from just before the final mission. There is no mission replay and no New Game Plus, so a save is your only way back.",
];

const doc = await (await fetch("data/trophies.json")).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const phaseOf = new Map();
for (const phase of doc.roadmap) {
  for (const id of phase.trophies) phaseOf.set(id, phase);
}

const $ = (id) => document.getElementById(id);
const listEl = $("trophyList");
const detailEl = $("detail");
const resultEl = $("resultCount");

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
} catch {
  earned = new Set();
}
earned = new Set([...earned].filter((id) => byId.has(id)));

let spoilers = localStorage.getItem(SPOILER_KEY) === "on";
let selectedId = trophies[0].id;
let view = "tracker";
const filters = { q: "", grade: "all", kind: "all", status: "all", missableOnly: false };

const params = new URLSearchParams(location.search);
if (params.get("view") && document.querySelector(`[data-view="${params.get("view")}"]`)) {
  view = params.get("view");
}
if (params.get("select") && byId.has(Number(params.get("select")))) {
  selectedId = Number(params.get("select"));
}
if (params.get("spoilers") === "on" || params.get("spoilers") === "off") {
  spoilers = params.get("spoilers") === "on";
}

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoilers() {
  localStorage.setItem(SPOILER_KEY, spoilers ? "on" : "off");
}

function isMasked(t) {
  return spoilers && t.hidden && !earned.has(t.id);
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeChip(t) {
  return el("span", "chip chip-" + t.grade, t.grade);
}

function kindTag(t) {
  return el("span", "chip chip-kind", KIND_LABELS[t.kind] ?? t.kind);
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  $("earnedCount").textContent = String(n);
  $("progressFill").style.width = (n / total) * 100 + "%";
  const pct = Math.round((n / total) * 100);
  $("progressText").textContent = "Platinum " + pct + "% there";
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  const earnedByGrade = {};
  for (const id of earned) {
    const g = byId.get(id).grade;
    earnedByGrade[g] = (earnedByGrade[g] ?? 0) + 1;
  }
  $("gradeCounts").textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => g + " " + (earnedByGrade[g] ?? 0) + "/" + (counts[g] ?? 0))
    .join(" · ");
}

function matchesFilters(t) {
  if (filters.grade !== "all" && t.grade !== filters.grade) return false;
  if (filters.kind !== "all" && t.kind !== filters.kind) return false;
  if (filters.status === "earned" && !earned.has(t.id)) return false;
  if (filters.status === "remaining" && earned.has(t.id)) return false;
  if (filters.missableOnly && !t.missable) return false;
  if (filters.q) {
    const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
    if (!hay.includes(filters.q)) return false;
  }
  return true;
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  for (const t of shown) {
    const li = el("li", "trophy-row" + (earned.has(t.id) ? " earned" : "") + (t.id === selectedId ? " selected" : ""));
    li.tabIndex = 0;
    li.dataset.id = String(t.id);
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.id);
    box.setAttribute("aria-label", "Mark " + (isMasked(t) ? "hidden trophy" : t.name) + " as earned");
    box.addEventListener("change", () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderAll();
    });
    box.addEventListener("click", (event) => event.stopPropagation());
    const main = el("div", "trophy-main");
    const masked = isMasked(t);
    main.append(
      el("p", "trophy-name" + (masked ? " masked" : ""), masked ? "Hidden trophy — earn it to reveal it" : t.name),
      el("p", "trophy-desc" + (masked ? " masked" : ""), masked ? "Hidden on PlayStation until earned; the spoiler setting is hiding it." : t.description),
    );
    const chips = el("span", "chips");
    chips.append(gradeChip(t), kindTag(t));
    if (t.hidden) chips.append(el("span", "chip chip-hidden", "Hidden on PSN"));
    if (t.missable) chips.append(el("span", "chip chip-missable", "Missable"));
    main.append(chips);
    li.append(box, main);
    li.addEventListener("click", () => {
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    li.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedId = t.id;
        renderList();
        renderDetail();
      }
    });
    listEl.append(li);
  }
  if (shown.length === 0) {
    listEl.append(el("li", "empty-note", "No trophies match these filters. Clear the search or widen the filters."));
  }
  const kindWord = filters.kind === "all" ? "all kinds" : KIND_LABELS[filters.kind] ?? filters.kind;
  resultEl.textContent =
    "Showing " + shown.length + " of " + trophies.length + " trophies (" + kindWord + "). " +
    (spoilers ? "Spoilers on: hidden story trophies stay masked until earned." : "Spoilers off: every name and description is shown.");
}

function methodNote(t) {
  if (t.guide.includes("No confirmed method")) {
    return "Method not yet confirmed — the official description is the only hint at launch, so this guide guesses nothing.";
  }
  if (t.guide.includes("not yet fully confirmed") || t.guide.includes("Community guides report")) {
    return "Method reported, not yet fully confirmed — community guides report this approach; treat it as the best current reading, not a guarantee.";
  }
  return null;
}

function renderDetail() {
  const t = byId.get(selectedId);
  detailEl.replaceChildren();
  if (!t) {
    detailEl.append(el("p", "detail-empty", "Pick a trophy from the list to read its guide."));
    return;
  }
  const masked = isMasked(t);
  detailEl.append(el("p", "detail-eyebrow", "Trophy Nº " + t.id + " · " + (KIND_LABELS[t.kind] ?? t.kind)));
  detailEl.append(el("h2", null, masked ? "Hidden trophy" : t.name));
  detailEl.append(el("p", "official-desc", masked ? "Hidden on PlayStation until earned." : "“" + t.description + "”"));
  const chips = el("div", "chips");
  chips.append(gradeChip(t), kindTag(t));
  if (t.hidden) chips.append(el("span", "chip chip-hidden", "Hidden on PSN"));
  if (t.missable) chips.append(el("span", "chip chip-missable", "Missable"));
  const phase = phaseOf.get(t.id);
  if (phase) chips.append(el("span", "chip chip-count", "Roadmap phase " + phase.phase));
  detailEl.append(chips);

  if (masked) {
    detailEl.append(el("p", null, "The spoiler setting is hiding this story trophy. Earn it on your PlayStation and tick it here to reveal its name, description and guide."));
  } else {
    if (t.missable && t.missableNote) {
      const banner = el("p", "missable-banner");
      banner.append(el("strong", null, "Missable. "), document.createTextNode(t.missableNote));
      detailEl.append(banner);
    }
    const note = methodNote(t);
    if (note) detailEl.append(el("p", "method-note", note));
    detailEl.append(el("h4", null, "The guide — in our own words"));
    detailEl.append(el("p", "guide-text", t.guide));
    if (EXTRA[t.id]) {
      detailEl.append(el("h4", null, "Going deeper"));
      detailEl.append(el("p", "deep-text", EXTRA[t.id]));
    }
    detailEl.append(el("h4", null, "At a glance"));
    const glance = el("dl", "glance");
    const rows = [
      ["Grade", t.grade],
      ["Kind", KIND_LABELS[t.kind] ?? t.kind],
      ["Hidden on PSN", t.hidden ? "Yes — hidden until earned" : "No"],
      ["Missable", t.missable ? "Possibly — see the warning above" : "No"],
      ["Roadmap", phase ? "Phase " + phase.phase + " — " + phase.title : "—"],
    ];
    if (CHARACTER[t.id]) rows.push(["Character", CHARACTER[t.id]]);
    for (const [term, value] of rows) {
      glance.append(el("dt", null, term), el("dd", null, value));
    }
    detailEl.append(glance);
    if (t.tips && t.tips.length) {
      detailEl.append(el("h4", null, "Field tips"));
      const ul = el("ul", "tips");
      for (const tip of t.tips) ul.append(el("li", null, tip));
      detailEl.append(ul);
    }
    const sources = el("p", "sources-line");
    sources.append(el("strong", null, "Sources: "), document.createTextNode(t.sources.join(", ") + "."));
    detailEl.append(sources);
  }

  const btn = el("button", "earn-btn" + (earned.has(t.id) ? " earned" : ""), earned.has(t.id) ? "✓ Earned — tap to unmark" : "Mark as earned");
  btn.type = "button";
  btn.addEventListener("click", () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    renderAll();
  });
  detailEl.append(btn);
}

function renderRoadmap() {
  const list = $("roadmapList");
  list.replaceChildren();
  for (const phase of doc.roadmap) {
    const done = phase.trophies.filter((id) => earned.has(id)).length;
    const li = el("li", "roadmap-phase");
    li.append(el("h3", null, "Phase " + phase.phase + " — " + phase.title));
    li.append(el("p", "phase-count", done + " of " + phase.trophies.length + " earned in this phase"));
    li.append(el("p", null, phase.text));
    const chips = el("ul", "phase-trophies");
    for (const id of phase.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const chip = el("li", earned.has(id) ? "done" : null, (earned.has(id) ? "✓ " : "") + t.name);
      chip.addEventListener("click", () => {
        selectedId = id;
        setView("tracker");
        renderAll();
      });
      chip.style.cursor = "pointer";
      chips.append(chip);
    }
    li.append(chips);
    list.append(li);
  }
}

function renderMissables() {
  const list = $("missableList");
  list.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = el("div", "missable-card");
    card.append(el("h4", null, t.name + " (" + t.grade + ")"));
    card.append(el("p", null, t.missableNote ?? t.guide));
    card.append(el("p", null, t.guide));
    const btn = el("button", null, "Open its guide");
    btn.type = "button";
    btn.addEventListener("click", () => {
      selectedId = t.id;
      setView("tracker");
      renderAll();
    });
    card.append(btn);
    list.append(card);
  }
  const watch = $("watchList");
  watch.replaceChildren();
  for (const item of WATCH_LIST) watch.append(el("li", null, item));
}

function renderSources() {
  const list = $("sourceList");
  list.replaceChildren();
  for (const s of doc.sources) {
    const li = el("li");
    li.append(el("strong", null, s.label));
    li.append(el("span", "source-url", s.url));
    li.append(document.createTextNode(" — " + s.usedFor));
    list.append(li);
  }
}

function setView(next) {
  view = next;
  for (const tab of document.querySelectorAll(".view-tab")) {
    const active = tab.dataset.view === view;
    tab.classList.toggle("active", active);
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  for (const section of document.querySelectorAll(".view")) {
    section.classList.toggle("active", section.id === "view-" + view);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

// Toolbar wiring.
const kindSelect = $("kindFilter");
for (const kind of [...new Set(trophies.map((t) => t.kind))]) {
  const option = document.createElement("option");
  option.value = kind;
  option.textContent = KIND_LABELS[kind] ?? kind;
  kindSelect.append(option);
}

$("q").addEventListener("input", (event) => {
  filters.q = event.target.value.trim().toLowerCase();
  renderList();
});
$("gradeFilter").addEventListener("change", (event) => {
  filters.grade = event.target.value;
  renderList();
});
kindSelect.addEventListener("change", (event) => {
  filters.kind = event.target.value;
  renderList();
});
$("statusFilter").addEventListener("change", (event) => {
  filters.status = event.target.value;
  renderList();
});
$("missableOnly").addEventListener("change", (event) => {
  filters.missableOnly = event.target.checked;
  renderList();
});
$("spoilerToggle").checked = spoilers;
$("spoilerToggle").addEventListener("change", (event) => {
  spoilers = event.target.checked;
  saveSpoilers();
  renderAll();
});

$("exportBtn").addEventListener("click", () => {
  const payload = { game: "Grand Theft Auto VI", earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  a.download = "leonida-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error("not a progress file");
    const next = new Set(ids.filter((id) => byId.has(id)));
    earned = next;
    save();
    renderAll();
    resultEl.textContent = "Imported " + earned.size + " earned trophies from " + file.name + ".";
  } catch {
    resultEl.textContent = "That file could not be imported — it is not a Leonida Trophy Guide progress file.";
  }
  event.target.value = "";
});
$("resetBtn").addEventListener("click", () => {
  if (!confirm("Clear every tick in this guide? Export first if you want to keep your progress.")) return;
  earned = new Set();
  save();
  renderAll();
});

for (const tab of document.querySelectorAll(".view-tab")) {
  tab.addEventListener("click", () => setView(tab.dataset.view));
}

setView(view);
renderAll();
renderSources();
