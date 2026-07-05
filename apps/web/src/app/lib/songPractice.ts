/**
 * Song practice helpers — NNS token → guitar triad MIDIs and bar timing.
 */

import { diatonicTriads, key, spelledToPc } from "@lag/theory";
import type { TimeSignature } from "./metronome";

const TOKEN_QUALITY: Record<string, "major" | "minor" | "diminished"> = {
  m: "minor",
  "-": "minor",
  dim: "diminished",
  "°": "diminished",
};

function pickComfortableMidi(pc: number): number {
  let midi = 48 + pc;
  while (midi < 55) midi += 12;
  while (midi > 76) midi -= 12;
  return midi;
}

function triadMidisForDegree(k: ReturnType<typeof key>, degree: number): number[] {
  const triads = diatonicTriads(k);
  const triad = triads[degree - 1]!;
  const rootPc = spelledToPc(triad.root);
  const thirdPc = spelledToPc(triad.third);
  const fifthPc = spelledToPc(triad.fifth);
  const rootMidi = pickComfortableMidi(rootPc);
  const upTo = (targetPc: number, anchor: number): number => {
    let m = anchor + (((targetPc - (anchor % 12)) + 12) % 12);
    while (m < anchor) m += 12;
    return m;
  };
  return [rootMidi, upTo(thirdPc, rootMidi), upTo(fifthPc, rootMidi)];
}

/** Build a comfortable-register triad for a song-chart NNS token. */
export function triadMidisForToken(token: string, tonic: string): number[] {
  const match = /^([1-7])(m|-|dim|°|\+|aug)?$/.exec(token.trim());
  if (!match) throw new Error(`Bad NNS token: "${token}"`);
  const degree = parseInt(match[1]!, 10);
  const suffix = match[2];
  const k = key(tonic, "major");

  if (!suffix) {
    return triadMidisForDegree(k, degree);
  }

  const quality = TOKEN_QUALITY[suffix] ?? "major";
  const rootPc = spelledToPc(k.degrees[degree - 1]!);
  const rootMidi = pickComfortableMidi(rootPc);
  const intervals =
    quality === "major" ? [0, 4, 7] : quality === "minor" ? [0, 3, 7] : [0, 3, 6];
  return intervals.map((i) => rootMidi + i);
}

export function parseBeatsPerMeasure(timeSignature: string): TimeSignature {
  const beats = parseInt(timeSignature.split("/")[0] ?? "4", 10);
  return beats === 3 ? 3 : 4;
}

/** Duration of one bar in seconds at the given BPM. */
export function barDurationSec(bpm: number, beatsPerBar: number): number {
  return beatsPerBar * (60 / bpm);
}
