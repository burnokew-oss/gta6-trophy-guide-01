# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Ledger** — an offline trophy guide and platinum tracker for Grand Theft Auto VI on PlayStation 5. It covers all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, none of them online), each with its official name, description and grade, plus a guide written for this entry in its own words, numbered steps, an honest missable verdict, a roadmap stage, and named sources cited beside the guide.

## What it does

- **Tracker with real data** — the full official list from the first screen, with live counters computed from the data: total earned, percentage, and per-grade progress.
- **Checklist that sticks** — tick trophies off and progress is saved in the browser (localStorage); **export** it to a JSON file and **import** it back on any machine.
- **Filters and search** — by kind (story, side strands, collectibles, activities, feats, completion, platinum), by grade, by earned status, a missable-watch filter, and full-text search across names, descriptions and guides.
- **Spoiler shield** — when on, the names and descriptions of story trophies stay covered until you earn them; grades and kinds remain visible so you can still plan.
- **Roadmap to the platinum** — four stages with hour estimates and the trophies in each (story first with the Chapter 1 warning, strands and first-tries alongside, the 100% checklist after the credits, then the economy clean-up), plus a missable watchlist with honest tiers: one trophy is flagged *possibly* missable — Positive Mental Attitude, over a Chapter 1 meditation whose required status is still unconfirmed — and the stranger-strand finales are marked *watch*, because their givers pause during story beats but return in free-roam.
- **A guide for every trophy** — what to do, in what order, and when it can be missed, with the PlayStation target count where one exists (250 stunts, 42 range golds, 18 meditations, 500 choices, $250,000 laundered, and more).
- **Sources view** — every source used, what it was used for, and how many trophy guides cite it.
- **Fully offline** — static files only; the app loads nothing from the network. Source links open only if you click them. No Rockstar artwork or game screenshots; the look is original CSS.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Any static file server pointed at `app/` works just as well — there is no build step.

To produce the competition hand-in exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` with the vendored make.fun library.

## Sources

Official names, descriptions and grades follow the PlayStation list as published by Exophase and cross-checked on PSNProfiles (which also supplies the tracked target counts). Methods, roadmap structure and the missable warning were researched from the PowerPyx, GTABase, Push Square and KeenGamer trophy guides and rewritten in original words — each trophy's guide names its sources in the app, and the Sources tab lists them all with links. Where sources disagreed, grades follow the official list and the disagreement is noted in the guide.

## License

MIT — see `LICENSE`. An unofficial fan guide; not affiliated with Rockstar Games or PlayStation. Trophy names and descriptions are shown as published by PlayStation.

---

<sub>Entered on [make.fun](https://make.fun/?ref=d2zmzjc5&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
