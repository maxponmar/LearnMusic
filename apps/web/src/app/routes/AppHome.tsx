/**
 * AppHome — the dashboard. Pulls real data from the API: lesson progress,
 * ear-training stats across all three exercise types, recent practice
 * sessions, and computes a "continue where you left off" target.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { LessonSummary, LessonProgress, EarTrainingStats, PracticeSession } from "@lag/shared";
import { suggestedDailyPractice, toolLabel } from "../data/lessonPractice";

const MODULES = [
  { id: "fretboard-landmarks", name: "0 · Fretboard landmarks", goal: "Name any note on the neck" },
  { id: "intervals-major-scale", name: "1 · Intervals & the major scale", goal: "Hear a note as a scale degree" },
  { id: "diatonic-chords-nns", name: "2 · Diatonic chords + NNS", goal: "Decode any worship progression" },
  { id: "progressions-by-ear", name: "3 · Progressions by ear", goal: "Hear a chorus → play the numbers" },
  { id: "pentatonic-caged", name: "4 · Pentatonic + CAGED", goal: "Play tasteful fills" },
  { id: "improvisation", name: "5 · Improvisation serving the song", goal: "Improvise under a vocal" },
];

export function AppHome() {
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [progress, setProgress] = useState<LessonProgress[] | null>(null);
  const [degreeStats, setDegreeStats] = useState<EarTrainingStats | null>(null);
  const [progStats, setProgStats] = useState<EarTrainingStats | null>(null);
  const [recentPractice, setRecentPractice] = useState<PracticeSession[] | null>(null);

  useEffect(() => {
    api.listLessons().then(setLessons).catch(() => setLessons([]));
    api.listLessonProgress().then(setProgress).catch(() => setProgress([]));
    api.getStats("scale-degree").then(setDegreeStats).catch(() => setDegreeStats(null));
    api.getStats("progression").then(setProgStats).catch(() => setProgStats(null));
    api.listPractice().then(setRecentPractice).catch(() => setRecentPractice([]));
  }, []);

  // "Continue where you left off": first lesson that's started-but-not-complete,
  // else first never-started lesson, else null (all done).
  const nextLesson = (() => {
    if (!lessons || !progress) return null;
    const statusOf = (id: string) => progress.find((p) => p.lessonId === id)?.status ?? "not_started";
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    return (
      sorted.find((l) => statusOf(l.id) === "started") ??
      sorted.find((l) => statusOf(l.id) === "not_started") ??
      null
    );
  })();

  const completedCount = progress?.filter((p) => p.status === "complete").length ?? 0;
  const totalPracticeSec = recentPractice?.reduce((s, p) => s + p.durationSec, 0) ?? 0;
  const dailySteps = suggestedDailyPractice(nextLesson);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-4xl mb-3">Welcome back.</h1>
        <p className="text-[var(--color-muted)] max-w-prose">
          The goal isn't to memorize more songs. It's to <em>hear</em> a worship
          song and play it — to know why G→C→Em→D always works, and to improvise
          fills that serve the vocal. Six modules stand between you and that.
        </p>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Lessons done" value={`${completedCount}`} sub={`of ${lessons?.length ?? 0} written`} />
        <StatCard
          label="Scale-degree ear"
          value={degreeStats ? `${Math.round(degreeStats.mastery * 100)}%` : "—"}
          sub={`level ${degreeStats ? Math.max(1, Math.ceil(degreeStats.mastery * 5)) : "?"}/5`}
        />
        <StatCard
          label="Progression ear"
          value={progStats ? `${Math.round(progStats.mastery * 100)}%` : "—"}
          sub={`${progStats?.total ?? 0} reps`}
        />
        <StatCard
          label="Practice logged"
          value={
            totalPracticeSec >= 3600
              ? `${(totalPracticeSec / 3600).toFixed(1)}h`
              : `${Math.round(totalPracticeSec / 60)}m`
          }
          sub={`${recentPractice?.length ?? 0} sessions`}
        />
      </section>

      {/* Today's practice loop */}
      <section className="p-6 rounded-md bg-white/60 border border-[var(--color-accent-soft)]/40 space-y-4">
        <div>
          <h2 className="font-serif text-2xl">Today's practice</h2>
          <p className="text-sm text-[var(--color-muted)] mt-1 max-w-prose">
            {nextLesson
              ? `After reading "${nextLesson.title}", do this on your guitar — not just in the app.`
              : "Keep your ear sharp even between lessons."}
          </p>
        </div>
        <ol className="space-y-2">
          {dailySteps.map((step, i) => (
            <li key={step.href}>
              <Link
                to={step.href}
                className="flex items-start gap-3 p-3 rounded-md border border-[var(--color-accent-soft)]/30 bg-white/50 hover:border-[var(--color-accent)] transition"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-soft)] text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <div className="font-medium">{toolLabel(step.tool)}</div>
                  <div className="text-sm text-[var(--color-muted)]">{step.label}</div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
        <Link to="/app/journal" className="text-sm text-[var(--color-accent)] hover:underline">
          Log your session when you're done →
        </Link>
      </section>

      {/* Continue where you left off */}
      {nextLesson && (
        <section className="p-6 rounded-md bg-[var(--color-accent)] text-white">
          <div className="text-xs uppercase tracking-wide opacity-80 mb-1">Continue where you left off</div>
          <Link to={`/app/lessons/${nextLesson.id}`} className="block hover:opacity-90">
            <div className="font-serif text-2xl">{nextLesson.title}</div>
            <div className="text-sm opacity-80 mt-1">{nextLesson.module} · ~{nextLesson.minutes} min →</div>
          </Link>
        </section>
      )}

      {/* Path */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-2xl">Your path</h2>
          <Link to="/app/lessons" className="text-sm text-[var(--color-accent)] hover:underline">
            See all lessons →
          </Link>
        </div>
        <ol className="space-y-2">
          {MODULES.map((m) => {
            const moduleLessons = lessons?.filter((l) => l.moduleId === m.id) ?? [];
            const done = moduleLessons.filter(
              (l) => progress?.find((p) => p.lessonId === l.id)?.status === "complete",
            ).length;
            const total = moduleLessons.length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            const isCurrent = nextLesson?.moduleId === m.id;
            return (
              <li
                key={m.id}
                className={`flex items-center gap-4 p-4 rounded-md border ${
                  isCurrent
                    ? "bg-[var(--color-accent-soft)]/20 border-[var(--color-accent)]"
                    : "bg-white/40 border-[var(--color-accent-soft)]/30"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-[var(--color-muted)]">{m.goal}</div>
                  {total > 0 && (
                    <div className="mt-2 text-xs text-[var(--color-muted)]">
                      {done}/{total} lessons · {pct}%
                    </div>
                  )}
                </div>
                {total > 0 && (
                  <div className="w-24 h-2 bg-[var(--color-accent-soft)]/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-accent)] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30">
      <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</div>
      <div className="font-serif text-2xl font-bold text-[var(--color-accent)] mt-1">{value}</div>
      <div className="text-xs text-[var(--color-muted)] mt-1">{sub}</div>
    </div>
  );
}
