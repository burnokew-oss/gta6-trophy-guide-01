// Leonida Ledger — entry program for the gta6-trophy-guide-01 bounty (Node 22, standard library only).
//
// The guide itself is the static web app in app/ next to this file: plain HTML, CSS and JavaScript plus
// app/data/trophies.json, opening at app/index.html in a desktop browser and working with the network off.
// This program's single job is to hand that guide in: copy app/ and screenshots/ from this repository into
// the output directory and write dossier.json there with buildDossier from vendor/makefun-frontend.ts, so
// the judge receives exactly the screenshots and source the gate expects. The vendored library file is the
// kit's own copy and must stay untouched — the scorer rebuilds the dossier with its copy and compares.
//
// Run it locally the same way the grader does, with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Preview the app itself with: node serve.ts  (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Fresh output tree: the app first, then the screenshots beside it.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, "app"), join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(repoDir, "screenshots"))) {
  cpSync(join(repoDir, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

// Dossier limits follow the scorer's caps for this bounty: the text budget shapes the bytes, and the
// screenshot / app-size limits refuse anything the gate itself would refuse.
const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossierBytes);
