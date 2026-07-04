import { describe, it, expect } from "vitest";
import {
  midiAt,
  pcAt,
  noteNameAt,
  findPositions,
  octavesAbove,
  OPEN_MIDI,
  type StringNumber,
} from "./fretboard.js";

describe("fretboard — standard tuning geometry", () => {
  it("uses the correct open MIDI notes for standard tuning", () => {
    // E4 B3 G3 D3 A2 E2  (strings 1 → 6)
    expect(OPEN_MIDI[1]).toBe(64);
    expect(OPEN_MIDI[2]).toBe(59);
    expect(OPEN_MIDI[3]).toBe(55);
    expect(OPEN_MIDI[4]).toBe(50);
    expect(OPEN_MIDI[5]).toBe(45);
    expect(OPEN_MIDI[6]).toBe(40);
  });

  it("rejects invalid string/fret numbers", () => {
    expect(() => midiAt(0 as StringNumber, 0)).toThrow();
    expect(() => midiAt(7 as StringNumber, 0)).toThrow();
    expect(() => midiAt(1, -1)).toThrow();
    expect(() => midiAt(1, 1.5)).toThrow();
  });

  it("computes MIDI / pitch class / name at any position", () => {
    // Open strings
    expect(midiAt(1, 0)).toBe(64); // high E
    expect(noteNameAt(6, 0)).toBe("E"); // low E
    // First-fret notes are all a semitone up from open (sharps)
    expect(noteNameAt(1, 1)).toBe("F");
    expect(noteNameAt(2, 1)).toBe("C");
    expect(noteNameAt(3, 1)).toBe("G#");
    // Classic landmarks: 5th fret of low E = A
    expect(noteNameAt(6, 5)).toBe("A");
    expect(pcAt(6, 5)).toBe(9);
    // 12th fret = same note as open, one octave up
    expect(noteNameAt(1, 12)).toBe("E");
    expect(midiAt(1, 12)).toBe(76);
  });

  it("finds all positions for a single pitch class (e.g. all C's)", () => {
    const cs = findPositions([0]); // pc 0 = C
    // Standard-tuned C positions within 15 frets (one or two per string):
    //   high-E (E4): fret 8 → C5
    //   B        (B3): fret 1 → C4, fret 13 → C5
    //   G        (G3): fret 5 → C4
    //   D        (D3): fret 10 → C4
    //   A        (A2): fret 3 → C3, fret 15 → C4
    //   low-E    (E2): fret 8 → C3
    const summary = cs.map((p) => `s${p.string}f${p.fret}`).sort();
    expect(summary).toEqual(
      ["s1f8", "s2f1", "s2f13", "s3f5", "s4f10", "s5f3", "s5f15", "s6f8"].sort(),
    );
    // Every result must be pitch class 0 (C)
    expect(cs.every((p) => p.pc === 0)).toBe(true);
  });

  it("finds positions for a whole key (e.g. G major notes)", () => {
    const k = findPositions([0, 2, 4, 5, 7, 9, 11]); // C major pcs (G major is transposed but pcs overlap test)
    expect(k.length).toBeGreaterThan(20);
    // Every position must be one of those pitch classes
    expect(k.every((p) => [0, 2, 4, 5, 7, 9, 11].includes(p.pc))).toBe(true);
  });

  it("finds octaves above a reference position", () => {
    // Low E string open (string 6, fret 0): octave up = string 4 fret 2 OR string 5 fret 12... wait
    // E2 (40) + 12 = E3 (52). String 5 (A2=45): fret 7 → 52. String 4 (D3=50): fret 2 → 52.
    const oct = octavesAbove(6, 0);
    const frets = oct.map((o) => `s${o.string}f${o.fret}`).sort();
    expect(frets).toContain("s4f2");
    expect(frets).toContain("s5f7");
    expect(oct.every((o) => o.midi === 52)).toBe(true);
  });
});
