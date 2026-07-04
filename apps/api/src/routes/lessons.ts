/**
 * Lessons routes.
 *
 * The source of truth for lesson content is the `lessons/` directory at the
 * monorepo root (the teach-skill workspace). This route serves those HTML
 * files to the app's lesson reader.
 *
 * Lessons are authored as `NNNN-slug.html`. The front-matter is parsed out of
 * a leading HTML comment block in this exact form:
 *
 *   <!--
 *   title: Name any note on the fretboard
 *   module: Fretboard landmarks
 *   moduleId: fretboard-landmarks
 *   minutes: 15
 *   -->
 *
 * Anything more complex should move to MDX or a real front-matter parser later.
 */

import { Router } from "express";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export const LESSONS_DIR = process.env.LESSONS_DIR
  ? join(process.env.LESSONS_DIR)
  : join(process.cwd(), "..", "..", "lessons"); // apps/api → repo root → lessons/

interface ParsedLessonMeta {
  id: string;
  title: string;
  module: string;
  moduleId: string;
  minutes: number;
  order: number;
}

const META_RE = /^<!--\s*([\s\S]*?)\s*-->/;
const META_LINE_RE = /^(\w+):\s*(.+)$/gm;

/** Parse the leading HTML-comment front-matter block from a lesson file. */
function parseFrontMatter(id: string, html: string): ParsedLessonMeta | null {
  const match = html.match(META_RE);
  if (!match) return null;
  const block = match[1]!;
  const fields: Record<string, string> = {};
  let m: RegExpExecArray | null;
  while ((m = META_LINE_RE.exec(block)) !== null) {
    fields[m[1]!.toLowerCase()] = m[2]!.trim();
  }
  return {
    id,
    title: fields.title ?? id,
    module: fields.module ?? "General",
    moduleId: fields.moduleid ?? fields.module?.toLowerCase().replace(/\s+/g, "-") ?? "general",
    minutes: Number(fields.minutes ?? 15),
    order: Number.parseInt((id.match(/^(\d+)/) ?? [, "0"])[1]!, 10),
  };
}

/** Cache of lesson metadata, keyed by slug. Re-read lazily if dir mtime changes. */
let cache: ParsedLessonMeta[] | null = null;
let cacheDirtyTime = 0;

async function ensureCache(): Promise<ParsedLessonMeta[]> {
  if (cache) {
    // Cheap freshness check: if dir mtime changed, drop cache.
    const st = await stat(LESSONS_DIR);
    if (st.mtimeMs <= cacheDirtyTime) return cache;
    cache = null;
  }
  const files = await readdir(LESSONS_DIR).catch(() => [] as string[]);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));
  const out: ParsedLessonMeta[] = [];
  for (const f of htmlFiles) {
    const id = f.replace(/\.html$/, "");
    const full = join(LESSONS_DIR, f);
    const text = await readFile(full, "utf8");
    const meta = parseFrontMatter(id, text);
    if (meta) out.push(meta);
  }
  out.sort((a, b) => a.order - b.order);
  const st = await stat(LESSONS_DIR);
  cacheDirtyTime = st.mtimeMs;
  cache = out;
  return out;
}

export const lessonsRouter = Router();

/** GET /api/lessons — list of lessons (metadata only). */
lessonsRouter.get("/", async (_req, res) => {
  const list = await ensureCache();
  // Project to the LessonSummary shape (id, title, module, moduleId, order, minutes)
  const summary = list.map((l) => ({
    id: l.id,
    title: l.title,
    module: l.module,
    moduleId: l.moduleId,
    order: l.order,
    minutes: l.minutes,
  }));
  res.json({ ok: true, data: summary });
});

/** GET /api/lessons/:id — full lesson including HTML body. */
lessonsRouter.get("/:id", async (req, res) => {
  const list = await ensureCache();
  const meta = list.find((l) => l.id === req.params.id);
  if (!meta) {
    res.status(404).json({ ok: false, error: { message: "Lesson not found", code: "NOT_FOUND" } });
    return;
  }
  const html = await readFile(join(LESSONS_DIR, `${meta.id}.html`), "utf8");
  res.json({
    ok: true,
    data: {
      ...meta,
      html,
      estimatedMinutes: meta.minutes,
    },
  });
});
