import { describe, it, expect } from "vitest";
import { contextFor, fretNotes } from "./context.js";

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
