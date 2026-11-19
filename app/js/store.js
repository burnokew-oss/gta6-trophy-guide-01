// Progress store: the checklist lives in localStorage, so it survives a
// reload and never leaves the player's browser. Export writes it to a file;
// import reads such a file back.

const STORAGE_KEY = 'leonida-trophy-guide-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const earned = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (value === true) earned[id] = true;
    }
    return earned;
  } catch {
    return {};
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
  } catch {
    // A full or blocked store just means this visit is not saved.
  }
}

export function toggleEarned(earned, id) {
  const next = { ...earned };
  if (next[id]) delete next[id];
  else next[id] = true;
  saveProgress(next);
  return next;
}

export function earnedCount(earned) {
  return Object.keys(earned).length;
}

export function exportProgress(earned) {
  const payload = { app: 'leonida-trophy-guide', version: 1, earned: Object.keys(earned).sort() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leonida-trophy-progress.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function importProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  // Accept both shapes: the file exportProgress writes ({ earned: [...] })
  // and a bare array of trophy ids.
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('That file holds no earned list.');
  const earned = {};
  for (const id of list) {
    if (typeof id === 'string' && id) earned[id] = true;
  }
  saveProgress(earned);
  return earned;
}
