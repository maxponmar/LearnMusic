/**
 * @lag/theory — pure music-theory functions for the worship-guitar learning app.
 *
 * No DOM, no I/O, no side effects. Everything here is a pure function of its
 * inputs, which makes it easy to test exhaustively and safe to call from both
 * the React frontend (fretboard rendering, ear-training prompts) and the
 * Express backend (progression generation, prompt authoring).
 *
 * Modules:
 *  - `notes`     — pitch classes, spelled notes, MIDI helpers
 *  - `keys`      — major/minor scales with correct spelling, diatonic triads
 *  - `fretboard` — pure geometry of the standard-tuned 6-string guitar
 *  - `nns`       — Nashville Number System + common worship progressions
 *  - `scales`    — pentatonic scales for improvisation
 *  - `capo`      — open-shape + capo-fret suggestion for any key
 */

export * from "./notes.js";
export * from "./keys.js";
export * from "./fretboard.js";
export * from "./nns.js";
export * from "./scales.js";
export * from "./context.js";
export * from "./capo.js";
