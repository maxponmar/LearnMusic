/**
 * Fretboard — pure geometry of the standard-tuned 6-string guitar.
 *
 * Strings are numbered 1–6 from the **highest** string (high E) to the
 * **lowest** (low E), matching how chord diagrams are read top-to-bottom.
 * (This is the convention in virtually every guitar method book.)
 *
 * Standard tuning, string → open MIDI note:
 *   1: E4 (64)   2: B3 (59)   3: G3 (55)   4: D3 (50)   5: A2 (45)   6: E2 (40)
 *
 * Note-per-fret is a pure function: `midi = openMidi[string] + fret`.
 * Reference: https://www.musictheory.net/lessons/12
 */

import { midiToPc, type PitchClass } from "./notes.js";

export const NUM_STRINGS = 6 as const;
export const NUM_FRETS = 15 as const; // 0 (open) through 15 — covers first position + a bit beyond

/** Open MIDI notes indexed by string number (1-based). Index 0 unused for clarity. */
export const OPEN_MIDI: readonly number[] = [-1, 64, 59, 55, 50, 45, 40];

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;

/** Validate a string number. */
function assertString(s: number): asserts s is StringNumber {
  if (s < 1 || s > NUM_STRINGS || !Number.isInteger(s)) {
    throw new Error(`Invalid string ${s}; expected 1–${NUM_STRINGS}`);
  }
}

/** MIDI note at a given string/fret. Fret 0 = open string. */
export function midiAt(string: StringNumber, fret: number): number {
  assertString(string);
  if (fret < 0 || !Number.isInteger(fret)) throw new Error(`Invalid fret ${fret}`);
  return OPEN_MIDI[string]! + fret;
}

/** Pitch class at a given string/fret. */
export function pcAt(string: StringNumber, fret: number): PitchClass {
  return midiToPc(midiAt(string, fret));
}

/** Note name (e.g. "C#") at a given string/fret — enharmonic-agnostic, uses sharps by default. */
const PC_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export function noteNameAt(string: StringNumber, fret: number): string {
  return PC_NAMES_SHARP[pcAt(string, fret)]!;
}

/**
 * Find every (string, fret) position whose pitch class is in the given set,
 * within `maxFret` frets. Returns positions sorted low-to-high by MIDI.
 *
 * Used to render "all notes in G major across the neck" and "all C's on the
 * fretboard" — the two main fretboard-visualization modes.
 */
export interface FretPosition {
  string: StringNumber;
  fret: number;
  midi: number;
  pc: PitchClass;
}

export function findPositions(
  targets: PitchClass[] | Set<PitchClass>,
  maxFret: number = NUM_FRETS,
): FretPosition[] {
  const set = targets instanceof Set ? targets : new Set(targets);
  const out: FretPosition[] = [];
  for (let s = 1; s <= NUM_STRINGS; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const midi = OPEN_MIDI[s]! + f;
      const p = midiToPc(midi);
      if (set.has(p)) out.push({ string: s as StringNumber, fret: f, midi, pc: p });
    }
  }
  return out.sort((a, b) => a.midi - b.midi);
}

/**
 * Octave shapes — the CAGED-friendly landmark pairs.
 * On the guitar, an octave can be reached by a fixed offset relative to a
 * reference (string, fret), depending on the string pair. Used to teach the
 * "landmarks → project everywhere" method.
 *
 * Returns the (string, fret) pairs that are exactly one octave above the
 * given reference position. (Does not include lower-octave mirrors.)
 */
export function octavesAbove(string: StringNumber, fret: number): FretPosition[] {
  const refMidi = midiAt(string, fret);
  const targetMidi = refMidi + 12;
  const out: FretPosition[] = [];
  for (let s = 1; s <= NUM_STRINGS; s++) {
    const open = OPEN_MIDI[s]!;
    if (open > refMidi && open <= targetMidi) {
      const f = targetMidi - open;
      if (f >= 0 && f <= NUM_FRETS) {
        out.push({ string: s as StringNumber, fret: f, midi: targetMidi, pc: midiToPc(targetMidi) });
      }
    }
  }
  return out;
}
