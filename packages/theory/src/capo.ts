/**
 * Capo suggestion — mapping any key onto a familiar open-chord shape + capo
 * fret.
 *
 * Worship guitarists mostly know five open-position "home" shapes: G, C, D,
 * A, E (the shapes CAGED draws its name from, minus the F barre shape, which
 * has no comfortable open form). Rather than learn a hard key in barre
 * chords, the player capos up and keeps playing one of these five shapes.
 *
 *   capo fret = (target key's pitch class − shape's pitch class) mod 12
 *
 * This generalizes the "G-shape player" table in
 * reference/improvisation-and-capo.html to all five open shapes and always
 * picks whichever shape needs the lowest fret — the most comfortable option.
 */

import { pc } from "./notes.js";

export type OpenShape = "G" | "C" | "D" | "A" | "E";

/** The five open shapes, in tie-break preference order. */
export const OPEN_SHAPES: OpenShape[] = ["G", "C", "D", "A", "E"];

export interface CapoSuggestion {
  shape: OpenShape;
  /** Capo fret, 0–11. 0 means "no capo — play the shape open." */
  fret: number;
}

/**
 * Suggest the open shape + capo fret that plays a given target key, picking
 * whichever of the five shapes needs the lowest fret (ties broken by
 * `OPEN_SHAPES` order).
 */
export function suggestCapo(targetTonic: string): CapoSuggestion {
  const targetPc = pc(targetTonic);
  let best: CapoSuggestion | null = null;
  for (const shape of OPEN_SHAPES) {
    const fret = ((targetPc - pc(shape)) % 12 + 12) % 12;
    if (best === null || fret < best.fret) {
      best = { shape, fret };
    }
  }
  return best!;
}
