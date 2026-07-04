-- 0001_initial.sql — Phase 1 schema for the worship-guitar learning app.
-- Hand-rolled (drizzle-kit doesn't support node:sqlite yet). Drizzle schema
-- in src/db/schema.ts stays in sync with this; if you change one, change both.

CREATE TABLE IF NOT EXISTS practice_sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  date          TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  duration_sec  INTEGER NOT NULL,
  notes         TEXT,
  module_id     TEXT,
  lesson_id     TEXT
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  lesson_id     TEXT PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'not_started'
                CHECK (status IN ('not_started','started','complete')),
  started_at    TEXT,
  completed_at  TEXT
);

CREATE TABLE IF NOT EXISTS ear_training_attempts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  date           TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  exercise_type  TEXT NOT NULL
                 CHECK (exercise_type IN ('scale-degree','chord-quality','progression','key-id')),
  prompt         TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer    TEXT NOT NULL,
  correct        INTEGER NOT NULL,  -- 0 or 1 (Drizzle reads as boolean)
  response_ms    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_progress (
  skill_key         TEXT PRIMARY KEY,
  level             INTEGER NOT NULL DEFAULT 1,  -- 1–5
  last_practiced_at TEXT,
  mastery_score     REAL NOT NULL DEFAULT 0      -- 0..1
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_date ON practice_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_date ON ear_training_attempts(date DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_type ON ear_training_attempts(exercise_type);
