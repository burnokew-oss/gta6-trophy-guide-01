// Leonida Ledger — tracker, guides, roadmap and sources for the 55 GTA VI trophies.
// Plain browser JavaScript, no libraries, no network calls beyond the app's own data file.
(function () {
  'use strict';
  var STORAGE_KEY = 'leonida-ledger-progress-v1';
  var KIND_LABELS = {
    story: 'Story', side: 'Side strand', collectible: 'Collectible', activity: 'Activity',
    feat: 'Feat', completion: 'Completion', platinum: 'Platinum'
  };
  var STAGES = [
    { n: 1, title: 'Stage 1 — Play the story, guard Chapter 1', hours: '60–80 hours',
      text: 'Play all five chapters and the named story missions in order. In Chapter 1, after Down to Earth, take the balcony meditation at the house the moment it is offered — it is the one possibly-missable beat in the game. Try every new activity once, get in every new vehicle, and keep manual saves at each chapter break.' },
    { n: 2, title: 'Stage 2 — Strands, partners and first tries', hours: 'alongside the story',
      text: 'Run the stranger strands as they appear (Andy, Kenton, Billy, Randy, Tyrone and Bret), finish activity first-tries, and take the partner feats while the pair are together. Quest givers pause during some story beats but return afterwards, so a vanished marker is a pause, not a loss.' },
    { n: 3, title: 'Stage 3 — The 100% checklist', hours: 'about 100 hours',
      text: 'After the credits the full 100% checklist opens under Progress. Work it by category: robberies and gang operations, the 42 shooting-range golds, races and drone races, 250 stunts, challenges, card sets, WAiNK spots and area exploration. Most feat and collectible trophies fall out of this sweep on the way to A Long Road.' },
    { n: 4, title: 'Stage 4 — Economy and clean-up', hours: '10–20 hours',
      text: 'Close the money trophies (launder $250,000, spend $100,000, buy all 8 garages, register 10 vehicles), sweep anything the filters show as left, and the platinum — Vice Got a Price! — pops on its own when trophy 54 lands.' }
  ];

  var data = null;
  var earned = new Set();
  try { earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch (e) { earned = new Set(); }
  var selectedId = 28; // open on the one trophy every platinum hunter must not miss

  var els = {};
  ['search', 'kindFilter', 'gradeFilter', 'statusFilter', 'missableOnly', 'spoilerToggle',
   'trophyList', 'detailPane', 'earnedCount', 'barFill', 'gradeChips', 'showingCount',
   'exportBtn', 'importFile', 'stageCards', 'watchList', 'sourceList'].forEach(function (id) {
    els[id] = document.getElementById(id);
  });

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(earned))); }
  function byId(id) { return data.trophies.find(function (t) { return t.id === id; }); }
  function sourceUrl(name) {
    var s = data.sources.find(function (x) { return x.name === name; });
    return s ? s.url : null;
  }
  function isSpoilerHidden(t) {
    return els.spoilerToggle.checked && t.kind === 'story' && !earned.has(t.id);
  }

  function renderScoreboard() {
    var total = data.trophies.length;
    els.earnedCount.textContent = String(earned.size);
    els.barFill.style.width = (total ? (earned.size / total) * 100 : 0) + '%';
    var grades = ['platinum', 'gold', 'silver', 'bronze'];
    els.gradeChips.innerHTML = grades.map(function (g) {
      var all = data.trophies.filter(function (t) { return t.grade === g; });
      var got = all.filter(function (t) { return earned.has(t.id); }).length;
      return '<span class="chip">' + g + ' <b>' + got + ' / ' + all.length + '</b></span>';
    }).join('') + '<span class="chip">overall <b>' + Math.round((earned.size / total) * 100) + '%</b></span>';
  }

  function matches(t) {
    var q = els.search.value.trim().toLowerCase();
    if (els.kindFilter.value !== 'all' && t.kind !== els.kindFilter.value) return false;
    if (els.gradeFilter.value !== 'all' && t.grade !== els.gradeFilter.value) return false;
    if (els.statusFilter.value === 'earned' && !earned.has(t.id)) return false;
    if (els.statusFilter.value === 'left' && earned.has(t.id)) return false;
    if (els.missableOnly.checked && t.missable === 'none') return false;
    if (q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function rowHtml(t) {
    var hiddenSpoiler = isSpoilerHidden(t);
    var name = hiddenSpoiler ? '— story trophy under spoiler shield —' : t.name;
    var desc = hiddenSpoiler ? 'Name and description stay covered until you earn it. Grade and kind remain visible so you can still plan.' : t.description;
    var miss = '';
    if (t.missable === 'possible') miss = '<span class="tag miss-possible">Possibly missable</span>';
    else if (t.missable === 'watch') miss = '<span class="tag miss-watch">Watch</span>';
    var target = t.target ? '<span class="tag target">Target ' + t.target.toLocaleString('en-US') + '</span>' : '';
    var hid = t.hidden ? '<span class="tag">Hidden on PSN</span>' : '';
    return '<div class="row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '') +
      '" role="listitem" data-id="' + t.id + '">' +
      '<input type="checkbox" data-earn="' + t.id + '"' + (earned.has(t.id) ? ' checked' : '') + ' aria-label="Mark earned">' +
      '<div><div class="name">' + name + '</div><div class="desc">' + desc + '</div>' +
      '<div class="meta">' + miss + target + hid + '<span class="tag">Stage ' + t.stage + '</span></div></div>' +
      '<span class="pill ' + t.grade + '">' + t.grade + '</span></div>';
  }

  function renderList() {
    var shown = data.trophies.filter(matches);
    els.trophyList.innerHTML = shown.map(rowHtml).join('');
    els.showingCount.textContent = 'Showing ' + shown.length + ' of ' + data.trophies.length + ' trophies';
    Array.prototype.forEach.call(els.trophyList.querySelectorAll('.row'), function (row) {
      row.addEventListener('click', function (ev) {
        if (ev.target && ev.target.type === 'checkbox') return;
        selectedId = Number(row.getAttribute('data-id'));
        renderList(); renderDetail();
      });
    });
    Array.prototype.forEach.call(els.trophyList.querySelectorAll('input[data-earn]'), function (box) {
      box.addEventListener('change', function () {
        var id = Number(box.getAttribute('data-earn'));
        if (box.checked) earned.add(id); else earned.delete(id);
        save(); renderAll();
      });
    });
  }

  function renderDetail() {
    var t = byId(selectedId) || data.trophies[0];
    var hiddenSpoiler = isSpoilerHidden(t);
    var name = hiddenSpoiler ? 'Story trophy (spoiler shield on)' : t.name;
    var desc = hiddenSpoiler ? 'Earn this story trophy to reveal its name and description here.' : t.description;
    var missClass = t.missable === 'possible' ? ' possible' : (t.missable === 'watch' ? ' watch' : '');
    var missTitle = t.missable === 'possible' ? 'Possibly missable. ' : (t.missable === 'watch' ? 'Watch — timing matters. ' : '');
    var missText = missTitle + t.missableNote;
    var steps = t.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    var srcs = t.sources.map(function (name2) {
      var url = sourceUrl(name2);
      return url ? '<a href="' + url + '" target="_blank" rel="noopener">' + name2 + '</a>' : name2;
    }).join(' · ');
    els.detailPane.innerHTML =
      '<span class="pill ' + t.grade + '">' + t.grade + '</span> ' +
      '<span class="tag">' + KIND_LABELS[t.kind] + '</span> <span class="tag">Roadmap stage ' + t.stage + '</span>' +
      (t.hidden ? ' <span class="tag">Hidden on PSN</span>' : '') +
      '<h2>' + name + '</h2><p class="official">“' + desc + '” — official description</p>' +
      (t.target ? '<p><strong>PlayStation target:</strong> ' + t.target.toLocaleString('en-US') + '</p>' : '') +
      '<div class="miss-note' + missClass + '">' + missText + '</div>' +
      '<h4>Guide — in our own words</h4><p>' + t.guide + '</p>' +
      '<h4>Steps</h4><ol>' + steps + '</ol>' +
      '<h4>Sources for this trophy</h4><p class="srcs">' + srcs + '</p>' +
      '<label class="earn-line"><input type="checkbox" id="detailEarn"' + (earned.has(t.id) ? ' checked' : '') + '> I have earned this trophy</label>';
    document.getElementById('detailEarn').addEventListener('change', function (ev) {
      if (ev.target.checked) earned.add(t.id); else earned.delete(t.id);
      save(); renderAll();
    });
  }

  function renderRoadmap() {
    els.stageCards.innerHTML = STAGES.map(function (s) {
      var ts = data.trophies.filter(function (t) { return t.stage === s.n; });
      var done = ts.filter(function (t) { return earned.has(t.id); }).length;
      var chips = ts.map(function (t) {
        return '<span class="tag' + (earned.has(t.id) ? ' done' : '') + '">' + t.name + '</span>';
      }).join('');
      return '<div class="stage-card"><h3>' + s.title + ' — <span class="hours">' + s.hours + '</span></h3>' +
        '<p>' + s.text + '</p><p><strong>' + done + ' of ' + ts.length + ' trophies in this stage earned.</strong></p>' +
        '<div class="stage-trophies">' + chips + '</div></div>';
    }).join('');
    var watch = data.trophies.filter(function (t) { return t.missable !== 'none'; });
    els.watchList.innerHTML = watch.map(function (t) {
      var label = t.missable === 'possible' ? 'POSSIBLY MISSABLE' : 'WATCH';
      return '<div class="watch-item"><b>' + t.name + '</b> <span class="tag ' +
        (t.missable === 'possible' ? 'miss-possible' : 'miss-watch') + '">' + label + '</span>' +
        '<div>' + t.missableNote + '</div></div>';
    }).join('');
  }

  function renderSources() {
    els.sourceList.innerHTML = data.sources.map(function (s) {
      var count = data.trophies.filter(function (t) { return t.sources.indexOf(s.name) !== -1; }).length;
      return '<div class="source-card"><a href="' + s.url + '" target="_blank" rel="noopener">' + s.name + '</a>' +
        '<div>' + s.usedFor + '</div><div>Cited beside ' + count + ' trophy guides in this app.</div></div>';
    }).join('');
  }

  function renderAll() { renderScoreboard(); renderList(); renderDetail(); renderRoadmap(); }

  document.querySelectorAll('#viewTabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#viewTabs .tab').forEach(function (x) { x.classList.remove('active'); });
      tab.classList.add('active');
      ['tracker', 'roadmap', 'sources'].forEach(function (v) {
        document.getElementById('view-' + v).hidden = v !== tab.getAttribute('data-view');
      });
      if (tab.getAttribute('data-view') === 'roadmap') renderRoadmap();
    });
  });
  ['search', 'kindFilter', 'gradeFilter', 'statusFilter', 'missableOnly', 'spoilerToggle'].forEach(function (id) {
    els[id].addEventListener('input', renderAll);
    els[id].addEventListener('change', renderAll);
  });
  els.exportBtn.addEventListener('click', function () {
    var payload = JSON.stringify({ app: 'leonida-ledger', earned: Array.from(earned) }, null, 1);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    a.download = 'leonida-ledger-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  els.importFile.addEventListener('change', function () {
    var file = els.importFile.files[0];
    if (!file) return;
    file.text().then(function (text) {
      var parsed = JSON.parse(text);
      var ids = Array.isArray(parsed) ? parsed : parsed.earned;
      earned = new Set(ids.filter(function (x) { return byId(Number(x)); }).map(Number));
      save(); renderAll();
    });
  });

  fetch('data/trophies.json').then(function (r) { return r.json(); }).then(function (json) {
    data = json;
    renderAll(); renderSources();
  }).catch(function () {
    els.trophyList.innerHTML = '<p>Could not load data/trophies.json — serve the app folder with any static server.</p>';
  });
})();
