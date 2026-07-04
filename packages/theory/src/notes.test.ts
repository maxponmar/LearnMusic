import { describe, it, expect } from "vitest";
import {
  parseSpelled,
  spell,
  spelledToPc,
  pc,
  midi,
  midiToPc,
  midiToOctave,
  midiToFreq,
} from "./notes.js";

describe("notes — pitch classes & spelling", () => {
  it("round-trips spell/parse for naturals, sharps, and flats", () => {
    expect(spell(parseSpelled("C"))).toBe("C");
    expect(spell(parseSpelled("F#"))).toBe("F#");
    expect(spell(parseSpelled("Bb"))).toBe("Bb");
    expect(spell(parseSpelled("bb"))).toBe("Bb"); // case-insensitive letter
    expect(spell(parseSpelled("A♭"))).toBe("Ab"); // unicode flat
  });

  it("throws on unknown letters/accidentals", () => {
    expect(() => parseSpelled("H")).toThrow();
    expect(() => parseSpelled("Cx")).toThrow();
    expect(() => parseSpelled("")).toThrow();
  });

  it("maps spelled notes to pitch classes (enharmonic equivalence)", () => {
    expect(spelledToPc(parseSpelled("C"))).toBe(0);
    expect(spelledToPc(parseSpelled("B#"))).toBe(0);
    expect(spelledToPc(parseSpelled("C#"))).toBe(1);
    expect(spelledToPc(parseSpelled("Db"))).toBe(1);
    expect(spelledToPc(parseSpelled("F#"))).toBe(6);
    expect(spelledToPc(parseSpelled("Gb"))).toBe(6);
    expect(spelledToPc(parseSpelled("B"))).toBe(11);
    expect(pc("A")).toBe(9);
  });
});

describe("notes — MIDI helpers", () => {
  it("computes MIDI numbers from note + octave (C4=60, A4=69)", () => {
    expect(midi("C", 4)).toBe(60);
    expect(midi("A", 4)).toBe(69);
    expect(midi("E", 2)).toBe(40); // low E string open
    expect(midi("E", 4)).toBe(64); // high E string open
  });

  it("round-trips MIDI ↔ pc / octave", () => {
    expect(midiToPc(60)).toBe(0);
    expect(midiToOctave(60)).toBe(4);
    expect(midiToOctave(69)).toBe(4);
    expect(midiToOctave(40)).toBe(2);
  });

  it("computes A440 equal-temperament frequencies", () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
    expect(midiToFreq(60)).toBeCloseTo(261.63, 2); // middle C ≈ 261.63 Hz
    expect(midiToFreq(81)).toBeCloseTo(880, 5); // A5 = 2× A440
  });
});
