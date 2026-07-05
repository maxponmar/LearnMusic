/**
 * Ear-training routes.
 * GET  /api/ear-training/prompts/new?type=scale-degree  — get a fresh prompt
 * POST /api/ear-training/attempts                        — log an attempt
 * GET  /api/ear-training/attempts                        — list attempts
 * GET  /api/ear-training/stats?type=scale-degree         — rolling stats
 */

import { Router } from "express";
import { insertReturning, all } from "../db/client.js";
import { EarTrainingAttemptInputSchema } from "@lag/shared";
import { generatePrompt, computeStats } from "../services/earTrainingPrompts.js";
import { generateAdaptivePrompt } from "../services/adaptiveEar.js";
import { submitReviewResult } from "../services/learningEngine.js";
import { ratingFromCorrect } from "../services/srs.js";

export const earTrainingRouter = Router();

/** GET /api/ear-training/prompts/new?type=scale-degree|adaptive — fresh server-generated prompt. */
earTrainingRouter.get("/prompts/new", (req, res) => {
  const rawType = String(req.query.type ?? "scale-degree");
  if (rawType === "adaptive") {
    res.json({ ok: true, data: generateAdaptivePrompt() });
    return;
  }
  const type = (
    ["scale-degree", "chord-quality", "progression"].includes(rawType)
      ? rawType
      : "scale-degree"
  ) as "scale-degree" | "chord-quality" | "progression";
  const keyName = typeof req.query.key === "string" ? req.query.key : undefined;
  const degree = typeof req.query.degree === "string" ? Number(req.query.degree) : undefined;
  const prompt = generatePrompt(type, {
    keyName,
    targetDegree: Number.isFinite(degree) ? degree : undefined,
  });
  res.json({ ok: true, data: prompt });
});

earTrainingRouter.post("/attempts", (req, res) => {
  const parsed = EarTrainingAttemptInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: { message: "Invalid input", code: "VALIDATION", details: parsed.error.flatten() },
    });
    return;
  }
  const a = parsed.data;
  const row = insertReturning(
    `INSERT INTO ear_training_attempts
       (exercise_type, prompt, correct_answer, user_answer, correct, response_ms)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING
       id, date,
       exercise_type AS exerciseType, prompt,
       correct_answer AS correctAnswer, user_answer AS userAnswer,
       correct, response_ms AS responseMs`,
    a.exerciseType,
    a.prompt,
    a.correctAnswer,
    a.userAnswer,
    a.correct ? 1 : 0,
    a.responseMs,
  );

  // Update SRS for scale-degree / chord-quality / progression skills
  const skillKey = skillKeyForAttempt(a.exerciseType, a.prompt);
  if (skillKey) {
    const rating = ratingFromCorrect(a.correct, a.responseMs);
    submitReviewResult(skillKey, rating);
  }

  res.status(201).json({ ok: true, data: row });
});

function skillKeyForAttempt(exerciseType: string, prompt: string): string | null {
  if (exerciseType === "chord-quality") return "diatonic-triads";
  if (exerciseType === "progression") return "progression-ear";
  try {
    const p = JSON.parse(prompt) as { degree?: number };
    if (p.degree === 1) return "scale-degree-1";
    if (p.degree === 3) return "scale-degree-3";
    if (p.degree === 5) return "scale-degree-5";
    return "scale-degree-1";
  } catch {
    return "scale-degree-1";
  }
}

earTrainingRouter.get("/attempts", (req, res) => {
  const rows = all(
    `SELECT
       id, date,
       exercise_type AS exerciseType, prompt,
       correct_answer AS correctAnswer, user_answer AS userAnswer,
       correct, response_ms AS responseMs
     FROM ear_training_attempts
     ${req.query.type ? "WHERE exercise_type = ?" : ""}
     ORDER BY date DESC`,
    ...(req.query.type ? [String(req.query.type)] : []),
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/ear-training/stats?type=scale-degree — rolling stats + mastery. */
earTrainingRouter.get("/stats", (req, res) => {
  const rawType = String(req.query.type ?? "scale-degree");
  const type = (
    ["scale-degree", "chord-quality", "progression"].includes(rawType)
      ? rawType
      : "scale-degree"
  ) as "scale-degree" | "chord-quality" | "progression";
  const rows = all<{ correct: number; date: string }>(
    `SELECT correct, date FROM ear_training_attempts
     WHERE exercise_type = ?
     ORDER BY date ASC`,
    type,
  );
  const stats = computeStats(rows);
  res.json({
    ok: true,
    data: { exerciseType: type, ...stats },
  });
});
