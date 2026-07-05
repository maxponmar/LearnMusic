/**
 * Learning engine — builds daily sessions and path state from curriculum + DB progress.
 */

import {
  MODULES,
  UNITS,
  nextAvailableUnit,
  prerequisitesMet,
  getUnit,
  SKILLS,
} from "@lag/curriculum";
import type {
  TodaySession,
  TodaySessionStep,
  PathModule,
  PathUnit,
  UnitProgress,
  ReviewCard,
  UnitStatus,
} from "@lag/shared";
import { all, get, run } from "../db/client.js";
import { isDue, newReviewCard, scheduleReview, type ReviewCardState } from "./srs.js";
import type { ReviewRating } from "@lag/shared";

function loadUnitProgress(): Map<string, UnitProgress> {
  const rows = all<{
    unitId: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    timeSpentSec: number;
  }>(
    `SELECT unit_id AS unitId, status, started_at AS startedAt,
            completed_at AS completedAt, time_spent_sec AS timeSpentSec
     FROM unit_progress`,
  );
  const map = new Map<string, UnitProgress>();
  for (const r of rows) {
    map.set(r.unitId, {
      unitId: r.unitId,
      status: r.status as UnitProgress["status"],
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      timeSpentSec: r.timeSpentSec,
    });
  }
  return map;
}

function completedIds(progress: Map<string, UnitProgress>): Set<string> {
  const ids = new Set<string>();
  for (const [id, p] of progress) {
    if (p.status === "complete") ids.add(id);
  }
  return ids;
}

function unitStatus(unitId: string, progress: Map<string, UnitProgress>, done: Set<string>): UnitStatus {
  const p = progress.get(unitId);
  if (p?.status === "complete") return "complete";
  if (p?.status === "started") return "started";
  const unit = getUnit(unitId);
  if (!unit) return "locked";
  if (prerequisitesMet(unit, done)) return "not_started";
  return "locked";
}

export function buildPath(): PathModule[] {
  const progress = loadUnitProgress();
  const done = completedIds(progress);

  return MODULES.map((mod) => ({
    ...mod,
    units: UNITS.filter((u) => u.moduleId === mod.id).map(
      (u): PathUnit => ({
        id: u.id,
        title: u.title,
        moduleId: u.moduleId,
        moduleName: u.moduleName,
        order: u.order,
        type: u.type,
        skills: u.skills,
        html: u.html,
        practice: u.practice,
        unlockAfter: u.unlockAfter,
        passCriteria: u.passCriteria,
        deepDiveLessonId: u.deepDiveLessonId,
        estimatedMinutes: u.estimatedMinutes,
        status: unitStatus(u.id, progress, done),
      }),
    ),
  }));
}

function loadReviewCards(): ReviewCardState[] {
  return all<{
    skillKey: string;
    nextReviewAt: string;
    intervalDays: number;
    easeFactor: number;
    repetitions: number;
    lastResult: ReviewRating | null;
  }>(
    `SELECT skill_key AS skillKey, next_review_at AS nextReviewAt,
            interval_days AS intervalDays, ease_factor AS easeFactor,
            repetitions, last_result AS lastResult
     FROM review_cards`,
  );
}

function dueReviews(now = new Date()): ReviewCardState[] {
  return loadReviewCards().filter((c) => isDue(c, now));
}

function getLastBpm(): number {
  const row = get<{ value: string }>(`SELECT value FROM user_settings WHERE key = 'lastBpm'`);
  const n = row ? Number(row.value) : 60;
  return Number.isFinite(n) ? Math.min(240, Math.max(40, n)) : 60;
}

export function buildTodaySession(): TodaySession {
  const progress = loadUnitProgress();
  const done = completedIds(progress);
  const next = nextAvailableUnit(done);
  const due = dueReviews();
  const bpm = getLastBpm();
  const steps: TodaySessionStep[] = [];
  let minutes = 0;

  steps.push({
    kind: "warmup",
    title: "Warm up with the click",
    description: `Metronome at ${bpm} BPM — clap or muted strum for 2 minutes.`,
    bpm,
    minutes: 2,
    href: `/app/metronome?bpm=${bpm}`,
  });
  minutes += 2;

  if (next) {
    steps.push({
      kind: "unit",
      title: next.title,
      description: `${next.moduleName} · ~${next.estimatedMinutes} min`,
      unitId: next.id,
      minutes: next.estimatedMinutes,
      href: `/app/units/${next.id}`,
    });
    minutes += next.estimatedMinutes;
  }

  const reviewSlice = due.slice(0, 8);
  if (reviewSlice.length > 0) {
    steps.push({
      kind: "review",
      title: `Review ${reviewSlice.length} skill${reviewSlice.length > 1 ? "s" : ""}`,
      description: reviewSlice.map((c) => SKILLS[c.skillKey]?.label ?? c.skillKey).join(", "),
      minutes: Math.min(10, reviewSlice.length * 2),
      href: "/app/ear-training?mode=adaptive",
    });
    minutes += Math.min(10, reviewSlice.length * 2);
  }

  if (done.size >= 10) {
    steps.push({
      kind: "apply",
      title: "Play a song section in time",
      description: "Use practice mode: guitar + metronome together.",
      minutes: 10,
      href: "/app/songs",
    });
    minutes += 10;
  }

  steps.push({
    kind: "log",
    title: "Log your session",
    description: "Note what felt easy or hard.",
    minutes: 2,
    href: "/app/journal",
  });
  minutes += 2;

  return {
    steps,
    nextUnitId: next?.id ?? null,
    dueReviewCount: due.length,
    estimatedMinutes: minutes,
  };
}

