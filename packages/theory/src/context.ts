/**
 * Fretboard context — key-aware spelling & scale-degree computation.
 *
 * The pure `fretboard` module knows about pitch classes; the UI needs to know
 * what to *call* them (F# vs Gb) and what *role* they play (scale degree 3,
 * chord tone, etc.). This module bridges the two, given a key context.
 *
 * Used by the React Fretboard component to render notes with the right name
 * and color (root vs chord-tone vs other-scale-note vs outside-the-key).
 */

import { key, keyPcs, type Key, type ScaleQuality } from "./keys.js";
import { midiToPc, spell, type SpelledNote, type PitchClass } from "./notes.js";
import { midiAt, OPEN_MIDI, type StringNumber, type FretPosition } from "./fretboard.js";

export interface FretNote {
  string: StringNumber;
  fret: number;
  midi: number;
  pc: PitchClass;
  /** Spelled name in the active key, e.g. "F#". Falls back to sharp spelling. */
  name: string;
  /** Scale degree 1–7 if this note is in the key, else null. */
  degree: number | null;
  /** True if this note is the tonic (scale degree 1). */
  isRoot: boolean;
  /** True if this note is in the active scale at all. */
  inScale: boolean;
}

export interface FretboardContext {
  key: Key;
  scalePcs: Set<PitchClass>;
  /** pc → spelled name, looked up from the key's degrees. */
  pcToName: Map<PitchClass, string>;
  /** pc → scale degree (1–7), or undefined if not in scale. */
  pcToDegree: Map<PitchClass, number>;
}

/** Build a fretboard context for a key. */
export function contextFor(tonic: string, quality: ScaleQuality = "major"): FretboardContext {
  const k = key(tonic, quality);
  const pcs = keyPcs(k);
  const scalePcs = new Set<PitchClass>(pcs);
  const pcToName = new Map<PitchClass, string>();
  const pcToDegree = new Map<PitchClass, number>();
  pcs.forEach((pc, i) => {
    pcToName.set(pc, spell(k.degrees[i]!));
    pcToDegree.set(pc, i + 1);
  });
  return { key: k, scalePcs, pcToName, pcToDegree };
}

/**
 * Compute every FretNote on the fretboard (within `maxFret`) for a given key.
 * One entry per string/fret position; the caller filters/highlights.
 */
export function fretNotes(ctx: FretboardContext, maxFret: number = 12): FretNote[] {
  const out: FretNote[] = [];
  for (let s = 1; s <= 6; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const midi = midiAt(s as StringNumber, f);
      const pc = midiToPc(midi);
      const inScale = ctx.scalePcs.has(pc);
      const degree = ctx.pcToDegree.get(pc) ?? null;
      // Spelling: prefer the key's spelling if in scale; otherwise sharp-default.
      const name = ctx.pcToName.get(pc) ?? SHARP_NAMES[pc]!;
      out.push({
        string: s as StringNumber,
        fret: f,
        midi,
        pc,
        name,
        degree,
        isRoot: degree === 1,
        inScale,
      });
    }
  }
  return out;
}

const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Open-string MIDI note names for display (low E → high E matches string 6 → 1). */
export const OPEN_STRING_NAMES = ["E", "B", "G", "D", "A", "E"]; // index 0 = string 1 (high E)
export { OPEN_MIDI };
export type { FretPosition, SpelledNote };
