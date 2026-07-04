/**
 * LessonReader — fetches a single lesson's HTML and renders it inside a
 * styled prose container. In Phase 2 this also scans the HTML for
 * `data-fretboard` / `data-audio` elements and hydrates them as interactive
 * React islands, so authors can embed live widgets in lesson content.
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Lesson, LessonStatus } from "@lag/shared";
import { LessonContent } from "../components/LessonFretboard";

export function LessonReader() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LessonStatus | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLesson(null);
    setError(null);
    api
      .getLesson(id)
      .then((data) => !cancelled && setLesson(data))
      .catch((e: Error) => !cancelled && setError(e.message));
    // Mark the lesson started on open (non-blocking)
    api.setLessonStatus(id, "started").catch(() => {});
    setStatus("started");
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function markComplete() {
    if (!id) return;
    try {
      const updated = await api.setLessonStatus(id, "complete");
      setStatus(updated.status);
    } catch {
      /* non-fatal */
    }
  }

  if (error) return <div className="text-red-700">Couldn't load lesson: {error}</div>;
  if (!lesson) return <div className="text-[var(--color-muted)]">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/app/lessons" className="text-sm text-[var(--color-accent)] hover:underline">
          ← All lessons
        </Link>
        {status === "complete" ? (
          <span className="text-sm text-green-700">✓ Completed</span>
        ) : (
          <button
            onClick={markComplete}
            className="px-3 py-1 rounded text-sm bg-green-700 text-white hover:opacity-90"
          >
            Mark complete
          </button>
        )}
      </div>
      <LessonContent html={lesson.html} />
      <hr className="border-[var(--color-accent-soft)]/30" />
      <p className="text-sm text-[var(--color-muted)]">
        Questions on this lesson? Ask the agent — it's your teacher and can
        clarify anything that's unclear, or adapt the lesson to your guitar.
      </p>
    </div>
  );
}
