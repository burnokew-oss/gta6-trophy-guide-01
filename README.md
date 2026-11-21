# Leonida Trophy Ledger


An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the make.fun bounty `gta6-trophy-guide-01`.

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/burnokew-oss/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

## What it does

- **Ledger** — every one of the 55 official trophies with its official name, description and grade; a checklist saved in the browser; filters by kind, grade and status; search; a "next up" queue in roadmap order; and a detail panel whose guide steps each cite the sources that support them.
- **Audit strip** — the header recomputes the entry's own numbers from its data: grade split, hidden count, cited guides, cited steps, missable / watch / unconfirmed / single-source / disagreement counts, and the sources read.
- **Roadmap** — five stages to the platinum with hour estimates and state-coloured trophy chips, a missable watch-list, ground rules, and a note on how the stages were built from the official descriptions.
- **Source matrix** — every trophy against every numbered source, showing how many of that trophy's steps each source supports, with single-source and disagreement flags.
- **Export / import** — progress (earned set, counters, reveals, spoiler setting) moves as JSON; hidden trophies stay covered by the spoiler shield until earned or revealed.

Missable status is honest about uncertainty: one trophy is *possibly* missable (the guides disagree), two sit on a watch list, three methods are marked unconfirmed, and every disagreement is printed where it applies instead of being smoothed over. The data as shipped: 55 guides citing at least one source, 192 of 192 guide steps carrying citations, 55 "going deeper" notes, 20 working progress counters, and a source matrix in which only 2 of the 55 guides rest on a single guide source.

## Run it

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

Or open `app/index.html` through any static file server. The app is plain static files and works with the network off; progress is kept in `localStorage`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` with the vendored make.fun library.

## Sources

The official names, descriptions and grades are reproduced as published on the public PS5 trophy lists (Exophase and PSNProfiles). All guide text is original to this entry and cites its sources by number in the app: PowerPyx, Output Lag, KeenGamer, Push Square and Planet GTA 6, read 19 Nov 2026. No Rockstar Games logo or official artwork is used.

## License

MIT — see `LICENSE`.
