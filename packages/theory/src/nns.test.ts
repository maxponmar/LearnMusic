import { describe, it, expect } from "vitest";
import {
  nashvilleChords,
  renderProgression,
  WORSHIP_PROGRESSIONS,
} from "./nns.js";
import { pentatonicPcs, relativePentatonic, majorScaleToPentatonicDegrees } from "./scales.js";

describe("NNS — Nashville Number System", () => {
  it("builds the seven diatonic chords for G major", () => {
    const chords = nashvilleChords("G");
    expect(chords.map((c) => c.chordName)).toEqual(["G", "Am", "Bm", "C", "D", "Em", "F#dim"]);
    expect(chords.map((c) => c.symbol)).toEqual(["1", "2-", "3-", "4", "5", "6-", "7°"]);
    expect(chords.map((c) => c.roman)).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);
  });

  it("builds the seven diatonic chords for D major", () => {
    const chords = nashvilleChords("D");
    // Spelled correctly: F#m not Gbm
    expect(chords.map((c) => c.chordName)).toEqual(["D", "Em", "F#m", "G", "A", "Bm", "C#dim"]);
  });

  it("renders the 1-5-6-4 progression in multiple keys", () => {
    const fifteenFour = WORSHIP_PROGRESSIONS.find((p) => p.name === "1–5–6–4")!;
    expect(fifteenFour).toBeDefined();
    expect(renderProgression(fifteenFour, "G")).toEqual(["G", "D", "Em", "C"]);
    expect(renderProgression(fifteenFour, "D")).toEqual(["D", "A", "Bm", "G"]);
    expect(renderProgression(fifteenFour, "C")).toEqual(["C", "G", "Am", "F"]);
    // Same numbers, different concrete chords — the whole point of NNS.
  });

  it("renders 1-4-5 in G", () => {
    const prog = WORSHIP_PROGRESSIONS.find((p) => p.name === "1–4–5")!;
    expect(renderProgression(prog, "G")).toEqual(["G", "C", "D"]);
  });
});

describe("scales — pentatonics & relatives", () => {
  it("computes major-pentatonic pitch classes for C", () => {
    // C major pentatonic = C D E G A = pcs 0 2 4 7 9
    expect(pentatonicPcs(0, "major").sort((a, b) => a - b)).toEqual([0, 2, 4, 7, 9]);
  });

  it("computes minor-pentatonic pitch classes for A", () => {
    // A minor pentatonic = A C D E G = pcs 9 0 2 4 7 (same notes as C major pentatonic!)
    const a = pentatonicPcs(9, "minor").sort((a, b) => a - b);
    const c = pentatonicPcs(0, "major").sort((a, b) => a - b);
    expect(a).toEqual(c); // relative pentatonics share notes
  });

  it("finds the relative major/minor pair", () => {
    // C major's relative minor is A (9 semitones up from C... pc 9)
    const rel = relativePentatonic(0, "major");
    expect(rel.root).toBe(9);
    expect(rel.mode).toBe("minor");
    // A minor's relative major is C
    expect(relativePentatonic(9, "minor")).toEqual({ root: 0, mode: "major" });
  });

  it("identifies which scale degrees of a major key belong to its major pentatonic", () => {
    // C major pentatonic = degrees 1,2,3,5,6 of the C major scale
    expect(majorScaleToPentatonicDegrees("C")).toEqual([1, 2, 3, 5, 6]);
    expect(majorScaleToPentatonicDegrees("G")).toEqual([1, 2, 3, 5, 6]);
  });
});
