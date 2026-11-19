// Leonida Trophy Ledger — the hand-in program for gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is the static site in app/ (index.html, style.css, app.js and data/trophies.json): it opens in a
// desktop browser, works with the network off, and keeps its checklist in the browser. This program's only job is
// the hand-in: copy app/ and screenshots/ from beside this file into the output directory and write dossier.json
// there with buildDossier from vendor/makefun-frontend.ts. The vendored library must stay byte-for-byte the kit's
// copy, because the scorer rebuilds the dossier with its own copy and compares the two.
//
// Run it outside the grader with a stand-in output directory:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Try the guide itself with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below are the scorer's own (reference/gate.json): the dossier text cap, at most 4 screenshots of at
// most 256 KiB each, and app/ at most 993 entries and 48 MiB. Passing them here means buildDossier refuses an
// entry the scorer would refuse, instead of writing a dossier that cannot match.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log('Leonida Trophy Ledger handed in to ' + outputDir + ' — app/ and screenshots/ copied, dossier ' + dossier.length + ' bytes');
