/**
 * @lag/shared — the API contract between the React app and the Express backend.
 *
 * Every zod schema here is the single source of truth. Derive TypeScript types
 * with `z.infer<typeof Schema>`; never hand-write the types twice. The API
 * validates request bodies against these schemas, and the client validates
 * responses against them — both sides share the exact same contract.
 *
 * Naming convention: `<Thing>Schema` → type `<Thing>`; request bodies are
 * suffixed `Input`, payloads `Output` where the two differ.
 */

import { z } from "zod";

// ----------------------------------------------------------------------------
// Primitives
// ----------------------------------------------------------------------------

export const isoTimestamp = z.string().datetime();

// A musical key, e.g. "G", "Bb", "F#". We accept letters with optional '#'/b.
export const keyName = z
  .string()
  .regex(/^[A-G](#|b)?$/, "Key must be a letter A–G with optional # or b");

export const scaleQuality = z.enum(["major", "minor"]);

// ----------------------------------------------------------------------------
// Lessons
// ----------------------------------------------------------------------------

export const LessonSummarySchema = z.object({
  id: z.string(), // slug, e.g. "0001-name-any-note"
  title: z.string(),
  module: z.string(), // e.g. "Fretboard landmarks"
  moduleId: z.string(),
  order: z.number().int().nonnegative(),
  minutes: z.number().int().positive(),
});
export type LessonSummary = z.infer<typeof LessonSummarySchema>;

export const LessonSchema = LessonSummarySchema.extend({
  /** Raw HTML body of the lesson (rendered client-side). */
  html: z.string(),
  /** Estimated minutes to complete. */
  estimatedMinutes: z.number().int().positive(),
});
export type Lesson = z.infer<typeof LessonSchema>;

// ----------------------------------------------------------------------------
// Practice sessions (the journal)
// ----------------------------------------------------------------------------

export const PracticeSessionInputSchema = z.object({
  date: isoTimestamp.optional(), // defaults to now on the server
  durationSec: z.number().int().positive().max(60 * 60 * 6, "Max 6h per session"),
  notes: z.string().max(2000).optional(),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
  unitId: z.string().optional(),
});
export type PracticeSessionInput = z.infer<typeof PracticeSessionInputSchema>;

export const PracticeSessionSchema = PracticeSessionInputSchema.extend({
  id: z.number().int(),
  date: isoTimestamp,
  unitId: z.string().optional(),
});
export type PracticeSession = z.infer<typeof PracticeSessionSchema>;

// ----------------------------------------------------------------------------
// Ear-training attempts
// ----------------------------------------------------------------------------

export const ExerciseTypeSchema = z.enum([
  "scale-degree", // "what degree was that note?"
  "chord-quality", // "major, minor, sus, or diminished?"
  "progression", // "1-5-6-4 or 1-4-5?"
  "key-id", // "what key is this cadence in?"
]);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

export const EarTrainingAttemptInputSchema = z.object({
  exerciseType: ExerciseTypeSchema,
  prompt: z.string(), // serialized prompt (key, degrees, etc.)
  correctAnswer: z.string(),
  userAnswer: z.string(),
  correct: z.boolean(),
  responseMs: z.number().int().nonnegative(),
});
export type EarTrainingAttemptInput = z.infer<typeof EarTrainingAttemptInputSchema>;

export const EarTrainingAttemptSchema = EarTrainingAttemptInputSchema.extend({
  id: z.number().int(),
  date: isoTimestamp,
});
export type EarTrainingAttempt = z.infer<typeof EarTrainingAttemptSchema>;

// ----------------------------------------------------------------------------
// Ear-training prompts (server-generated) & stats (server-computed)
// ----------------------------------------------------------------------------

/** A single generated prompt, delivered before the user answers. */
export const ScaleDegreePromptSchema = z.object({
  exerciseType: z.literal("scale-degree"),
  promptId: z.string(), // opaque id, echoed back on submit (no cheating by re-reading)
  key: keyName, // e.g. "G" — the established tonal center
  quality: scaleQuality,
  /** The correct scale degree 1–7 (the answer the user must identify). */
  degree: z.number().int().min(1).max(7),
  /** Spelled note name in this key, e.g. "F#" for degree 3 in D major. */
  noteName: z.string(),
  /** MIDI note number actually played (for client-side audio). */
  midi: z.number().int(),
});
export type ScaleDegreePrompt = z.infer<typeof ScaleDegreePromptSchema>;

export const ChordQualityPromptSchema = z.object({
  exerciseType: z.literal("chord-quality"),
  promptId: z.string(),
  key: keyName,
  quality: scaleQuality,
  /** "major" | "minor" | "diminished" | "sus4" — the correct answer. */
  chordQuality: z.enum(["major", "minor", "diminished", "sus4"]),
  /** Concrete chord name in this key, e.g. "Em". */
  chordName: z.string(),
  /** Root MIDI (the chord is built up from here for playback). */
  rootMidi: z.number().int(),
});
export type ChordQualityPrompt = z.infer<typeof ChordQualityPromptSchema>;

export const ProgressionPromptSchema = z.object({
  exerciseType: z.literal("progression"),
  promptId: z.string(),
  key: keyName,
  quality: scaleQuality,
  /** The canonical pattern name, e.g. "1-5-6-4". This is the answer. */
  patternName: z.string(),
  /** Nashville numbers as strings, e.g. ["1","5","6-","4"]. */
  numbers: z.array(z.string()),
  /** Concrete chord names in this key, e.g. ["G","D","Em","C"]. */
  chordNames: z.array(z.string()),
  /** Per-chord MIDI note arrays for playback (triads). */
  chordMidis: z.array(z.array(z.number().int())),
});
export type ProgressionPrompt = z.infer<typeof ProgressionPromptSchema>;

export const EarTrainingPromptSchema = z.discriminatedUnion("exerciseType", [
  ScaleDegreePromptSchema,
  ChordQualityPromptSchema,
  ProgressionPromptSchema,
]);
export type EarTrainingPrompt = z.infer<typeof EarTrainingPromptSchema>;

/** Stats returned to the UI for the dashboard. */
export const EarTrainingStatsSchema = z.object({
  exerciseType: ExerciseTypeSchema,
  total: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  /** Correct / total over the last N attempts (rolling accuracy). */
  recentAccuracy: z.number().min(0).max(1),
  /** Weighted mastery 0..1 — recency-weighted, drives the skill-level meter. */
  mastery: z.number().min(0).max(1),
  /** Best unbroken streak of correct answers. */
  bestStreak: z.number().int().nonnegative(),
});
export type EarTrainingStats = z.infer<typeof EarTrainingStatsSchema>;

// ----------------------------------------------------------------------------
// Lesson progress & skill mastery
// ----------------------------------------------------------------------------

export const LessonStatusSchema = z.enum(["not_started", "started", "complete"]);
export type LessonStatus = z.infer<typeof LessonStatusSchema>;

export const LessonProgressSchema = z.object({
  lessonId: z.string(),
  status: LessonStatusSchema,
  startedAt: isoTimestamp.nullable(),
  completedAt: isoTimestamp.nullable(),
});
export type LessonProgress = z.infer<typeof LessonProgressSchema>;

export const SkillProgressSchema = z.object({
  skillKey: z.string(), // e.g. "fretboard-notes", "scale-degree-id"
  level: z.number().int().min(1).max(5),
  lastPracticedAt: isoTimestamp.nullable(),
  masteryScore: z.number().min(0).max(1),
});
export type SkillProgress = z.infer<typeof SkillProgressSchema>;

// ----------------------------------------------------------------------------
// Song charts (static library — validated when authoring seed data)
// ----------------------------------------------------------------------------

export const SongSectionSchema = z.object({
  name: z.string(),
  /** One NNS token per bar, e.g. ["1", "4", "1", "5"]. */
  bars: z.array(z.string()),
  note: z.string().optional(),
});
export type SongSection = z.infer<typeof SongSectionSchema>;

export const SongRepertoireSchema = z.enum(["general", "worship", "folk", "practice"]);
export type SongRepertoire = z.infer<typeof SongRepertoireSchema>;

export const SongChartSchema = z.object({
  slug: z.string(),
  title: z.string(),
  artist: z.string(),
  language: z.enum(["en", "es"]),
  defaultKey: keyName,
  timeSignature: z.string(),
  /** Suggested practice tempo (worship ballad/mid-tempo range). */
  bpm: z.number().int().min(40).max(240).optional(),
  /** Repertoire category for library filtering. */
  repertoire: SongRepertoireSchema.default("general"),
  /** Path stage order — songs recommended when user reaches this unit order. */
  recommendedAfterOrder: z.number().int().nonnegative().optional(),
  sections: z.array(SongSectionSchema),
  notes: z.string().optional(),
});
export type SongChartData = z.infer<typeof SongChartSchema>;

// ----------------------------------------------------------------------------
// Learning path (curriculum units)
// ----------------------------------------------------------------------------

export const UnitStatusSchema = z.enum(["not_started", "started", "complete", "locked"]);
export type UnitStatus = z.infer<typeof UnitStatusSchema>;

export const PracticeStepSchema = z.object({
  tool: z.enum(["metronome", "fretboard", "ear", "open-strings", "songs", "journal"]),
  label: z.string(),
  href: z.string().optional(),
  bpm: z.number().int().optional(),
  minutes: z.number().int().optional(),
});
export type PracticeStep = z.infer<typeof PracticeStepSchema>;

export const PassCriteriaSchema = z.object({
  type: z.enum(["manual", "ear-reps", "min-time"]),
  minSeconds: z.number().int().optional(),
  minAccuracy: z.number().min(0).max(1).optional(),
  minReps: z.number().int().optional(),
});
export type PassCriteria = z.infer<typeof PassCriteriaSchema>;

export const PathUnitSchema = z.object({
  id: z.string(),
  title: z.string(),
  moduleId: z.string(),
  moduleName: z.string(),
  order: z.number().int(),
  type: z.enum(["learn", "drill", "checkpoint", "apply"]),
  skills: z.array(z.string()),
  html: z.string(),
  practice: z.array(PracticeStepSchema),
  unlockAfter: z.array(z.string()),
  passCriteria: PassCriteriaSchema,
  deepDiveLessonId: z.string().optional(),
  estimatedMinutes: z.number().int(),
  status: UnitStatusSchema,
});
export type PathUnit = z.infer<typeof PathUnitSchema>;

export const PathModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().int(),
  goal: z.string(),
  units: z.array(PathUnitSchema),
});
export type PathModule = z.infer<typeof PathModuleSchema>;

