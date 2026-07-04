# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A personal workspace for learning worship guitar **by ear** (not by memorization), with two halves that ship together:

1. **A teaching workspace** — `MISSION.md` (goals + 6-module curriculum), `lessons/` (13 HTML lessons, the source of truth for content), `reference/` (printable cheat sheets), `learning-records/` (session insights), `NOTES.md` (learner profile). The curriculum is content-complete.
2. **A full-stack app** that delivers the curriculum interactively (SVG fretboard, ear trainer, practice journal).

Built for a single learner — no auth, no multi-tenant concerns.

## Commands

```bash
pnpm install          # install all workspaces (pnpm, Node 22+ required for node:sqlite)
pnpm dev              # run web (localhost:4321) + api (localhost:3000) in parallel
pnpm db:migrate       # create/update the SQLite schema (runs apps/api/src/db/migrate.ts)
pnpm test             # all tests (vitest, in @lag/theory and @lag/api)
pnpm typecheck        # all workspaces (web also runs `astro check`)
pnpm build            # all workspaces
```

Single package / single test:

```bash
pnpm --filter @lag/theory test                          # one package's tests
pnpm --filter @lag/theory exec vitest run src/nns.test.ts   # one test file
pnpm --filter @lag/theory test:watch                    # watch mode
```

## Architecture

pnpm workspace monorepo. The dependency flow is one-directional:

```
@lag/theory  (pure music-theory functions: notes, scales, keys, NNS, fretboard geometry)
@lag/shared  (zod schemas = the web ↔ api contract, single source of truth)
     ↑ both consumed by ↑
apps/api     (Express + node:sqlite)
apps/web     (Astro shell + one React island)
```

- **`packages/theory` and `packages/shared` are source-exported** — their `main`/`exports` point at `src/index.ts` directly. No build step; consumers compile them.
- **`apps/api` uses Node's built-in `node:sqlite`, not better-sqlite3, and hand-written SQL, not Drizzle.** `apps/api/src/db/schema.ts` is Drizzle-*style* documentation only; the runtime goes through the thin typed helpers in `db/client.ts` (`run`, `all`, `get`, `insertReturning`). Migrations are plain SQL applied by `db/migrate.ts`. Don't introduce an ORM or native SQLite bindings — see `docs/PLAN.md` §5–6 for why.
- **`apps/web` is Astro for static surfaces, React SPA for the app.** Astro renders the landing page and lesson reader (static, printable, SEO). The interactive app is one `client:only="react"` island (`src/components/AppIsland.tsx`) mounted at `/app/*` (`pages/app/[...slug].astro`), with React Router handling in-app navigation. Tailwind v4, Motion for animation, Tone.js for audio.
- **The fretboard is hand-built SVG** (`apps/web/src/app/components/Fretboard.tsx`) driven entirely by `@lag/theory` — multiple render modes (notes-by-key, scale positions, pentatonic). Don't reach for a fretboard library.
- **Ear training is app-plays-only** — the app plays audio, the user identifies. No mic/pitch detection in v1 (deliberate; see `docs/PLAN.md` §7).

## Conventions

- `docs/PLAN.md` records every major decision with alternatives considered. When a decision changes, update it there — don't delete history.
- Lessons in `lessons/` are numbered (`0001-…` to `0013-…`), self-contained, citation-laden HTML; `reference/` follows the same style. The web lesson reader serves this content — lessons are authored here, not in the app.
- Curriculum/teaching changes should stay within the mission's scope constraints (`MISSION.md` "Out of scope" section): acoustic worship guitar, functional/scale-degree ear training, keys G/D/C/A with capo.
