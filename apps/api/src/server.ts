/**
 * Express server entry point.
 *
 * Single-user backend for the worship-guitar learning app. No auth (local
 * only). Routes are mounted under /api/*; the root serves a health check.
 *
 * Run with `pnpm dev` (tsx watch) or `pnpm start` (compiled).
 */

import express from "express";
import cors from "cors";
import { lessonsRouter } from "./routes/lessons.js";
import { practiceRouter } from "./routes/practice.js";
import { earTrainingRouter } from "./routes/earTraining.js";
import { progressRouter } from "./routes/progress.js";
import { DB_PATH } from "./db/client.js";

const app = express();
app.use(cors()); // permissive CORS — Vite dev server is on a different port
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "@lag/api", db: DB_PATH, time: new Date().toISOString() });
});

// Routes
app.use("/api/lessons", lessonsRouter);
app.use("/api/practice", practiceRouter);
app.use("/api/ear-training", earTrainingRouter);
app.use("/api/progress", progressRouter);

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: { message: "Not found", code: "NOT_FOUND" } });
});

// Error handler (must have 4 args)
app.use(((err, _req, res, _next) => {
  console.error("[api] unhandled error:", err);
  res.status(500).json({ ok: false, error: { message: "Internal error", code: "INTERNAL" } });
}) as express.ErrorRequestHandler);

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}  (db: ${DB_PATH})`);
});

export { app };
