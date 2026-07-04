/**
 * Database client — Node's built-in `node:sqlite`, used directly.
 *
 * We bypass Drizzle's session layer because Drizzle's `node-sqlite` driver is
 * only in the 1.0 RC line, and `drizzle-kit` doesn't support `node:sqlite` at
 * all. For a single-user app with four small tables, plain SQL with thin typed
 * wrappers is clearer and removes a fragile dependency. The Drizzle schema in
 * `./schema.ts` is kept as the canonical column/type reference; the runtime
 * uses `node:sqlite`'s prepared statements directly.
 *
 * The DB file lives at `DB_PATH` (default `./data/app.sqlite`); the directory
 * is created on first run.
 */

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the DB path relative to this package's root (apps/api), not the
// current working directory — so `pnpm db:migrate` (run from repo root) and
// `pnpm dev` (run from apps/api) hit the same file. Override with DB_PATH
// (absolute) to point elsewhere.
const defaultDbPath = fileURLToPath(new URL("../data/app.sqlite", import.meta.url));
const dbPath = process.env.DB_PATH ? resolve(process.env.DB_PATH) : defaultDbPath;
mkdirSync(dirname(dbPath), { recursive: true });

export const sqlite = new DatabaseSync(dbPath);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const DB_PATH = dbPath;

/**
 * Thin helpers over `node:sqlite`. Note: `node:sqlite`'s `StatementSync` has
 * no `.finalize()` (statements are GC'd), unlike better-sqlite3 — so these
 * helpers prepare, run, and discard in one call. For hot paths you'd cache
 * the prepared statement; for this app's volume that's not needed.
 */

/** Allowed bound parameter types for node:sqlite (see SQLInputValue). */
export type SqlParam = null | bigint | number | string | Uint8Array;

/** Run a statement that doesn't return rows (INSERT/UPDATE/DELETE/DDL). */
export function run(sql: string, ...params: SqlParam[]): void {
  sqlite.prepare(sql).run(...params);
}

/**
 * Run an INSERT ... RETURNING and return the first (only) returned row.
 * Returns `undefined` if the statement returned nothing.
 */
export function insertReturning<T = Record<string, unknown>>(sql: string, ...params: SqlParam[]): T | undefined {
  return sqlite.prepare(sql).get(...params) as T | undefined;
}

/** Query rows. Always returns an array. */
export function all<T = Record<string, unknown>>(sql: string, ...params: SqlParam[]): T[] {
  return sqlite.prepare(sql).all(...params) as T[];
}

/** Query a single row. Returns `undefined` if no rows. */
export function get<T = Record<string, unknown>>(sql: string, ...params: SqlParam[]): T | undefined {
  return sqlite.prepare(sql).get(...params) as T | undefined;
}
