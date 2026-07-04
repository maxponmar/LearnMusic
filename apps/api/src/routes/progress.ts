/**
 * Progress routes — lesson completion status and skill mastery.
 * GET  /api/progress/lessons           — list all lesson progress rows
 * PUT  /api/progress/lessons/:id        — upsert status (started/complete)
 * GET  /api/progress/skills             — list skill mastery rows
 */

import { Router } from "express";
import { all, run, get } from "../db/client.js";
import { LessonStatusSchema } from "@lag/shared";

export const progressRouter = Router();

progressRouter.get("/lessons", (_req, res) => {
  const rows = all(
    `SELECT lesson_id AS lessonId, status, started_at AS startedAt, completed_at AS completedAt
     FROM lesson_progress`,
  );
  res.json({ ok: true, data: rows });
});

/** PUT /api/progress/lessons/:id — body: { status: "started" | "complete" } */
progressRouter.put("/lessons/:id", (req, res) => {
  const lessonId = req.params.id;
  const parsed = LessonStatusSchema.safeParse(req.body?.status);
  if (!parsed.success || parsed.data === "not_started") {
    res.status(400).json({
      ok: false,
      error: { message: "Body must be { status: 'started' | 'complete' }", code: "VALIDATION" },
    });
    return;
  }
  const status = parsed.data;
  const now = new Date().toISOString();

  // Upsert: if a row exists, update it; otherwise insert.
  const existing = get<{ lessonId: string }>(
    `SELECT lesson_id AS lessonId FROM lesson_progress WHERE lesson_id = ?`,
    lessonId,
  );

  if (existing) {
    if (status === "started") {
      run(
        `UPDATE lesson_progress SET status = ?, started_at = COALESCE(started_at, ?) WHERE lesson_id = ?`,
        status,
        now,
        lessonId,
      );
    } else {
      run(
        `UPDATE lesson_progress SET status = ?, started_at = COALESCE(started_at, ?), completed_at = ? WHERE lesson_id = ?`,
        status,
        now,
        now,
        lessonId,
      );
    }
  } else {
    run(
      `INSERT INTO lesson_progress (lesson_id, status, started_at, completed_at) VALUES (?, ?, ?, ?)`,
      lessonId,
      status,
      status === "started" ? now : null,
      status === "complete" ? now : null,
    );
  }

  const row = get<{ lessonId: string; status: string; startedAt: string | null; completedAt: string | null }>(
    `SELECT lesson_id AS lessonId, status, started_at AS startedAt, completed_at AS completedAt
     FROM lesson_progress WHERE lesson_id = ?`,
    lessonId,
  );
  res.json({ ok: true, data: row });
});

progressRouter.get("/skills", (_req, res) => {
  const rows = all(
    `SELECT skill_key AS skillKey, level, last_practiced_at AS lastPracticedAt, mastery_score AS masteryScore
     FROM skill_progress`,
  );
  res.json({ ok: true, data: rows });
});
