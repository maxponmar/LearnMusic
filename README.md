# Learn Acoustic Guitar

A personal learning workspace + web app for learning to play worship guitar **by ear** and improvise — not by memorizing songs.

> "Sing to him a new song; play skillfully, and shout for joy." — Psalm 33:3

## What this is

Two things, together:

1. **A teaching workspace** (root-level `MISSION.md`, `lessons/`, `reference/`, `learning-records/`) — the curriculum, grounded in high-trust sources. Lessons are beautiful, printable, citation-laden HTML.
2. **A full-stack web app** that delivers the curriculum interactively — an SVG fretboard, an ear-training player, and a practice journal — backed by Express + SQLite.

## Mission summary

Play worship songs for God **without depending on memorization** — hear a song and play it, improvise tastefully under vocals. See [`MISSION.md`](./MISSION.md) for the full mission and success criteria.

## Monorepo layout

```
apps/
  web/         Astro + React + Tailwind + Motion  (the learning app)
  api/         Express + TypeScript + Drizzle + SQLite
packages/
  shared/      zod schemas = the API contract (single source of truth)
  theory/      pure music-theory functions (notes, scales, chords, NNS)
lessons/       teach-skill HTML lessons (source of truth for content)
reference/     printable reference / cheat sheets
learning-records/   decision-grade insights from sessions
```

## Getting started

```bash
pnpm install                 # install all workspaces
pnpm db:migrate              # create the SQLite schema
pnpm dev                     # run web + api in parallel
```

- Web app: http://localhost:4321
- API: http://localhost:3001/health

## Phased roadmap

- **Phase 1 (foundation):** monorepo, theory module + tests, first lesson, teach-workspace docs. ← _current_
- **Phase 2:** SVG fretboard, Tone.js audio engine, practice journal UI.
- **Phase 3:** first ear trainer (scale-degree + chord-quality recognition).
- **Phase 4:** progressions-by-ear drills (the first mission-critical payoff).
- **Phase 5+:** improvisation drills, CAGED, transcription workouts.

See [`docs/PLAN.md`](./docs/PLAN.md) for the full plan and rationale.
