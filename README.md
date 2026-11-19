# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that works as a guide and tracker for all 55 PS5 trophies in GTA VI. Every trophy comes with its official name, description, and grade, a checklist that saves in the browser, a roadmap to Platinum, and a per-trophy guide written in our own words with sources cited. It runs offline in a desktop browser from static files.

Bounty page: https://make.fun/competitions/gta6-trophy-guide-01

## What it does

- All 55 official trophies — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden — each with its own guide.
- A checklist tracker with export and import, so progress survives across sessions.
- Filtering and search across the full trophy list.
- A spoiler setting that hides hidden-trophy details until you choose to reveal them.
- A six-phase Platinum roadmap that orders the journey from first steps to the final trophy.
- Missable trophies clearly flagged, so nothing gets locked out by accident.
- Honest about the five cryptic trophies whose methods were still unconfirmed at launch — no invented methods, just what is actually known.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node 22, standard library only. Original design, lettering, and code — no Rockstar logo or official artwork. MIT licensed.
