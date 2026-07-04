import { describe, it, expect } from "vitest";
import { suggestCapo, OPEN_SHAPES } from "./capo.js";

describe("capo — open-shape + fret suggestion", () => {
  it("exposes the five open shapes in preference order", () => {
    expect(OPEN_SHAPES).toEqual(["G", "C", "D", "A", "E"]);
  });

  it("suggests fret 0 (no capo) when the target key is itself an open shape", () => {
    expect(suggestCapo("G")).toEqual({ shape: "G", fret: 0 });
    expect(suggestCapo("C")).toEqual({ shape: "C", fret: 0 });
    expect(suggestCapo("D")).toEqual({ shape: "D", fret: 0 });
    expect(suggestCapo("A")).toEqual({ shape: "A", fret: 0 });
    expect(suggestCapo("E")).toEqual({ shape: "E", fret: 0 });
  });

  it("matches common worship-guitar capo conventions for non-open keys", () => {
    // A shape, capo 1 -> Bb (real-world convention)
    expect(suggestCapo("Bb")).toEqual({ shape: "A", fret: 1 });
    // A shape, capo 2 -> B
    expect(suggestCapo("B")).toEqual({ shape: "A", fret: 2 });
    // C shape, capo 1 -> Db
    expect(suggestCapo("Db")).toEqual({ shape: "C", fret: 1 });
    // D shape, capo 1 -> Eb
    expect(suggestCapo("Eb")).toEqual({ shape: "D", fret: 1 });
    // E shape, capo 1 -> F
    expect(suggestCapo("F")).toEqual({ shape: "E", fret: 1 });
    // E shape, capo 2 -> F#
    expect(suggestCapo("F#")).toEqual({ shape: "E", fret: 2 });
  });

  it("always picks the lowest fret across all five shapes", () => {
    for (const tonic of ["G", "C", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"]) {
      const { fret } = suggestCapo(tonic);
      expect(fret).toBeGreaterThanOrEqual(0);
      expect(fret).toBeLessThanOrEqual(11);
    }
  });
});
