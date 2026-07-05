/**
 * Learning path routes — today session, path map, unit progress, SRS reviews.
 */

import { Router } from "express";
import { CompleteUnitInputSchema, ReviewResultInputSchema } from "@lag/shared";
import {
  buildTodaySession,
  buildPath,
  getUnitProgressList,
  startUnit,
  completeUnit,
  submitReviewResult,
  listReviewCards,
  getUnitById,
  setLastBpm,
} from "../services/learningEngine.js";

export const pathRouter = Router();

/** GET /api/path/today — algorithm-built daily session. */
pathRouter.get("/today", (_req, res) => {
  res.json({ ok: true, data: buildTodaySession() });
});

/** GET /api/path — full path with lock/unlock status. */
pathRouter.get("/", (_req, res) => {
  res.json({ ok: true, data: buildPath() });
});

/** GET /api/path/progress — unit progress rows. */
pathRouter.get("/progress", (_req, res) => {
  res.json({ ok: true, data: getUnitProgressList() });
});

/** GET /api/path/units/:id — single unit with status. */
pathRouter.get("/units/:id", (req, res) => {
  const unit = getUnitById(req.params.id!);
  if (!unit) {
    res.status(404).json({ ok: false, error: { message: "Unit not found", code: "NOT_FOUND" } });
    return;
  }
  res.json({ ok: true, data: unit });
});

/** POST /api/path/units/:id/start */
pathRouter.post("/units/:id/start", (req, res) => {
  try {
    const progress = startUnit(req.params.id!);
    res.json({ ok: true, data: progress });
  } catch {
    res.status(404).json({ ok: false, error: { message: "Unit not found", code: "NOT_FOUND" } });
  }
});

/** POST /api/path/units/:id/complete */
pathRouter.post("/units/:id/complete", (req, res) => {
  const parsed = CompleteUnitInputSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: { message: "Invalid input", code: "VALIDATION" } });
    return;
  }
  try {
    const progress = completeUnit(req.params.id!, parsed.data.timeSpentSec ?? 0);
    res.json({ ok: true, data: progress });
  } catch {
    res.status(404).json({ ok: false, error: { message: "Unit not found", code: "NOT_FOUND" } });
  }
});

/** GET /api/path/reviews — all SRS cards. */
pathRouter.get("/reviews", (_req, res) => {
  res.json({ ok: true, data: listReviewCards() });
});

/** POST /api/path/reviews — submit SRS rating for a skill. */
pathRouter.post("/reviews", (req, res) => {
  const parsed = ReviewResultInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: { message: "Invalid input", code: "VALIDATION" } });
    return;
  }
  const card = submitReviewResult(parsed.data.skillKey, parsed.data.rating);
  res.json({ ok: true, data: card });
});

/** PUT /api/path/settings/bpm — persist last-used BPM. */
pathRouter.put("/settings/bpm", (req, res) => {
  const bpm = Number(req.body?.bpm);
  if (!Number.isFinite(bpm) || bpm < 40 || bpm > 240) {
    res.status(400).json({ ok: false, error: { message: "BPM must be 40–240", code: "VALIDATION" } });
    return;
  }
  setLastBpm(bpm);
  res.json({ ok: true, data: { bpm } });
});