export const UnitProgressSchema = z.object({
  unitId: z.string(),
  status: z.enum(["not_started", "started", "complete"]),
  startedAt: isoTimestamp.nullable(),
  completedAt: isoTimestamp.nullable(),
  timeSpentSec: z.number().int().nonnegative(),
});
export type UnitProgress = z.infer<typeof UnitProgressSchema>;

export const ReviewRatingSchema = z.enum(["again", "hard", "good", "easy"]);
export type ReviewRating = z.infer<typeof ReviewRatingSchema>;

export const ReviewCardSchema = z.object({
  skillKey: z.string(),
  nextReviewAt: isoTimestamp,
  intervalDays: z.number(),
  easeFactor: z.number(),
  repetitions: z.number().int(),
  lastResult: ReviewRatingSchema.nullable(),
});
export type ReviewCard = z.infer<typeof ReviewCardSchema>;

export const TodaySessionStepSchema = z.object({
  kind: z.enum(["warmup", "unit", "review", "apply", "log"]),
  title: z.string(),
  description: z.string(),
  unitId: z.string().optional(),
  skillKey: z.string().optional(),
  href: z.string().optional(),
  bpm: z.number().int().optional(),
  minutes: z.number().int(),
});
export type TodaySessionStep = z.infer<typeof TodaySessionStepSchema>;

export const TodaySessionSchema = z.object({
  steps: z.array(TodaySessionStepSchema),
  nextUnitId: z.string().nullable(),
  dueReviewCount: z.number().int(),
  estimatedMinutes: z.number().int(),
});
export type TodaySession = z.infer<typeof TodaySessionSchema>;

export const CompleteUnitInputSchema = z.object({
  timeSpentSec: z.number().int().nonnegative().optional(),
});
export type CompleteUnitInput = z.infer<typeof CompleteUnitInputSchema>;

export const ReviewResultInputSchema = z.object({
  skillKey: z.string(),
  rating: ReviewRatingSchema,
});
export type ReviewResultInput = z.infer<typeof ReviewResultInputSchema>;

// ----------------------------------------------------------------------------
// Standard API envelope
// ----------------------------------------------------------------------------

export function ok<T extends z.ZodTypeAny>(data: T) {
  return z.object({ ok: z.literal(true), data });
}
export function err() {
  return z.object({ ok: z.literal(false), error: z.object({ message: z.string(), code: z.string().optional() }) });
}
