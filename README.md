# Leonida Trophy Guide — GTA VI Platinum Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/c/gta6-trophy-guide-01) ($250, top 50 share).

## What it is

- **The official list** — all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden) with the exact official name, description and grade as PlayStation publishes them.
- **A tracker** — a checklist saved in your browser (localStorage), with export and import of your progress, filters by kind, grade and status, a missable-only filter and a search box.
- **A spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **A roadmap to the platinum** — six phases laid out as a connected timeline, each with its own progress bar and earned count, built from the official descriptions.
- **Missable warnings** — the missable trophies flagged, with a clear warning callout in the trophy's detail view.
- **A guide to every trophy** — what to do, where and how, when it can be missed, plus a "Going deeper" note, all in our own words and with sources cited per trophy.

The guide is not affiliated with Rockstar Games, Sony or PlayStation, and uses no Rockstar logo or official artwork.

## How to run it

```sh
node serve.ts
```

Then open <http://localhost:8080> in desktop Chrome. The guide is plain static files under `app/` — no build step, no network requests, it works with the network off.

## How it is handed in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Official names, descriptions and grades come from the Exophase PS5 trophy page and PSNProfiles, cross-checked against Planet GTA 6 and Output Lag. Each trophy's guide names its sources in the app; see the Sources tab for the full list.

## Screenshots

The four screenshots under `screenshots/` are real renders of the guide running in desktop Chrome: the tracker list, a trophy's detail panel, the roadmap timeline, and the spoiler masking at work. The first by name is the cover.
