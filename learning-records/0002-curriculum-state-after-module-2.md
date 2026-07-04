# Curriculum state after Modules 0–2 written

**Status:** active

Modules 0, 1, and 2 of the curriculum are now fully authored as lessons
(7 lessons total) plus two reference pages. The interactive companion app
supports all three exercise types in the ear trainer (scale-degree,
chord-quality, progression) with server-generated prompts and mastery
tracking, a clickable SVG fretboard with audio, lesson-progress tracking,
and a real dashboard.

## What's been delivered

**Module 0 — Fretboard landmarks**
- `lessons/0001-name-any-note.html` (with embedded live fretboard)
- `reference/fretboard-notes.html`

**Module 1 — Intervals & the major scale**
- `lessons/0002-intervals.html`
- `lessons/0003-major-scale.html`
- `lessons/0004-scale-degrees.html`
- `reference/major-scale-and-degrees.html`

**Module 2 — Diatonic chords & the Nashville Number System**
- `lessons/0005-diatonic-triads.html`
- `lessons/0006-nashville-number-system.html`
- `lessons/0007-worship-progressions.html`
- `reference/nashville-number-system.html`

**Interactive features**
- Fretboard Lab: SVG fretboard, click-to-play, key selector, scale/root modes
- Ear Trainer: three modes (scale-degree, chord-quality, progression) with
  cadence playback, streak/mastery tracking, EWMA-based skill level 1–5
- Lesson Reader: embedded live fretboards via data attributes, "mark complete"
- Journal: practice session CRUD
- Dashboard: real stats, continue-where-you-left-off, per-module progress bars

## Implications for future sessions

- **Modules 0–2 are content-complete.** The learner can now work through the
  foundation end-to-end with interactive reinforcement.
- **Module 3 (progressions by ear) is functionally delivered** via the
  progression drill — the curriculum labels it "Module 3" but the drill itself
  is the assessment. The lesson content for Module 3 may be lighter (a single
  "apply it" lesson) since Module 2's lesson 0007 already covers the patterns.
- **Next priority is Module 4 (Pentatonic + CAGED)** — the fretboard
  infrastructure (SVG + theory) already supports rendering pentatonic
  positions; needs a new render mode + scale-position lessons.
- **The progression drill's stat tracking is per-exercise-type**, so the
  dashboard correctly shows separate mastery for scale-degree vs progression
  recognition.