export function getUnitProgressList(): UnitProgress[] {
  return [...loadUnitProgress().values()];
}

export function startUnit(unitId: string): UnitProgress {
  const unit = getUnit(unitId);
  if (!unit) throw new Error("Unit not found");
  const now = new Date().toISOString();
  run(
    `INSERT INTO unit_progress (unit_id, status, started_at, time_spent_sec)
     VALUES (?, 'started', ?, 0)
     ON CONFLICT(unit_id) DO UPDATE SET
       status = CASE WHEN unit_progress.status = 'complete' THEN 'complete' ELSE 'started' END,
       started_at = COALESCE(unit_progress.started_at, excluded.started_at)`,
    unitId,
    now,
  );
  ensureReviewCardsForUnit(unit);
  return getUnitProgressList().find((p) => p.unitId === unitId)!;
}

export function completeUnit(unitId: string, timeSpentSec = 0): UnitProgress {
  const now = new Date().toISOString();
  run(
    `INSERT INTO unit_progress (unit_id, status, started_at, completed_at, time_spent_sec)
     VALUES (?, 'complete', ?, ?, ?)
     ON CONFLICT(unit_id) DO UPDATE SET
       status = 'complete',
       completed_at = excluded.completed_at,
       time_spent_sec = unit_progress.time_spent_sec + excluded.time_spent_sec`,
    unitId,
    now,
    now,
    timeSpentSec,
  );
  const unit = getUnit(unitId);
  if (unit) ensureReviewCardsForUnit(unit);
  return getUnitProgressList().find((p) => p.unitId === unitId)!;
}

function ensureReviewCardsForUnit(unit: { skills: string[] }): void {
  for (const skillKey of unit.skills) {
    const existing = get(`SELECT skill_key FROM review_cards WHERE skill_key = ?`, skillKey);
    if (!existing) {
      const card = newReviewCard(skillKey);
      run(
        `INSERT INTO review_cards (skill_key, next_review_at, interval_days, ease_factor, repetitions, last_result)
         VALUES (?, ?, ?, ?, ?, NULL)`,
        card.skillKey,
        card.nextReviewAt,
        card.intervalDays,
        card.easeFactor,
        card.repetitions,
      );
    }
  }
}

export function submitReviewResult(skillKey: string, rating: ReviewRating): ReviewCard {
  let card = loadReviewCards().find((c) => c.skillKey === skillKey);
  if (!card) card = newReviewCard(skillKey);
  const updated = scheduleReview(card, rating);
  run(
    `INSERT INTO review_cards (skill_key, next_review_at, interval_days, ease_factor, repetitions, last_result)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(skill_key) DO UPDATE SET
       next_review_at = excluded.next_review_at,
       interval_days = excluded.interval_days,
       ease_factor = excluded.ease_factor,
       repetitions = excluded.repetitions,
       last_result = excluded.last_result`,
    updated.skillKey,
    updated.nextReviewAt,
    updated.intervalDays,
    updated.easeFactor,
    updated.repetitions,
    updated.lastResult,
  );
  // Sync skill_progress mastery loosely from ease/interval
  const mastery = Math.min(1, updated.repetitions * 0.15 + (updated.easeFactor - 1.3) * 0.2);
  run(
    `INSERT INTO skill_progress (skill_key, level, last_practiced_at, mastery_score)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(skill_key) DO UPDATE SET
       level = excluded.level,
       last_practiced_at = excluded.last_practiced_at,
       mastery_score = excluded.mastery_score`,
    skillKey,
    Math.max(1, Math.min(5, Math.ceil(mastery * 5))),
    new Date().toISOString(),
    mastery,
  );
  return {
    skillKey: updated.skillKey,
    nextReviewAt: updated.nextReviewAt,
    intervalDays: updated.intervalDays,
    easeFactor: updated.easeFactor,
    repetitions: updated.repetitions,
    lastResult: updated.lastResult,
  };
}

export function listReviewCards(): ReviewCard[] {
  return loadReviewCards().map((c) => ({
    skillKey: c.skillKey,
    nextReviewAt: c.nextReviewAt,
    intervalDays: c.intervalDays,
    easeFactor: c.easeFactor,
    repetitions: c.repetitions,
    lastResult: c.lastResult,
  }));
}

export function getDueSkillKeys(now = new Date()): string[] {
  return dueReviews(now).map((c) => c.skillKey);
}

export function setLastBpm(bpm: number): void {
  run(
    `INSERT INTO user_settings (key, value) VALUES ('lastBpm', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    String(bpm),
  );
}

export function getUnitById(unitId: string): PathUnit | undefined {
  return buildPath().flatMap((m) => m.units).find((u) => u.id === unitId);
}
