/**
 * Canonical schema reference — describes the four tables in plain TypeScript.
 *
 * This module is the *documentation* source of truth for the schema. The
 * runtime queries use `node:sqlite` directly (see ./client.ts) with hand-
 * authored SQL; the actual DDL lives in ../../migrations/0001_initial.sql.
 *
 * Keep these three in sync when changing the schema:
 *   1. This file (TS reference)
 *   2. ../../migrations/0001_initial.sql (DDL)
 *   3. The zod validators in packages/shared/src/index.ts (wire contract)
 */

export interface PracticeSessionRow {
  id: number;
  date: string; // ISO timestamp
  durationSec: number;
  notes: string | null;
  moduleId: string | null;
  lessonId: string | null;
  unitId: string | null;
}

export interface UnitProgressRow {
  unitId: string;
  status: "not_started" | "started" | "complete";
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSec: number;
}

export interface ReviewCardRow {
  skillKey: string;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastResult: "again" | "hard" | "good" | "easy" | null;
}

export interface LessonProgressRow {
  lessonId: string;
  status: "not_started" | "started" | "complete";
  startedAt: string | null;
  completedAt: string | null;
}

export interface EarTrainingAttemptRow {
  id: number;
  date: string;
  exerciseType: "scale-degree" | "chord-quality" | "progression" | "key-id";
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
  correct: number; // 0 | 1 (SQLite has no native bool)
  responseMs: number;
}

export interface SkillProgressRow {
  skillKey: string;
  level: number; // 1–5
  lastPracticedAt: string | null;
  masteryScore: number; // 0..1
}
