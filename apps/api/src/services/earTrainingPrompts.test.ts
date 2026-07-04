import { describe, it, expect } from "vitest";
import {
  generateScaleDegreePrompt,
  generateChordQualityPrompt,
  generateProgressionPrompt,
  computeStats,
} from "./earTrainingPrompts.js";

describe("prompt generation", () => {
  it("generates scale-degree prompts in the valid key/degree/midi range", () => {
    for (let i = 0; i < 50; i++) {
      const p = generateScaleDegreePrompt();
      expect(p.exerciseType).toBe("scale-degree");
      expect(p.degree).toBeGreaterThanOrEqual(1);
      expect(p.degree).toBeLessThanOrEqual(7);
      expect(p.midi).toBeGreaterThanOrEqual(55);
      expect(p.midi).toBeLessThanOrEqual(76);
      expect(["G", "D", "C", "A", "E"]).toContain(p.key);
      expect(p.promptId.length).toBeGreaterThan(4);
    }
  });

  it("generates chord-quality prompts with one of the four qualities", () => {
    for (let i = 0; i < 50; i++) {
      const p = generateChordQualityPrompt();
      expect(p.exerciseType).toBe("chord-quality");
      expect(["major", "minor", "diminished", "sus4"]).toContain(p.chordQuality);
      expect(p.rootMidi).toBeGreaterThanOrEqual(55);
      expect(p.rootMidi).toBeLessThanOrEqual(76);
    }
  });

  it("respects an explicit key", () => {
    const p = generateScaleDegreePrompt({ keyName: "D" });
    expect(p.key).toBe("D");
  });
});

describe("progression prompt generation", () => {
  it("generates a 4-chord progression in a valid key with MIDIs", () => {
    for (let i = 0; i < 30; i++) {
      const p = generateProgressionPrompt();
      expect(p.exerciseType).toBe("progression");
      expect(p.numbers.length).toBeGreaterThanOrEqual(3);
      expect(p.numbers.length).toBeLessThanOrEqual(4);
      expect(p.chordNames.length).toBe(p.numbers.length);
      expect(p.chordMidis.length).toBe(p.numbers.length);
      // Each chord has 3 MIDI notes (triad)
      expect(p.chordMidis.every((c) => c.length === 3)).toBe(true);
      expect(["G", "D", "C", "A", "E"]).toContain(p.key);
    }
  });

  it("renders correct concrete chords for 1-5-6-4 in G", () => {
    // Run until we hit a 1-5-6-4 in G, then verify
    for (let i = 0; i < 100; i++) {
      const p = generateProgressionPrompt({ keyName: "G" });
      if (p.numbers.join(",") === "1,5,6-,4") {
        expect(p.chordNames).toEqual(["G", "D", "Em", "C"]);
        return;
      }
    }
    expect.fail("never generated 1-5-6-4 in G after 100 tries");
  });
});

describe("computeStats", () => {
  // helper: build attempts with a given correctness pattern, one per day
  const mk = (pattern: number[]) =>
    pattern.map((correct, i) => ({
      correct,
      date: `2026-01-0${i + 1}T00:00:00.000Z`,
    }));

  it("returns zeros for an empty attempt history", () => {
    const s = computeStats([]);
    expect(s).toEqual({ total: 0, correct: 0, recentAccuracy: 0, mastery: 0, bestStreak: 0 });
  });

  it("computes total + correct counts", () => {
    const s = computeStats(mk([1, 0, 1, 1, 0]));
    expect(s.total).toBe(5);
    expect(s.correct).toBe(3);
  });

  it("computes recentAccuracy over the last 20", () => {
    // 30 attempts: first 25 wrong, last 5 correct → recent (last 20) = 5/20
    const pattern = [...Array(25).fill(0), ...Array(5).fill(1)];
    const s = computeStats(mk(pattern));
    expect(s.recentAccuracy).toBeCloseTo(5 / 20, 5);
  });

  it("finds the longest streak of correct answers", () => {
    const s = computeStats(mk([1, 1, 0, 1, 1, 1, 0, 1]));
    expect(s.bestStreak).toBe(3);
  });

  it("mastery is bounded in [0,1] and trends toward recent performance", () => {
    // All wrong → mastery well below 0.5
    const allWrong = computeStats(mk([0, 0, 0, 0, 0, 0, 0, 0]));
    expect(allWrong.mastery).toBeLessThan(0.5);
    // All correct → mastery well above 0.5
    const allRight = computeStats(mk([1, 1, 1, 1, 1, 1, 1, 1]));
    expect(allRight.mastery).toBeGreaterThan(0.7);
    // Mastery rewards recent performance: started wrong, ended right should
    // be higher than started right, ended wrong.
    const improving = computeStats(mk([0, 0, 0, 1, 1, 1, 1, 1]));
    const declining = computeStats(mk([1, 1, 1, 1, 1, 0, 0, 0]));
    expect(improving.mastery).toBeGreaterThan(declining.mastery);
  });
});
