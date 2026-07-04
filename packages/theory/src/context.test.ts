import { describe, it, expect } from "vitest";
import { contextFor, fretNotes, pentatonicContext } from "./context.js";

describe("context — key-aware fretboard spelling", () => {
  it("spells in-key notes with the key's spelling (D major → F#, not Gb)", () => {
    const ctx = contextFor("D");
    expect(ctx.pcToName.get(6)).toBe("F#"); // pc 6 = F#/Gb; in D major it's F#
    expect(ctx.pcToName.get(2)).toBe("D");
    expect(ctx.pcToName.get(11)).toBe("B");
  });

  it("assigns scale degrees 1–7 to in-key notes", () => {
    const ctx = contextFor("C");
    expect(ctx.pcToDegree.get(0)).toBe(1); // C = 1
    expect(ctx.pcToDegree.get(2)).toBe(2); // D = 2
    expect(ctx.pcToDegree.get(4)).toBe(3); // E = 3
    expect(ctx.pcToDegree.get(5)).toBe(4); // F = 4
    expect(ctx.pcToDegree.get(11)).toBe(7); // B = 7
  });

  it("marks out-of-key pcs as not in scale", () => {
    const ctx = contextFor("C");
    expect(ctx.scalePcs.has(1)).toBe(false); // C# not in C major
    expect(ctx.scalePcs.has(0)).toBe(true); // C is in C major
  });

  it("fretNotes marks the tonic across all octaves/strings", () => {
    const ctx = contextFor("G");
    const notes = fretNotes(ctx, 12);
    const roots = notes.filter((n) => n.isRoot);
    // G appears on multiple strings/frets (string 1 fret 3, string 3 open, etc.)
    expect(roots.length).toBeGreaterThan(4);
    expect(roots.every((r) => r.degree === 1 && r.name === "G")).toBe(true);
  });

  it("fretNotes reports correct name + degree + inScale for an in-key note", () => {
    const ctx = contextFor("D");
    const openDString = fretNotes(ctx, 0).find((n) => n.string === 4 && n.fret === 0);
    expect(openDString).toBeDefined();
    expect(openDString!.name).toBe("D");
    expect(openDString!.degree).toBe(1);
    expect(openDString!.inScale).toBe(true);
    expect(openDString!.isRoot).toBe(true);
  });

  it("fretNotes reports out-of-key chromatic notes with sharp-default spelling", () => {
    const ctx = contextFor("C");
    const cSharp = fretNotes(ctx, 1).find((n) => n.string === 6 && n.fret === 1); // low E fret 1 = F
    // F is in C major (degree 4) — sanity that this position exists
    expect(cSharp?.name).toBe("F");
    // Find a definitely out-of-key note: C# on string 2 (B) fret 2
    const cSharpNote = fretNotes(ctx, 12).find((n) => n.string === 2 && n.fret === 2);
    expect(cSharpNote).toBeDefined();
    expect(cSharpNote!.inScale).toBe(false);
    expect(cSharpNote!.name).toBe("C#"); // sharp-default for chromatic
    expect(cSharpNote!.degree).toBeNull();
  });
});

describe("pentatonicContext — 5-note fretboard context", () => {
  it("major pentatonic of G = G A B D E (degrees 1,2,3,5,6 of G major)", () => {
    const ctx = pentatonicContext("G", "major");
    expect([...ctx.scalePcs].sort((a, b) => a - b)).toEqual([2, 4, 7, 9, 11]); // E,G,A,B,D
    expect(ctx.pcToName.get(7)).toBe("G"); // pc 7 = G
    expect(ctx.pcToName.get(2)).toBe("D");
    expect(ctx.pcToName.get(4)).toBe("E");
    expect(ctx.pcToName.get(9)).toBe("A");
    expect(ctx.pcToName.get(11)).toBe("B");
  });

  it("re-numbers pentatonic degrees 1–5 with root at degree 1", () => {
    const ctx = pentatonicContext("G", "major");
    expect(ctx.pcToDegree.get(7)).toBe(1); // G = 1
    expect(ctx.pcToDegree.get(9)).toBe(2); // A = 2
    expect(ctx.pcToDegree.get(11)).toBe(3); // B = 3
    expect(ctx.pcToDegree.get(2)).toBe(4); // D = 4
    expect(ctx.pcToDegree.get(4)).toBe(5); // E = 5
  });

  it("minor pentatonic of E = E G A B D (same 5 notes as G major pentatonic)", () => {
    const ctxMin = pentatonicContext("E", "minor");
    const ctxMaj = pentatonicContext("G", "major");
    expect([...ctxMin.scalePcs].sort((a, b) => a - b)).toEqual([
      ...ctxMaj.scalePcs,
    ].sort((a, b) => a - b));
    // But the root is different: E is degree 1 in minor, degree 5 in major
    expect(ctxMin.pcToDegree.get(4)).toBe(1); // E = 1
    expect(ctxMaj.pcToDegree.get(4)).toBe(5); // E = 5
  });

  it("spells D major pentatonic as F# (not Gb) from the key signature", () => {
    const ctx = pentatonicContext("D", "major");
    // D major scale = D E F# G A B C#; pentatonic = D E F# A B (degrees 1,2,3,5,6)
    expect(ctx.pcToName.get(6)).toBe("F#"); // F# not Gb
    expect(ctx.pcToName.get(2)).toBe("D");
    expect(ctx.pcToName.get(4)).toBe("E");
    expect(ctx.pcToName.get(9)).toBe("A");
    expect(ctx.pcToName.get(11)).toBe("B");
    // C# (degree 7) and G (degree 4) are excluded from the pentatonic
    expect(ctx.pcToName.has(1)).toBe(false); // C#
    expect(ctx.pcToName.has(7)).toBe(false); // G
  });

  it("excludes the two non-pentatonic scale degrees (4 and 7 in major)", () => {
    const ctx = pentatonicContext("C", "major");
    // C major = C D E F G A B; pentatonic = C D E G A (no F, no B)
    expect(ctx.scalePcs.has(5)).toBe(false); // F excluded
    expect(ctx.scalePcs.has(11)).toBe(false); // B excluded
    expect(ctx.scalePcs.has(0)).toBe(true); // C
    expect(ctx.scalePcs.has(2)).toBe(true); // D
    expect(ctx.scalePcs.has(4)).toBe(true); // E
    expect(ctx.scalePcs.has(7)).toBe(true); // G
    expect(ctx.scalePcs.has(9)).toBe(true); // A
  });

  it("fretNotes marks only the 5 pentatonic notes as inScale", () => {
    const ctx = pentatonicContext("G", "major");
    const notes = fretNotes(ctx, 12);
    const inScale = notes.filter((n) => n.inScale);
    // Every in-scale note should have a pentatonic degree 1–5
    expect(inScale.every((n) => n.degree! >= 1 && n.degree! <= 5)).toBe(true);
    // Non-pentatonic diatonic notes (C, F#) should be out-of-scale
    const fSharp = notes.find((n) => n.string === 1 && n.fret === 2); // high E fret 2 = F#
    expect(fSharp!.inScale).toBe(false);
  });
});
