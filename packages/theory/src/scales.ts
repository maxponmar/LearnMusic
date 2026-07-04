/**
 * Pentatonic & moveable scale patterns for improvisation.
 *
 * Pentatonic scales are the workhorse vocabulary for tasteful worship fills:
 *   - **Major pentatonic** (1-2-3-5-6): bright, melodic fills over a major key
 *   - **Minor pentatonic** (1-b3-4-5-b7): the dominant solo/fill vocabulary;
 *     it's the relative minor's pentatonic, sharing all five notes.
 *
 * Source consensus (cross-checked): major + minor pentatonic are the core;
 * the major scale is used to learn exact recorded melodies; Mixolydian is
 * situational, not foundational.
 */

import { keyPcs, key } from "./keys.js";
import type { PitchClass } from "./notes.js";

export type PentatonicMode = "major" | "minor";

/** Major-pentatonic intervals from the root: 1,2,3,5,6 → 0,2,4,7,9. */
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];
/** Minor-pentatonic intervals from the root: 1,b3,4,5,b7 → 0,3,5,7,10. */
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];

/** Pitch classes of a pentatonic scale rooted at `rootPc`. */
export function pentatonicPcs(rootPc: PitchClass, mode: PentatonicMode): PitchClass[] {
  const intervals = mode === "major" ? MAJOR_PENTATONIC_INTERVALS : MINOR_PENTATONIC_INTERVALS;
  return intervals.map((i) => (((rootPc + i) % 12) + 12) % 12);
}

/**
 * The relative-minor / relative-major pair share the same five notes.
 *   - Relative minor of a major key = 6th degree (e.g. C major ↔ A minor)
 *   - Relative major of a minor key = 3rd degree
 *
 * For improvisation this means: over a I-V-vi-IV in G (G-D-Em-C), one G major
 * pentatonic (= E minor pentatonic) works over the whole progression — that's
 * the "follow the chord, but you can also stay home" insight.
 */
export function relativePentatonic(rootPc: PitchClass, mode: PentatonicMode): { root: PitchClass; mode: PentatonicMode } {
  if (mode === "major") {
    // Up a minor 3rd to the relative minor (9 semitones up, or 3 back)
    return { root: (((rootPc + 9) % 12) + 12) % 12, mode: "minor" };
  }
  // Minor → relative major: up a minor 3rd
  return { root: (((rootPc + 3) % 12) + 12) % 12, mode: "major" };
}

/**
 * Diatonic scale degrees (1-7) that belong to the major pentatonic of a key.
 * Useful for "this fill is allowed over this chord" reasoning.
 */
export function majorScaleToPentatonicDegrees(tonic: string): number[] {
  const k = key(tonic, "major");
  const scalePcs = keyPcs(k);
  const tonicPc = scalePcs[0]!;
  const penta = new Set(pentatonicPcs(tonicPc, "major"));
  const degrees: number[] = [];
  scalePcs.forEach((p, i) => {
    if (penta.has(p)) degrees.push(i + 1);
  });
  return degrees;
}
