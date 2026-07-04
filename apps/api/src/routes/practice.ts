/**
 * Practice-session routes (the journal).
 * POST /api/practice         — log a session
 * GET  /api/practice         — list sessions (newest first)
 */

import { Router } from "express";
import { insertReturning, all } from "../db/client.js";
import { PracticeSessionInputSchema } from "@lag/shared";

export const practiceRouter = Router();

practiceRouter.post("/", (req, res) => {
  const parsed = PracticeSessionInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: { message: "Invalid input", code: "VALIDATION", details: parsed.error.flatten() },
    });
    return;
  }
  const input = parsed.data;
  const date = input.date ?? new Date().toISOString();
  const row = insertReturning(
    `INSERT INTO practice_sessions (date, duration_sec, notes, module_id, lesson_id)
     VALUES (?, ?, ?, ?, ?)
     RETURNING id, date, duration_sec AS durationSec, notes, module_id AS moduleId, lesson_id AS lessonId`,
    date,
    input.durationSec,
    input.notes ?? null,
    input.moduleId ?? null,
    input.lessonId ?? null,
  );
  res.status(201).json({ ok: true, data: row });
});

practiceRouter.get("/", (_req, res) => {
  const rows = all(
    `SELECT id, date, duration_sec AS durationSec, notes, module_id AS moduleId, lesson_id AS lessonId
     FROM practice_sessions
     ORDER BY date DESC`,
  );
  res.json({ ok: true, data: rows });
});
