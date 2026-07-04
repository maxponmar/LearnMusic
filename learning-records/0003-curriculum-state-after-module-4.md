# Curriculum state after Module 4 (Pentatonic + CAGED)

**Status:** active

Modules 0–2 were already authored (7 lessons + 2 references — see
`0002-curriculum-state-after-module-2.md`). This session added **Module 4 —
Pentatonic + CAGED**: 3 new lessons, 1 reference page, and a pentatonic
render mode in the Fretboard Lab and embedded lesson fretboards.

The learner's standing for this session: "Just author Module 4 — don't pace
me, I'll work through everything in order." So Module 4 content is
authored ahead of the learner's actual practice; the zones-of-proximal-
development check for Module 4 (does the learner actually have the major
scale + diatonic chords solid?) is deferred to when they arrive at the
Module 4 lessons in their own practice sequence.

## What's been delivered (this session)

**Module 4 — Pentatonic + CAGED**
- `lessons/0008-pentatonic-scale.html` — what pentatonic is, why it
  removes degrees 4 & 7, major vs minor, the relative-minor identity
- `lessons/0009-caged.html` — the five moveable pentatonic positions,
  CAGED cycle order, move-a-shape-up-to-change-key, minor shares shapes
- `lessons/0010-pentatonic-over-progressions.html` — stay-home vs
  follow-the-chord, taste habits (space + repeat-before-vary), worship
  rule of thumb
- `reference/pentatonic-and-caged.html` — quick-reference cheat sheet

**App — pentatonic render mode**
- `packages/theory/src/context.ts` — new `pentatonicContext(tonic, mode)`
  builds a FretboardContext with only 5 notes, re-numbered 1–5; reuses
  the key-signature spelling engine so enharmonics stay correct (F# in D,
  not Gb). Degrees 1,2,3,5,6 for major; 1,3,4,5,7 for natural minor.
- `packages/theory/src/context.test.ts` — 5 new tests covering G maj pent,
  E min pent (= G maj pent notes), the pentatonic-degree re-numbering,
  D major spelling (F# not Gb), the 2 excluded degrees, fretNotes
  filtering. All 41 theory tests pass.
- `apps/web/.../components/Fretboard.tsx` — new `pentatonic` prop
  (`PentatonicKind = "off" | "major" | "minor"`). When set, uses
  `pentatonicContext`; same dot-rendering logic. aria-label updates.
- `apps/web/.../components/LessonFretboard.tsx` — lessons can embed
  `<div data-fretboard data-pentatonic="major" ...>`; the data attribute
  flows through to the live fretboard. All 3 new lessons + the relative
  lesson in 0007 use this for embedded live pentatonic fretboards.
- `apps/web/.../routes/FretboardLab.tsx` — new "Pent:" control group
  (Full scale | Major pent. | Minor pent.) alongside the existing
  key/mode selectors.

## Implications for future sessions

- **Module 4 is content-complete.** 10 lessons + 3 references total now.
- **Module 5 (Improvisation serving the song) is the only remaining authored module.**
  It depends on everything in Module 4 — motifs, dynamics, space, capo
  strategy, playing under the vocal. The mission payoff.
- **Module 3 (progressions by ear) is functionally delivered** via the
  progression drill in the ear trainer (per learning record 0002); no
  dedicated Module 3 lesson was written because lesson 0007 already
  covers the patterns and the drill is the assessment.
- **The pentatonic render mode is the only new app feature for Module 4.**
  No new ear-training drill was added — Module 4 is skills-based (improvise
  fills), not recognition-based. If a future module wants a "play this
  fill" drill, that needs mic pitch detection (deferred per decision #7
  in PLAN.md — `pitchy` when we do it).
- **The CAGED position rendering reuses existing `startFret` + `frets`
  props** — a CAGED position is just `pentatonic="major" data-start-fret="N"
  data-frets="5"`. No new "position" render mode was needed; the existing
  windowed rendering covers it. This confirms the PLAN.md prediction that
  the fretboard infra supports CAGED without new geometry.

## Open follow-ups (not blocking)
- When the learner arrives at Module 4 in real practice, verify their
  Modules 0–2 mastery informally. The records capture what was authored,
  not what the learner has internalized.
- Module 5 lesson(s) + a possible improvisation reference page.
- The push to `maxponmar/LearnMusic.git` is still blocked — the committed
  initial setup + Module 4 work is local only. Confirm the correct remote
  with the user (their authenticated git user lacks write access to that
  repo).