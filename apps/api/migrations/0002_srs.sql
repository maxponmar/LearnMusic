-- 0002_srs.sql — unit progress, spaced repetition, user settings

CREATE TABLE IF NOT EXISTS unit_progress (
  unit_id       TEXT PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'not_started'
                CHECK (status IN ('not_started','started','complete')),
  started_at    TEXT,
  completed_at  TEXT,
  time_spent_sec INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS review_cards (
  skill_key       TEXT PRIMARY KEY,
  next_review_at  TEXT NOT NULL,
  interval_days   REAL NOT NULL DEFAULT 1,
  ease_factor     REAL NOT NULL DEFAULT 2.5,
  repetitions     INTEGER NOT NULL DEFAULT 0,
  last_result     TEXT CHECK (last_result IN ('again','hard','good','easy'))
);

CREATE TABLE IF NOT EXISTS user_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
