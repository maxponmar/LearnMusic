import { describe, it, expect } from "vitest";
import { key, keyPcs, scaleIntervals, diatonicTriads, keyName } from "./keys.js";
import { spell } from "./notes.js";

describe("keys — major scale spelling (circle-of-fifths correct)", () => {
  it("spells C major with all naturals", () => {
    const k = key("C");
    expect(k.degrees.map(spell)).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("spells D major with F# and C# (never Gb or Db)", () => {
    const k = key("D");
    expect(k.degrees.map(spell)).toEqual(["D", "E", "F#", "G", "A", "B", "C#"]);
    // Critical: the third degree must be F#, enharmonic to Gb but spelled right.
    expect(spell(k.degrees[2]!)).toBe("F#");
  });

  it("spells flat keys with flats, sharp keys with sharps", () => {
    expect(key("Bb").degrees.map(spell)).toEqual(["Bb", "C", "D", "Eb", "F", "G", "A"]);
    expect(key("A").degrees.map(spell)).toEqual(["A", "B", "C#", "D", "E", "F#", "G#"]);
    // The most punishing case: F# major has E# (not F).
    expect(key("F#").degrees.map(spell)).toEqual(["F#", "G#", "A#", "B", "C#", "D#", "E#"]);
  });

  it("computes scale pitch classes (C major = white-key pcs)", () => {
    expect(keyPcs(key("C"))).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("exposes correct semitone intervals from the tonic", () => {
    expect(scaleIntervals(key("C", "major"))).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(scaleIntervals(key("A", "minor"))).toEqual([0, 2, 3, 5, 7, 8, 10]); // natural minor
  });

  it("formats the key name", () => {
    expect(keyName(key("D"))).toBe("D major");
    expect(keyName(key("A", "minor"))).toBe("A minor");
  });
});

describe("keys — diatonic triads (functional harmony)", () => {
  it("yields I-ii-iii-IV-V-vi-vii° in a major key", () => {
    const triads = diatonicTriads(key("C"));
    expect(triads.map((t) => t.roman)).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);
    expect(triads.map((t) => t.quality)).toEqual([
      "maj",
      "min",
      "min",
      "maj",
      "maj",
      "min",
      "dim",
    ]);
  });

  it("roots the diatonic triads on the right scale degrees", () => {
    const triads = diatonicTriads(key("G"));
    expect(triads.map((t) => spell(t.root))).toEqual(["G", "A", "B", "C", "D", "E", "F#"]);
    // V must be D (major), vi must be Em, vii° must be F#dim
    expect(spell(triads[4]!.root)).toBe("D");
    expect(spell(triads[5]!.root)).toBe("E");
    expect(spell(triads[6]!.root)).toBe("F#");
  });

  it("yields i-ii°-III-iv-v-VI-VII in a natural-minor key", () => {
    const triads = diatonicTriads(key("A", "minor"));
    expect(triads.map((t) => t.roman)).toEqual(["i", "ii°", "III", "iv", "v", "VI", "VII"]);
  });
});
