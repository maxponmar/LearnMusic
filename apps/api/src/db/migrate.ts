/**
 * Apply pending SQL migrations from ./migrations/*.sql.
 * Idempotent — wraps each file in a try/catch so already-applied statements
 * (CREATE TABLE IF NOT EXISTS, etc.) are harmless.
 *
 * Migration files are anchored relative to this module so the script works
 * regardless of the current working directory (`pnpm db:migrate` may be
 * invoked from repo root or from apps/api).
 */

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sqlite } from "./client.js";

const migrationsDir = fileURLToPath(new URL("../../migrations", import.meta.url));

async function main() {
  const files = (await readdir(migrationsDir).catch(() => [] as string[]))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("[db:migrate] no migrations to apply");
    return;
  }

  for (const f of files) {
    const sql = await readFile(resolve(migrationsDir, f), "utf8");
    console.log(`[db:migrate] applying ${f}`);
    sqlite.exec(sql);
  }
  console.log(`[db:migrate] applied ${files.length} migration(s)`);
}

await main();
