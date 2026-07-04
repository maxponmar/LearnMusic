# Notes — preferences & working context

## Learner profile
- Plays acoustic guitar; purpose is to lead/play worship for God.
- Already comfortable with open chords; can play several worship songs from
  memory. Has *not* studied theory or scales.
- Wants to break out of "I only know the songs I've memorized" — play by ear
  and improvise.
- Repertoire context: contemporary worship (Hillsong, Bethel, Elevation,
  Chris Tomlin, Phil Wickham). Keys G/D/C/A, heavy capo use.

## Teaching preferences
- (none yet recorded — update as the learner expresses them.)

## Decisions baked into the build
- **Stack:** Astro + React SPA island + Tailwind v4 + Motion; Express + TS +
  `node:sqlite` (no native `better-sqlite3` — Node 26 broke its build; the
  built-in driver is plenty for a single-user app). zod contract shared via
  workspace package.
- **Ear training:** app-plays quizzes only for v1 (no mic pitch detection).
  When the user is ready for a "play this note" tuner, use `pitchy`.
- **Audio:** Tone.js + Sampler with acoustic-guitar OGG samples (Phase 2).
- **Fretboard:** hand-built SVG driven by `@lag/theory`; chord fingerings from
  `@tombatossals/chords-db` (data only). No VexFlow.

## Open questions for the learner
- What does your church actually sing? (Specific songs help ground lessons.)
- Do you have a capo and are you comfortable using it?
- Any worship guitarist/teacher whose style you particularly want to emulate?
