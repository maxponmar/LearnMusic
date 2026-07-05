/**
 * Ear-training prompt generation.
 *
 * The server is the source of truth for what the user heard. The client gets
 * a prompt (key + degree + midi), plays a cadence to establish the key, plays
 * the test note, and asks the user to identify it. The client never knows the
 * correct answer until it submits its guess — that comes from this module.
 *
 * Two exercise types in Phase 3:
 *  - scale-degree: functional ear training (the method endorsed by the research)
 *  - chord-quality: major/minor/dim/sus4 recognition
 *
 * Reference: Functional Ear Trainer method (cadence → note → identify degree).
 */

import {
  key,
  diatonicTriads,
  spell,
  spelledToPc,
  parseSpelled,
  WORSHIP_PROGRESSIONS,
  renderProgression,
  type ScaleQuality,
  type Progression as TheoryProgression,
} from "@lag/theory";
import type {
  ScaleDegreePrompt,
  ChordQualityPrompt,
  ProgressionPrompt,
  EarTrainingPrompt,
} from "@lag/shared";

// Worship-friendly keys (the ones contemporary worship actually uses).
// We bias toward sharp keys because that's what guitarists read.
const PRACTICE_KEYS = ["G", "D", "C", "A", "E"] as const;

function randomKey(): string {
  return PRACTICE_KEYS[Math.floor(Math.random() * PRACTICE_KEYS.length)]!;
}

/** Random integer 1..max inclusive. */
function rand1(max: number): number {
  return 1 + Math.floor(Math.random() * max);
}

/** Crypto-strength-ish opaque id (good enough to prevent trivial reading). */
function promptId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Generate a scale-degree prompt. Establishes key, picks a degree (1–7), and
 * returns the MIDI of a note in a comfortable guitar register for that degree.
 */
export function generateScaleDegreePrompt(opts?: {
  keyName?: string;
  quality?: ScaleQuality;
  targetDegree?: number;
}): ScaleDegreePrompt {
  const tonic = opts?.keyName ?? randomKey();
  const quality: ScaleQuality = opts?.quality ?? "major";
  const k = key(tonic, quality);
  const degree =
    opts?.targetDegree && opts.targetDegree >= 1 && opts.targetDegree <= 7
      ? opts.targetDegree
      : rand1(7);
  const spelled = k.degrees[degree - 1]!;
  const pc = spelledToPc(spelled);

  // Place the test note in a comfortable register around middle C / open-position
  // guitar. Pick an octave so the MIDI sits roughly 55–72 (G3 to C5).
  // We anchor from MIDI 60 (C4) and project the pc into a target window.
  const base = 48 + pc; // C3 + pc — pick the nearest of this / +12 / +24 in window
  let midi = base;
  while (midi < 55) midi += 12;
  while (midi > 76) midi -= 12;

  return {
    exerciseType: "scale-degree",
    promptId: promptId(),
    key: tonic,
    quality,
    degree,
    noteName: spell(spelled),
    midi,
  };
}

/**
 * Generate a chord-quality prompt. Picks a diatonic triad (or a sus4) in a
 * random key and returns the root MIDI; the client builds the chord upward.
 */
export function generateChordQualityPrompt(opts?: {
  keyName?: string;
  quality?: ScaleQuality;
}): ChordQualityPrompt {
  const tonic = opts?.keyName ?? randomKey();
  const quality: ScaleQuality = opts?.quality ?? "major";
  const k = key(tonic, quality);

  // 75% diatonic (maj/min/dim from the key), 25% sus4 (color, non-diatonic).
  const useSus = Math.random() < 0.25;
  if (useSus) {
    // Sus4 built on a random scale degree: root + perfect 4th + perfect 5th.
    const degree = rand1(7);
    const root = k.degrees[degree - 1]!;
    const rootPc = spelledToPc(root);
    const rootMidi = pickComfortableMidi(rootPc);
    const letter = parseSpelled(spell(root)).letter;
    const name = `${spell(root)}sus4`;
    return {
      exerciseType: "chord-quality",
      promptId: promptId(),
      key: tonic,
      quality,
      chordQuality: "sus4",
      chordName: name,
      rootMidi,
    };
    void letter; // (kept for future enharmonic handling)
  }

  const triads = diatonicTriads(k);
  const triad = triads[rand1(7) - 1]!;
  const rootPc = spelledToPc(triad.root);
  const rootMidi = pickComfortableMidi(rootPc);
  const qualityMap: Record<string, "major" | "minor" | "diminished"> = {
    maj: "major",
    min: "minor",
    dim: "diminished",
  };
  const suffix = triad.quality === "dim" ? "dim" : triad.quality === "min" ? "m" : "";
  return {
    exerciseType: "chord-quality",
    promptId: promptId(),
    key: tonic,
    quality,
    chordQuality: qualityMap[triad.quality]!,
    chordName: `${spell(triad.root)}${suffix}`,
    rootMidi,
  };
}

/** Pick the MIDI for a pitch class in a comfortable register (G3..C5). */
function pickComfortableMidi(pc: number): number {
  let midi = 48 + pc; // C3 + pc
  while (midi < 55) midi += 12;
  while (midi > 76) midi -= 12;
  return midi;
}

