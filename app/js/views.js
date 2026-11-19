// Views: everything the player sees — the trophy rows, the detail panel,
// the roadmap timeline, the missable list and the sources page. Views take
// plain data and return nothing; they write straight into the document.

import { PHASES, gradeLabel, kindLabel } from './data.js';

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function trophyIsSpoilerMasked(trophy, spoilersHidden, earned) {
  return spoilersHidden && trophy.hidden && !earned[trophy.id];
}

export function renderHeader(trophies, earned) {
  const total = trophies.length;
  const got = Object.keys(earned).filter((id) => trophies.some((t) => t.id === id)).length;
  const pct = total ? Math.round((got / total) * 100) : 0;
  document.getElementById('earned-count').textContent = String(got);
  document.getElementById('platinum-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earned[trophy.id]) counts[trophy.grade] += 1;
  }
  document.getElementById('grade-line').textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
}

export function renderTrophyList(listElement, trophies, state, options = {}) {
  const { earned, selectedId, spoilersHidden } = state;
  const writeMeta = options.writeMeta !== false;
  listElement.innerHTML = '';
  for (const trophy of trophies) {
    const isEarned = Boolean(earned[trophy.id]);
    const masked = trophyIsSpoilerMasked(trophy, spoilersHidden, earned);
    const row = document.createElement('li');
    row.className = 'trophy-row' + (isEarned ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : '') + (masked ? ' spoiler-masked' : '');
    row.dataset.id = trophy.id;
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    const shownName = masked ? 'Hidden trophy — earn it to reveal it' : escapeHtml(trophy.name);
    const shownDesc = masked ? 'A story trophy, hidden until earned.' : escapeHtml(trophy.description);
    row.innerHTML =
      `<input type="checkbox" ${isEarned ? 'checked' : ''} aria-label="Mark ${escapeHtml(trophy.name)} earned">` +
      `<div><div class="trophy-name">${shownName}</div>` +
      `<div class="trophy-desc">${shownDesc}</div>` +
      `<div class="trophy-tags">` +
      `<span class="tag grade-${trophy.grade}">${escapeHtml(trophy.grade)}</span>` +
      (kindLabel(trophy.kind).toLowerCase() === trophy.grade ? '' : `<span class="tag">${escapeHtml(kindLabel(trophy.kind))}</span>`) +
      (trophy.hidden ? `<span class="tag hidden-trophy">Hidden</span>` : '') +
      (trophy.missable ? `<span class="tag missable">Missable</span>` : '') +
      (trophy.target ? `<span class="tag">Target: ${escapeHtml(String(trophy.target))}</span>` : '') +
      `</div></div>` +
      `<span class="grade-pill">${escapeHtml(gradeLabel(trophy.grade))}</span>`;
    listElement.appendChild(row);
  }
  const shown = trophies.length;
  const totalEarned = Object.keys(earned).length;
  if (writeMeta) {
    document.getElementById('list-meta').textContent =
      `Showing ${shown} of ${state.allCount} trophies · ${totalEarned} earned overall`;
  }
}

export function renderDetail(panel, trophy, earned, spoilersHidden, sourcesByKey) {
  if (!trophy) {
    panel.innerHTML =
      `<div class="detail-empty"><h2>Pick a trophy</h2>` +
      `<p>Select any trophy on the left to see its guide here: what to do, where and how, when it can be missed, and the sources the guide draws on.</p></div>`;
    return;
  }
  const isEarned = Boolean(earned[trophy.id]);
  const masked = trophyIsSpoilerMasked(trophy, spoilersHidden, earned);
  if (masked) {
    panel.innerHTML =
      `<h2>Hidden trophy</h2>` +
      `<p class="detail-official">This is a story trophy, hidden on PlayStation until it is earned. Turn off “Hide story spoilers” to see its name and guide, or earn it in the game first.</p>` +
      `<div class="detail-section"><h3>How to reveal it</h3><p>Play the story. Hidden trophies in this list are the chapter, mission and finale trophies — they pop as you play, and the spoiler setting keeps their names out of sight until then.</p></div>`;
    return;
  }
  const sourceLinks = (trophy.sources || []).map((key) => {
    const source = sourcesByKey[key];
    if (!source) return escapeHtml(key);
    return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a>`;
  }).join(' · ');
  panel.innerHTML =
    `<h2>${escapeHtml(trophy.name)}</h2>` +
    `<p class="detail-official"><span class="label">Official</span><br>${escapeHtml(trophy.description)}<br>` +
    `${escapeHtml(gradeLabel(trophy.grade))} · ${escapeHtml(kindLabel(trophy.kind))}` +
    (trophy.hidden ? ' · Hidden on PlayStation' : '') +
    (trophy.target ? ` · Target: ${escapeHtml(String(trophy.target))}` : '') +
    ` · ${isEarned ? 'Earned' : 'Not yet earned'}</p>` +
    (trophy.missable
      ? `<div class="warn-box"><strong>Missable — read this first.</strong><p>${escapeHtml(trophy.missableNote || 'This trophy can be missed. Keep a manual save before the point of no return described in the guide below.')}</p></div>`
      : '') +
    `<div class="detail-section"><h3>What to do</h3><p>${escapeHtml(trophy.guide)}</p></div>` +
    (trophy.deeper
      ? `<div class="detail-section"><h3>Going deeper</h3><p>${escapeHtml(trophy.deeper)}</p></div>`
      : '') +
    `<div class="detail-section"><h3>Sources</h3><p class="source-line">${sourceLinks}</p>` +
    `<p class="source-line">Guide written in our own words for this guide. The official name and description are shown as PlayStation publishes them.</p></div>`;
}

export function renderRoadmap(timeline, trophies, earned) {
  timeline.innerHTML = '';
  for (const phase of PHASES) {
    const members = trophies.filter((t) => t.phase === phase.id);
    const got = members.filter((t) => earned[t.id]).length;
    const pct = members.length ? Math.round((got / members.length) * 100) : 0;
    const item = document.createElement('li');
    item.className = 'timeline-phase' + (got === members.length && members.length > 0 ? ' done' : '');
    item.innerHTML =
      `<div class="phase-card"><div class="phase-head"><h3>${escapeHtml(phase.title)}</h3>` +
      `<span class="phase-count">${got} / ${members.length} earned</span></div>` +
      `<p>${escapeHtml(phase.blurb)}</p>` +
      `<div class="phase-track"><div class="phase-fill" style="width:${pct}%"></div></div>` +
      `<ul class="phase-trophies">` +
      members.map((t) => `<li class="${earned[t.id] ? 'earned' : ''}">${escapeHtml(t.name)}</li>`).join('') +
      `</ul></div>`;
    timeline.appendChild(item);
  }
}

export function renderMissableList(listElement, trophies, state) {
  const missable = trophies.filter((t) => t.missable);
  renderTrophyList(listElement, missable, { ...state, allCount: trophies.length }, { writeMeta: false });
}

export function renderSources(listElement, sources) {
  listElement.innerHTML = '';
  for (const source of sources) {
    const item = document.createElement('li');
    item.innerHTML = `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a> — ${escapeHtml(source.covers)}.`;
    listElement.appendChild(item);
  }
}
