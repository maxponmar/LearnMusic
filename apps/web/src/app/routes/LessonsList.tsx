/**
 * LessonsList — fetches /api/lessons and groups them by module.
 * The data is empty until the first lesson HTML file exists at /lessons/, so
 * we handle the empty state explicitly.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { LessonSummary, LessonProgress } from "@lag/shared";

export function LessonsList() {
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [progress, setProgress] = useState<LessonProgress[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listLessons()
      .then((data) => !cancelled && setLessons(data))
      .catch((e: Error) => !cancelled && setError(e.message));
    api
      .listLessonProgress()
      .then((data) => !cancelled && setProgress(data))
      .catch(() => !cancelled && setProgress([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="text-red-700">Couldn't load lessons: {error}</div>;
  }
  if (lessons === null) {
    return <div className="text-[var(--color-muted)]">Loading lessons…</div>;
  }
  if (lessons.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-3xl">Lessons</h1>
        <p className="text-[var(--color-muted)]">
          No lessons have been written yet. The first one is being authored —
          check the <code>lessons/</code> directory at the project root.
        </p>
      </div>
    );
  }

  // Group by module
  const byModule = new Map<string, LessonSummary[]>();
  for (const lesson of lessons) {
    const arr = byModule.get(lesson.module) ?? [];
    arr.push(lesson);
    byModule.set(lesson.module, arr);
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Lessons</h1>
      <p className="text-[var(--color-muted)] max-w-prose">
        Read a lesson, then follow the practice steps at the bottom — on your
        guitar, not just in the app.
      </p>
      {Array.from(byModule.entries()).map(([module, items]) => (
        <section key={module}>
          <h2 className="font-serif text-xl text-[var(--color-accent)] mb-3">{module}</h2>
          <ul className="space-y-2">
            {items.map((lesson) => {
              const status =
                progress?.find((p) => p.lessonId === lesson.id)?.status ?? "not_started";
              return (
                <li key={lesson.id}>
                  <Link
                    to={`/app/lessons/${lesson.id}`}
                    className="block p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30 hover:border-[var(--color-accent)] transition"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="font-medium">{lesson.title}</div>
                      {status === "complete" && (
                        <span className="text-xs text-green-700 whitespace-nowrap">✓ done</span>
                      )}
                      {status === "started" && (
                        <span className="text-xs text-[var(--color-accent)] whitespace-nowrap">in progress</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-muted)] mt-1">
                      ~{lesson.minutes} min read · then practice on your guitar
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
