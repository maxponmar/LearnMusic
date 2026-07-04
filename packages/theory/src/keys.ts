/**
 * Keys & scales — correctly spelled major and minor scales + interval names.
 *
 * Spelling is derived from the **circle of fifths** key signature, not from
 * the pitch class. In D major the third degree is F#, never Gb. We carry the
 * key signature as the source of truth and use it to spell every scale degree.
 *
 * Diatonic triad qualities follow the standard major-key pattern
 * (I ii iii IV V vi vii°) — see https://www.musictheory.net/lessons/43 — and
 * the natural-minor pattern (i ii° III iv v VI VII).
 *
 * Scale-degree naming: numbers 1–7 with major-key accidentals for the minor
 * variants (b3, b6, b7) used by the Nashville Number System and by
 * functional ear training.
 */

import { LETTERS, type Letter, type SpelledNote, type PitchClass, parseSpelled, spell, spelledToPc } from "./notes.js";

export type ScaleQuality = "major" | "minor";

/** A key signature: the seven diatonic spelled notes, in scale order from the tonic. */
export interface Key {
  tonic: SpelledNote;
  quality: ScaleQuality;
  /** Seven spelled notes, scale-degree 1 → 7. */
  degrees: SpelledNote[];
}

/**
 * Major-key scale spellings by tonic letter, derived from the circle of fifths.
 * Each entry is the 7 correctly-spelled scale degrees, tonic first.
 * Use sharps for the sharp keys and flats for the flat keys — standard practice.
 */
const MAJOR_SCALES: Record<string, SpelledNote[]> = {
  C: l("C D E F G A B"),
  G: l("G A B C D E F#"),
  D: l("D E F# G A B C#"),
  A: l("A B C# D E F# G#"),
  E: l("E F# G# A B C# D#"),
  B: l("B C# D# E F# G# A#"),
  "F#": l("F# G# A# B C# D# E#"),
  "C#": l("C# D# E# F# G# A# B#"),
  F: l("F G A Bb C D E"),
  Bb: l("Bb C D Eb F G A"),
  Eb: l("Eb F G Ab Bb C D"),
  Ab: l("Ab Bb C Db Eb F G"),
  Db: l("Db Eb F Gb Ab Bb C"),
  Gb: l("Gb Ab Bb Cb Db Eb F"),
  Cb: l("Cb Db Eb Fb Gb Ab Bb"),
};

/** Natural-minor scales by tonic. Same spelling rigor. */
const MINOR_SCALES: Record<string, SpelledNote[]> = {
  A: l("A B C D E F G"), // relative of C major
  E: l("E F# G A B C D"), // rel. G
  B: l("B C# D E F# G A"), // rel. D
  "F#": l("F# G# A B C# D E"), // rel. A
  "C#": l("C# D# E F# G# A B"), // rel. E
  "G#": l("G# A# B C# D# E F#"), // rel. B
  "D#": l("D# E# F# G# A# B C#"), // rel. F#
  "A#": l("A# B# C# D# E# F# G#"), // rel. C#
  D: l("D E F G A Bb C"), // rel. F
  G: l("G A Bb C D Eb F"), // rel. Bb
  C: l("C D Eb F G Ab Bb"), // rel. Eb
  F: l("F G Ab Bb C Db Eb"), // rel. Ab
  Bb: l("Bb C Db Eb F Gb Ab"), // rel. Db
  Eb: l("Eb F Gb Ab Bb Cb Db"), // rel. Gb
  Ab: l("Ab Bb Cb Db Eb Fb Gb"), // rel. Cb
};

/** helper: "C D E" → [{C},{D},{E}]. Pure parsing convenience. */
function l(notes: string): SpelledNote[] {
  return notes.trim().split(/\s+/).map(parseSpelled);
}

/** Build a Key object from a tonic name + quality. Throws if unknown. */
export function key(tonic: string, quality: ScaleQuality = "major"): Key {
  const table = quality === "major" ? MAJOR_SCALES : MINOR_SCALES;
  const degrees = table[tonic];
  if (!degrees) throw new Error(`No ${quality} scale spelling for tonic "${tonic}"`);
  return { tonic: parseSpelled(tonic), quality, degrees };
}

