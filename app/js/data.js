// Trophy data: loads app/data/trophies.json, and carries the roadmap phases
// and the kind labels the filters use. The phases are built from the
// official descriptions — which story chapters and missions, which
// collectibles and counts, in what order. Nothing here is fetched from
// the network at run time beyond the app's own data file.

export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load the trophy list.');
  return response.json();
}

export const KINDS = [
  { key: 'all', label: 'All kinds' },
  { key: 'story', label: 'Story' },
  { key: 'side', label: 'Side stories' },
  { key: 'activity', label: 'Activities' },
  { key: 'robbery', label: 'Robberies' },
  { key: 'world', label: 'World & money' },
  { key: 'oddity', label: 'Oddities' },
  { key: 'platinum', label: 'Platinum' },
];

export const PHASES = [
  {
    id: 'story',
    title: 'Phase 1 — Play the story',
    blurb: 'The five chapter trophies, the finale gold and the six mission trophies. Twelve trophies, all unmissable, earned by playing the campaign through. Keep a manual save from the start of every chapter.',
  },
  {
    id: 'side',
    title: 'Phase 2 — Side stories',
    blurb: 'The five named side-story finales — Andy, Kenton, Billy, Randy and Tyrone — plus the eight stranger strands and Bret’s hunting questline. All stay open after the credits.',
  },
  {
    id: 'activity',
    title: 'Phase 3 — Activities & skills',
    blurb: 'One try at each of the nine activity types, 250 stunts, 42 shooting-range gold medals, a drone race won at each of 14 locations, 20 different races won, and 50 Challenges.',
  },
  {
    id: 'robbery',
    title: 'Phase 4 — Robberies & the duo',
    blurb: 'Jewelry stores, five bank vaults, an armored truck, one illegal operation from each of the nine gangs — and the partner trophies, which need Jason and Lucia together.',
  },
  {
    id: 'world',
    title: 'Phase 5 — Leonida, explored',
    blurb: 'The whole map, 100 vehicles discovered, 100 WAiNK photos, three card sets, every meditation spot, $250,000 laundered, $100,000 spent and all eight garages bought.',
  },
  {
    id: 'endgame',
    title: 'Phase 6 — Oddities & the platinum',
    blurb: 'The small hidden moments — a cocktail on Ocean Beach, a showroom exit, a bowling alley follow-through — then the 100% checklist for A Long Road, and Vice Got a Price! pops last.',
  },
];

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  const found = KINDS.find((entry) => entry.key === kind);
  return found ? found.label : kind;
}
