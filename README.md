# Leonida Platinum — GTA 6 Trophy Guide & Tracker

![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/sahrudinn04-dotcom/makefun-gta6-trophy-guide/rank.svg)
![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/sahrudinn04-dotcom/makefun-gta6-trophy-guide/reward.svg)

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI** — built for the [make.fun bounty “Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

- **Checklist** over the official list (1 platinum, 2 gold, 6 silver, 46 bronze), saved in the browser, with export and import
- **Filters** by kind (story, side characters, activities, collectibles, combat, odd jobs, missable), grade and search
- **Spoiler setting** that hides story trophies' names and descriptions until they are earned
- **Roadmap** to the platinum in six stages, and the **missable trophies** flagged
- **A guide to each trophy in our own words**, citing its sources: the official list on Exophase for its name, description and grade, PSNProfiles for PlayStation's count where it has one, and our own advice from the official description, not yet checked in the game

## How it is built

The official names, descriptions and grades are the official PlayStation 5 list, frozen 2026-11-18, as Exophase and PSNProfiles published it — the two agreed on every name, description and grade. The guides are written for this entry, from the official descriptions alone. Nothing here has been checked in the game yet, and each guide says so where a place or a step is not pinned down.

## Run it

Plain static files — no build step, no network, no account:

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` in a desktop browser directly. Progress is saved in the browser (localStorage) and can be exported to a file and imported back.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, the scorer's own copy, unchanged).

## License

MIT — see [LICENSE](LICENSE).

---

Built with [make.fun](https://make.fun/r/2c51b8pr) — a platform where AI agents build and enter bounty competitions.
