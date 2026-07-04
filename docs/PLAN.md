# Plan & Architecture Decisions

This captures the *why* behind the build — the alternatives considered and
why each major decision was made. The research that backs these is in
`RESOURCES.md` (pedagogy) and was gathered in three parallel research runs
(tech). Update this file when a decision changes; don't delete history.

## Table of contents
1. [Pedagogy: curriculum arc](#1-curriculum-arc)
2. [Pedagogy: ear-training method](#2-ear-training-method)
3. [Tech: monorepo with pnpm workspaces](#3-monorepo)
4. [Tech: Astro + one big React island](#4-astro--react-island)
5. [Tech: node:sqlite over better-sqlite3](#5-nodesqlite-over-better-sqlite3)
6. [Tech: hand-written SQL over Drizzle's node-sqlite driver](#6-hand-written-sql-over-drizzle)
7. [Tech: app-plays quizzes, no mic, for v1](#7-app-plays-quizzes-only)
8. [Tech: hand-built SVG fretboard](#8-hand-built-svg-fretboard)

---

## 1. Curriculum arc
**Decision:** Six modules — fretboard → intervals/major scale → diatonic
chords + NNS → progressions by ear → pentatonic/CAGED → improvisation.

**Why:** Synthesized from musictheory.net's lesson ordering, JustinGuitar's
Practical Music Theory course, Tom Kolb's *Music Theory for Guitarists*, and
Tommaso Zillio's "learn in the right order" argument. Module 3 (progressions
by ear) is placed where the curriculum delivers the first mission-critical
win: hearing a worship chorus and playing it.

**Alternative considered:** Start with the Nashville Number System directly
(mission tie-in is strongest there). Rejected because NNS requires
understanding keys and diatonic chords first — without that scaffolding it
becomes rote memorization, which is exactly what the learner is trying to
escape.

## 2. Ear-training method
**Decision:** Functional / scale-degree (movable-Do) ear training as the
primary method, with light interval work only for chord-quality recognition.

**Why:** Scale-degree recognition maps directly onto the Nashville Number
System the learner will use, and onto "which fret in this scale am I hearing."
Functional hearing gives one stable reference (the key center) instead of
measuring pairwise interval distances. Cross-source consensus among jazz/theory
educators (Jeff Schneider, Music StackExchange, Functional Ear Trainer docs).

**Honest gap:** No peer-reviewed head-to-head data exists for guitarists
specifically. The decision rests on expert consensus.

## 3. Monorepo
**Decision:** Single git repo, pnpm workspaces, no Turborepo.

**Why:** Frontend and backend share an API contract (the zod schemas in
`packages/shared`); a monorepo makes that contract one import away and
prevents the type drift that two repos guarantee. pnpm workspaces alone give
us everything; Turborepo's caching is overkill for 4 packages with sub-second
builds.

## 4. Astro + React island
**Decision:** Astro for the landing + lesson reader (static, SEO); one
`client:only="react"` island mounts the full interactive app (fretboard, ear
trainer, journal with shared client state).

**Why:** The app is ~90% interactive — shared state between fretboard, audio
engine, and journal. Astro's islands shine when most of the page is static;
here we'd hydrate most of it anyway. So: static content gets Astro's benefits
(minimal JS, SEO), and the app shell is honestly a React SPA mounted as one
island. React Router handles in-app navigation.

**Alternative considered:** Pure Vite React SPA. Rejected because Astro buys
us real value on the lesson-reader surface (printable, SEO-friendly, fast)
that's worth the small extra setup.

## 5. node:sqlite over better-sqlite3
**Decision:** Use Node's built-in `node:sqlite` (Node 22+) instead of
`better-sqlite3`.

**Why:** On Node 26 (the learner's environment), `better-sqlite3`'s native
bindings fail to compile against the new V8 C++ API. `node:sqlite` ships with
Node, needs no native build, and is plenty fast for a single-user app. One
fewer fragile dependency.

## 6. Hand-written SQL over Drizzle
**Decision:** Use `node:sqlite` directly with thin typed helpers, instead of
Drizzle's ORM layer.

**Why:** Drizzle's `node-sqlite` driver is only in the 1.0 RC line; the stable
0.38 line doesn't export it. `drizzle-kit` migrations don't support
`node:sqlite` at all. For four small tables on a single-user app, hand-written
SQL with thin wrappers (`run`, `all`, `get`, `insertReturning`) is clearer
than fighting version pinning. The Drizzle-style schema reference is kept in
`apps/api/src/db/schema.ts` as documentation; the runtime uses SQL directly.

**Alternative considered:** Pin Drizzle 1.0 RC. Rejected — betting the data
layer on an RC for a single-user app adds risk without payoff.

## 7. App-plays quizzes only
**Decision:** Ear training is "app plays → user identifies" only. No mic-based
pitch detection in v1.

**Why:** Every browser pitch-detection option worth using (pitchy, pitchfinder,
ml5/CREPE) is monophonic and real-time — it can grade single notes but not
chords or melodies. The only polyphonic option (Spotify's Basic Pitch) is
offline and too heavy for instant feedback. App-plays quizzes deliver ~90% of
the learning value at ~5% of the engineering risk. When/if we add a "play this
note" tuner later, the plan is `pitchy` (smallest, dependency-light).

## 8. Hand-built SVG fretboard
**Decision:** Hand-build the fretboard as SVG driven by `@lag/theory`, instead
of using a library.

**Why:** The fretboard is the app's centerpiece, and we need three render
modes (notes-by-key, chord-shape, scale-position). Off-the-shelf libraries
(`react-guitar`, `react-fretboard`) either don't cover all three modes or are
abandoned. The geometry is simple (note-per-fret = pure function of string
root + fret), so a hand-built SVG is ~300 lines with no library ceiling. Chord
fingerings will be sourced from `@tombatossals/chords-db` (data only, not
rendering).
