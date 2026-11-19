// Boot: loads the trophy list, wires the toolbar, the tabs and the detail
// panel, and keeps the checklist, the filters and the spoiler setting in
// sync. Everything runs from the app's own files — no network requests.

import { loadTrophyData, KINDS } from './data.js';
import { loadProgress, saveProgress, toggleEarned, exportProgress, importProgressFile } from './store.js';
import { renderHeader, renderTrophyList, renderDetail, renderRoadmap, renderMissableList, renderSources } from './views.js';

const state = {
  trophies: [],
  sources: [],
  sourcesByKey: {},
  earned: loadProgress(),
  kind: 'all',
  grade: 'all',
  status: 'all',
  missableOnly: false,
  spoilersHidden: false,
  search: '',
  selectedId: null,
  allCount: 0,
};

function applyFilters() {
  const query = state.search.trim().toLowerCase();
  return state.trophies.filter((trophy) => {
    if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.status === 'earned' && !state.earned[trophy.id]) return false;
    if (state.status === 'remaining' && state.earned[trophy.id]) return false;
    if (state.missableOnly && !trophy.missable) return false;
    if (query && !`${trophy.name} ${trophy.description}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

function renderAll() {
  renderHeader(state.trophies, state.earned);
  renderTrophyList(document.getElementById('trophy-list'), applyFilters(), state);
  const selected = state.trophies.find((t) => t.id === state.selectedId) || null;
  renderDetail(document.getElementById('detail-panel'), selected, state.earned, state.spoilersHidden, state.sourcesByKey);
  renderRoadmap(document.getElementById('timeline'), state.trophies, state.earned);
  renderMissableList(document.getElementById('missable-list'), state.trophies, state);
}

function selectTrophy(id) {
  state.selectedId = id;
  renderAll();
  const panel = document.getElementById('detail-panel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function buildKindChips() {
  const row = document.getElementById('kind-chips');
  row.innerHTML = '';
  for (const kind of KINDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (state.kind === kind.key ? ' active' : '');
    chip.dataset.kind = kind.key;
    chip.textContent = kind.label;
    chip.addEventListener('click', () => {
      state.kind = kind.key;
      buildKindChips();
      renderAll();
    });
    row.appendChild(chip);
  }
}

function wireToolbar() {
  document.getElementById('search').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderAll();
  });
  document.getElementById('grade-filter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderAll();
  });
  document.getElementById('status-filter').addEventListener('change', (event) => {
    state.status = event.target.value;
    renderAll();
  });
  const missableBtn = document.getElementById('missable-only');
  missableBtn.addEventListener('click', () => {
    state.missableOnly = !state.missableOnly;
    missableBtn.setAttribute('aria-pressed', String(state.missableOnly));
    renderAll();
  });
  const spoilerBtn = document.getElementById('spoiler-toggle');
  spoilerBtn.addEventListener('click', () => {
    state.spoilersHidden = !state.spoilersHidden;
    spoilerBtn.setAttribute('aria-pressed', String(state.spoilersHidden));
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', () => exportProgress(state.earned));
  const importInput = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    try {
      state.earned = await importProgressFile(file);
      renderAll();
    } catch (error) {
      alert(`Could not import that file: ${error.message}`);
    }
    importInput.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
    state.earned = {};
    saveProgress(state.earned);
    renderAll();
  });
}

function wireTabs() {
  const tabs = [...document.querySelectorAll('.view-tab')];
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      for (const other of tabs) other.classList.toggle('active', other === tab);
      for (const view of document.querySelectorAll('.view')) {
        view.classList.toggle('active', view.id === `view-${tab.dataset.view}`);
      }
    });
  }
}

function wireListClicks() {
  const list = document.getElementById('trophy-list');
  list.addEventListener('click', (event) => {
    const row = event.target.closest('.trophy-row');
    if (!row) return;
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (checkbox) {
      state.earned = toggleEarned(state.earned, row.dataset.id);
      renderAll();
      return;
    }
    selectTrophy(row.dataset.id);
  });
  list.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = event.target.closest('.trophy-row');
    if (!row) return;
    event.preventDefault();
    selectTrophy(row.dataset.id);
  });
  const missableList = document.getElementById('missable-list');
  missableList.addEventListener('click', (event) => {
    const row = event.target.closest('.trophy-row');
    if (!row) return;
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (checkbox) {
      state.earned = toggleEarned(state.earned, row.dataset.id);
      renderAll();
      return;
    }
    selectTrophy(row.dataset.id);
    document.querySelector('.view-tab[data-view="tracker"]').click();
  });
}

async function boot() {
  const data = await loadTrophyData();
  state.trophies = data.trophies;
  state.sources = data.sources || [];
  state.allCount = state.trophies.length;
  for (const source of state.sources) state.sourcesByKey[source.key] = source;
  buildKindChips();
  wireToolbar();
  wireTabs();
  wireListClicks();
  renderSources(document.getElementById('source-list'), state.sources);
  // Keep two tabs of the guide in sync: if progress changes elsewhere,
  // reload it and re-render.
  window.addEventListener('storage', (event) => {
    if (event.key === 'leonida-trophy-guide-v1') {
      state.earned = loadProgress();
      renderAll();
    }
  });
  // Open on the first trophy so the detail panel is never empty.
  state.selectedId = state.trophies[0] ? state.trophies[0].id : null;
  renderAll();
}

boot().catch((error) => {
  document.getElementById('detail-panel').innerHTML =
    `<div class="detail-empty"><h2>The guide could not load</h2><p>${error.message}</p></div>`;
});
