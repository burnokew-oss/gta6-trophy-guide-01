# Leonida Trophy Guide

An offline web app that is the best guide and tracker for the 55
PlayStation 5 trophies of Grand Theft Auto VI — every trophy with its
official name, description and grade, a checklist saved in the browser,
a roadmap to the platinum, and a guide to each trophy in our own words
with sources cited. It runs offline in a desktop browser from its own
static files; no network is needed.

Bounty: [gta6-trophy-guide-01 on make.fun](https://make.fun/competitions/gta6-trophy-guide-01)

## What it does

- **All 55 official trophies**: exact official name, description and
  grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden), each with
  a guide in our own words — what to do, where and how, and when it can
  be missed — with sources cited.
- **Tracker**: checklist saved in the browser, with export and import of
  progress, filters by grade and kind, and search.
- **Spoiler setting**: story trophies stay hidden until they are earned.
- **Roadmap to the platinum**: a 6-phase roadmap built from the official
  descriptions, with the missable trophies flagged.
- **Honest where it matters**: five cryptic trophies whose methods were
  unconfirmed at launch say so instead of inventing one.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node 22, standard library only. Original design, lettering and code — no
Rockstar Games logo or official artwork is used. MIT licensed.
