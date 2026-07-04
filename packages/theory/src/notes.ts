/**
 * Notes — pitch classes, spelled notes, and MIDI helpers.
 *
 * A **pitch class** (pc) is an integer 0–11 representing one of the twelve
 * semitones, with C = 0. Pitch classes are enharmonic-agnostic: C# and Db are
 * both pc 1.
 *
 * A **spelled note** carries the letter (C–B) plus an accidental ('', '#', or
 * 'b'). Spelling matters: in D major we write F#, not Gb, even though both are
 * pc 6. The `keys` module resolves the correct spelling within a key.
 *
 * A **note instance** is a pitch class plus an octave. We use MIDI numbers as
 * the canonical integer encoding: `midi = (octave + 1) * 12 + pc`. Middle C
 * (C4) = 60. Guitar standard tuning spans roughly E2 (40) to E4 (64) open,
 * higher up the neck.
 *
 * Reference: https://www.musictheory.net/lessons/12 (note names, octaves)
 */

export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Letter = (typeof LETTERS)[number];

export type Accidental = "" | "#" | "b";

export interface SpelledNote {
  letter: Letter;
  accidental: Accidental;
}

export type PitchClass = number; // 0–11

/** Semitone offset for each accidental. */
const ACCIDENTAL_OFFSET: Record<Accidental, number> = { "": 0, "#": 1, b: -1 };

/** Pitch class of each natural letter (no accidental). */
const LETTER_PC: Record<Letter, PitchClass> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** Render a spelled note as a string, e.g. {letter:'F', accidental:'#'} → "F#". */
export function spell(note: SpelledNote): string {
  return `${note.letter}${note.accidental}`;
}

/** Parse a note name like "C#", "Bb", "E" into a SpelledNote. Throws on unknown. */
export function parseSpelled(name: string): SpelledNote {
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new Error(`Empty note name`);
  const letter = trimmed[0]!.toUpperCase() as Letter;
  if (!LETTERS.includes(letter)) throw new Error(`Unknown letter: ${trimmed[0]}`);

  let accidental: Accidental = "";
  if (trimmed.length > 1) {
    const a = trimmed[1];
    if (a === "#") accidental = "#";
    else if (a === "b" || a === "♭") accidental = "b";
    else throw new Error(`Unknown accidental: ${a}`);
  }
  return { letter, accidental };
}

/** Pitch class (0–11) of a spelled note. C#=1, Db=1, B=11, etc. */
export function spelledToPc(note: SpelledNote): PitchClass {
  const raw = LETTER_PC[note.letter] + ACCIDENTAL_OFFSET[note.accidental];
  return ((raw % 12) + 12) % 12;
}

/** Convenience: name → pc. `pc("C#")` → 1. */
export function pc(name: string): PitchClass {
  return spelledToPc(parseSpelled(name));
}

/**
 * MIDI number for a note at a given octave.
 * `midi("C", 4)` → 60. `midi("A", 4)` → 69 (A440 reference).
 */
export function midi(name: string, octave: number): number {
  return (octave + 1) * 12 + pc(name);
}

/** Pitch class from a MIDI number. */
export function midiToPc(midi: number): PitchClass {
  return ((Math.round(midi) % 12) + 12) % 12;
}

/** Octave from a MIDI number. */
export function midiToOctave(midi: number): number {
  return Math.floor(Math.round(midi) / 12) - 1;
}

/** Frequency in Hz for a MIDI number, using A4 = 440 Hz equal temperament. */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (Math.round(midi) - 69) / 12);
}