/**
 * Build the three MIDI notes of a diatonic triad in a key, given the chord's
 * scale degree. Returns [root, third, fifth] MIDIs in a comfortable register,
 * with the third and fifth voiced above the root within an octave.
 */
function triadMidisForDegree(k: ReturnType<typeof key>, degree: number): number[] {
  const triads = diatonicTriads(k);
  const triad = triads[degree - 1]!;
  const rootPc = spelledToPc(triad.root);
  const thirdPc = spelledToPc(triad.third);
  const fifthPc = spelledToPc(triad.fifth);
  const rootMidi = pickComfortableMidi(rootPc);
  // Place third and fifth above the root within an octave
  const upTo = (targetPc: number, anchor: number): number => {
    let m = anchor + (((targetPc - (anchor % 12)) + 12) % 12);
    while (m < anchor) m += 12;
    return m;
  };
  return [rootMidi, upTo(thirdPc, rootMidi), upTo(fifthPc, rootMidi)];
}

/**
 * Generate a progression prompt. Picks one of the common worship patterns at
 * random and renders it in a random key, returning per-chord MIDI triads for
 * the client to play.
 */
export function generateProgressionPrompt(opts?: {
  keyName?: string;
  quality?: ScaleQuality;
}): ProgressionPrompt {
  const tonic = opts?.keyName ?? randomKey();
  const quality: ScaleQuality = opts?.quality ?? "major";
  const k = key(tonic, quality);

  const prog = WORSHIP_PROGRESSIONS[Math.floor(Math.random() * WORSHIP_PROGRESSIONS.length)]!;
  const chordNames = renderProgression(prog as TheoryProgression, tonic, quality);

  // For each chord in the progression, parse the scale degree from the NNS
  // symbol ("6-" → 6) and compute the triad MIDIs.
  const chordMidis: number[][] = prog.numbers.map((sym) => {
    const degree = parseInt(sym.replace(/[^0-9]/g, ""), 10);
    return triadMidisForDegree(k, degree);
  });

  // Friendly pattern name: "1-5-6-4"
  const patternName = prog.numbers
    .map((n) => n.replace("-", "♭")) // visualize minor as flat, optional
    .join("-")
    .replace(/♭/g, "-"); // keep original dash style for the answer key
  const canonicalName = prog.name; // e.g. "1–5–6–4" (en-dash)

  return {
    exerciseType: "progression",
    promptId: promptId(),
    key: tonic,
    quality,
    patternName: canonicalName,
    numbers: prog.numbers,
    chordNames,
    chordMidis,
  };
}

/** Dispatch prompt generation by exercise type. */
export function generatePrompt(
  exerciseType: "scale-degree" | "chord-quality" | "progression",
  opts?: { keyName?: string; quality?: ScaleQuality; targetDegree?: number },
): EarTrainingPrompt {
  if (exerciseType === "scale-degree") {
    return generateScaleDegreePrompt({
      keyName: opts?.keyName,
      quality: opts?.quality,
      targetDegree: opts?.targetDegree,
    });
  }
  if (exerciseType === "chord-quality") return generateChordQualityPrompt(opts);
  return generateProgressionPrompt(opts);
}

/**
 * Compute rolling stats for an exercise type from raw attempts.
 * - recentAccuracy: accuracy over the last 20 attempts
 * - mastery: exponentially-weighted recency score, 0..1 (recent attempts
 *   count more than old ones — rewards current competence, not historical)
 * - bestStreak: longest unbroken run of correct answers (chronological)
 */
export function computeStats(
  attempts: Array<{ correct: number; date: string }>,
): { total: number; correct: number; recentAccuracy: number; mastery: number; bestStreak: number } {
  const total = attempts.length;
  if (total === 0) {
    return { total: 0, correct: 0, recentAccuracy: 0, mastery: 0, bestStreak: 0 };
  }

  // Chronological order (oldest first) for streak + EWMA computation.
  const chrono = [...attempts].sort((a, b) => a.date.localeCompare(b.date));
  const correct = chrono.filter((a) => a.correct === 1).length;

  // recentAccuracy: last 20
  const recent = chrono.slice(-20);
  const recentCorrect = recent.filter((a) => a.correct === 1).length;
  const recentAccuracy = recent.length === 0 ? 0 : recentCorrect / recent.length;

  // EWMA: α=0.15 — recent attempts weigh ~15%, decays over ~6-7 attempts.
  // Start from 0.5 (uncertain) and let evidence pull it toward truth.
  const alpha = 0.15;
  let ewma = 0.5;
  for (const a of chrono) {
    const target = a.correct === 1 ? 1 : 0;
    ewma = ewma + alpha * (target - ewma);
  }

  // bestStreak
  let bestStreak = 0;
  let run = 0;
  for (const a of chrono) {
    if (a.correct === 1) {
      run += 1;
      bestStreak = Math.max(bestStreak, run);
    } else {
      run = 0;
    }
  }

  return {
    total,
    correct,
    recentAccuracy,
    mastery: Math.max(0, Math.min(1, ewma)),
    bestStreak,
  };
}
