/**
 * Nashville Number System (NNS) — Roman-numeral / number-system mapping for
 * diatonic chords, plus the common worship progressions.
 *
 * The NNS is the **applied** form of Roman-numeral analysis: working worship
 * musicians communicate chord progressions as numbers (1-5-6-4) rather than
 * letter names, because numbers transpose instantly to any key. A chart "in
 * 1-5-6-4" is the same song whether the band plays it in G or A.
 *
 * Reference (academic): Lipscomb University, "The Nashville Number System: A
 * Framework for Teaching Harmony," JMTP.
 *   https://digitalcollections.lipscomb.edu/cgi/viewcontent.cgi?article=1199&context=jmtp
 * Reference (practitioner): MxU, "The Nashville Number System"
 *   https://app.getmxu.com/lessons/the-nashville-number-system
 */

import { key, diatonicTriads, type Key, type ScaleQuality } from "./keys.js";
import { spell, type SpelledNote } from "./notes.js";

/** The 7 diatonic chord slots, expressed as Nashville numbers with quality. */
export interface NumberChord {
  number: number; // 1–7
  quality: "major" | "minor" | "diminished";
  /** Nashville symbol: "1", "2-", "5", "7°". The dash marks minor; ° marks diminished. */
  symbol: string;
  roman: string; // Roman numeral equivalent, e.g. "I", "vi", "vii°"
  /** Concrete chord name in this key, e.g. in G major → "G", "Am", "F#dim". */
  chordName: string;
  /** Spelled root note of the chord. */
  root: SpelledNote;
}

/** Build the seven Nashville-number chords for a key. */
export function nashvilleChords(tonic: string, quality: ScaleQuality = "major"): NumberChord[] {
  const k: Key = key(tonic, quality);
  const triads = diatonicTriads(k);
  return triads.map((t) => {
    const isMinor = t.quality === "min";
    const isDim = t.quality === "dim";
    const symbol = `${t.degree}${isMinor ? "-" : ""}${isDim ? "°" : ""}`;
    const quality: NumberChord["quality"] = isDim ? "diminished" : isMinor ? "minor" : "major";
    const chordSuffix = isDim ? "dim" : isMinor ? "m" : "";
    return {
      number: t.degree,
      quality,
      symbol,
      roman: t.roman,
      chordName: `${spell(t.root)}${chordSuffix}`,
      root: t.root,
    };
  });
}

/** Common worship chord progressions, expressed as Nashville numbers. */
export interface Progression {
  /** Human name. */
  name: string;
  /** Nashville numbers as strings (preserve "1", "6-", etc.); the "first-seen" voicing. */
  numbers: string[];
  /** Famous worship-song examples (for grounding the pattern). */
  examples: string[];
  /** One-line "what this sounds like" description. */
  feel: string;
}

export const WORSHIP_PROGRESSIONS: Progression[] = [
  {
    name: "1–5–6–4",
    numbers: ["1", "5", "6-", "4"],
    examples: ["'Forever Reign' (Hillsong)", "'How He Loves' (John Mark McMillan)", "'Lord I Need You' (Matt Maher)"],
    feel: "The modern worship default. Hopeful, resolved, anthemic.",
  },
  {
    name: "6–4–1–5",
    numbers: ["6-", "4", "1", "5"],
    examples: ["'Amazing Grace (My Chains Are Gone)' (Chris Tomlin)", "'Cornerstone' (Hillsong)"],
    feel: "Cyclic and unresolved — feels like it wants to keep going. Great for verses.",
  },
  {
    name: "1–4–5",
    numbers: ["1", "4", "5"],
    examples: ["'Open the Eyes of My Heart'","'10,000 Reasons' (Bless the Lord)"],
    feel: "The classic three-chord foundation. Bright, foundational.",
  },
  {
    name: "1–6–4–5",
    numbers: ["1", "6-", "4", "5"],
    examples: ["'Revelation Song'", "'Oceans (Where Feet May Fail)' bridge"],
    feel: "Pop-worship. Familiar, emotionally open.",
  },
  {
    name: "4–1–5",
    numbers: ["4", "1", "5"],
    examples: ["'Good Good Father'", "'What a Beautiful Name' pre-chorus"],
    feel: "Plagal, restful — the 'amen' cadence extended.",
  },
];

/**
 * Parse a single Nashville Number System token (e.g. "1", "6m", "2m", "7dim")
 * into a concrete chord name within a key.
 *
 * Two token vocabularies exist in this module and both are accepted here:
 * - display symbols, as produced by `nashvilleChords` and used in
 *   `WORSHIP_PROGRESSIONS` ("6-", "7°" — dash = minor, ° = diminished)
 * - chart-authoring tokens, as used in song chart data ("6m", "7dim")
 *
 * Unlike `nashvilleChords`/`renderProgression`, the chord quality comes from
 * the token itself rather than the diatonic default — this keeps song charts
 * self-documenting (a chart can say "6m" without the reader needing to derive
 * that vi is minor) and leaves room for borrowed/non-diatonic chords later.
 */
const TOKEN_SUFFIXES: Record<string, string> = {
  m: "m",
  "-": "m",
  dim: "dim",
  "°": "dim",
  "+": "aug",
  aug: "aug",
};

export function chordForToken(token: string, tonic: string, quality: ScaleQuality = "major"): string {
  const match = /^([1-7])(m|-|dim|°|\+|aug)?$/.exec(token.trim());
  if (!match) throw new Error(`Bad NNS token: "${token}"`);
  const degree = parseInt(match[1]!, 10);
  const suffix = match[2] ? TOKEN_SUFFIXES[match[2]]! : "";
  const k: Key = key(tonic, quality);
  const root = k.degrees[degree - 1]!;
  return `${spell(root)}${suffix}`;
}

/** Render a progression in a specific key — returns concrete chord names. */
export function renderProgression(prog: Progression, tonic: string, quality: ScaleQuality = "major"): string[] {
  const chords = nashvilleChords(tonic, quality);
  return prog.numbers.map((sym) => {
    // Parse "1", "6-", "7°" → degree number
    const degree = parseInt(sym.replace(/[^0-9]/g, ""), 10);
    const chord = chords[degree - 1];
    if (!chord) throw new Error(`Bad progression number: ${sym}`);
    return chord.chordName;
  });
}