/** The pitch classes (0–11) of a key's scale, in scale-degree order. */
export function keyPcs(k: Key): PitchClass[] {
  return k.degrees.map(spelledToPc);
}

/** Semitone intervals from the tonic for each degree. [0,2,4,5,7,9,11] for major. */
export function scaleIntervals(k: Key): number[] {
  const tonicPc = spelledToPc(k.tonic);
  return keyPcs(k).map((p) => ((p - tonicPc) % 12 + 12) % 12);
}

/**
 * Triad quality of each diatonic triad (1-indexed scale degree → quality).
 * Major-key qualities: maj,min,min,maj,maj,min,dim.
 * Returns parallel arrays of {degree (1-7), quality, root, third, fifth}.
 */
export type TriadQuality = "maj" | "min" | "dim" | "aug";

export interface DiatonicTriad {
  degree: number; // 1–7
  roman: string; // "I" | "ii" | "iii" | "IV" | "V" | "vi" | "vii°"
  quality: TriadQuality;
  root: SpelledNote;
  third: SpelledNote;
  fifth: SpelledNote;
}

const QUALITY_TO_ROMAN: Record<TriadQuality, { upper: string; lower: string; suffix: string }> = {
  maj: { upper: "", lower: "", suffix: "" },
  min: { upper: "", lower: "", suffix: "" },
  dim: { upper: "°", lower: "°", suffix: "dim" },
  aug: { upper: "+", lower: "+", suffix: "aug" },
};

/** The seven diatonic triads of a key (stacking thirds within the scale). */
export function diatonicTriads(k: Key): DiatonicTriad[] {
  const degs = k.degrees;
  const result: DiatonicTriad[] = [];
  // Diatonic triads are built by **stacking thirds** — i.e. taking every
  // other scale degree. For degree i (0-indexed), the chord tones are the
  // scale degrees at i, i+2, i+4. The interval arithmetic below then yields
  // the correct quality (maj/min/dim) without us having to hardcode it.
  // Reference: https://www.musictheory.net/lessons/43
  for (let i = 0; i < 7; i++) {
    const root = degs[i]!;
    const third = degs[(i + 2) % 7]!;
    const fifth = degs[(i + 4) % 7]!;

    const rootPc = spelledToPc(root);
    const thirdPc = spelledToPc(third);
    const fifthPc = spelledToPc(fifth);
    const thirdInt = ((thirdPc - rootPc) % 12 + 12) % 12;
    const fifthInt = ((fifthPc - rootPc) % 12 + 12) % 12;

    let quality: TriadQuality;
    if (thirdInt === 4 && fifthInt === 7) quality = "maj";
    else if (thirdInt === 3 && fifthInt === 7) quality = "min";
    else if (thirdInt === 3 && fifthInt === 6) quality = "dim";
    else if (thirdInt === 4 && fifthInt === 8) quality = "aug";
    else throw new Error(`Unexpected triad at degree ${i + 1}: intervals ${thirdInt}/${fifthInt}`);

    // Roman numeral: upper-case root for major/aug, lower-case for minor/dim.
    // Diminished gets a ° suffix.
    const isUpper = quality === "maj" || quality === "aug";
    const numerals = ["i", "ii", "iii", "iv", "v", "vi", "vii"];
    const romanBase = isUpper ? numerals[i]!.toUpperCase() : numerals[i]!;
    const suffix = quality === "dim" ? "°" : quality === "aug" ? "+" : "";
    const roman = `${romanBase}${suffix}`;

    result.push({ degree: i + 1, roman, quality, root, third, fifth });
  }
  return result;
}

/** Pretty-print a key, e.g. "D major". */
export function keyName(k: Key): string {
  return `${spell(k.tonic)} ${k.quality}`;
}

/** Scale degree numbers 1–7 (for NNS / ear-training labels). */
export const SCALE_DEGREES = [1, 2, 3, 4, 5, 6, 7] as const;
export type ScaleDegree = (typeof SCALE_DEGREES)[number];

/** Notes-to-letters helper exposed for tests / UI. */
export { LETTERS, parseSpelled, spell };
export type { Letter };
