/**
 * Today — algorithm-driven daily practice session.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { TodaySession } from "@lag/shared";

const kindIcon: Record<string, string> = {
  warmup: "♩",
  unit: "📖",
  review: "👂",
  apply: "🎵",
  log: "✎",
};

export function Today() {
  const [session, setSession] = useState<TodaySession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getToday().then(setSession).catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return <p className="text-red-600">Could not load today&apos;s session: {error}</p>;
  }

  if (!session) {
    return <p className="text-[var(--color-muted)]">Loading today&apos;s practice…</p>;
  }

  return (
    <div className="space-y-8 pb-24">
      <section>
        <h1 className="font-serif text-4xl mb-3">Today&apos;s practice</h1>
        <p className="text-[var(--color-muted)] max-w-prose">
          One guided session — rhythm first, then learn, review, and apply. About{" "}
          <strong>{session.estimatedMinutes} minutes</strong> total.
          {session.dueReviewCount > 0 && (
            <> · <strong>{session.dueReviewCount}</strong> skills due for review.</>
          )}
        </p>
      </section>

      <ol className="space-y-4">
        {session.steps.map((step, i) => (
          <li
            key={`${step.kind}-${i}`}
            className="flex gap-4 p-5 rounded-xl border border-[var(--color-accent-soft)]/25 bg-white/50"
          >
            <span className="text-2xl w-10 text-center shrink-0">{kindIcon[step.kind] ?? "•"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h2 className="font-serif text-xl">{step.title}</h2>
                <span className="text-sm text-[var(--color-muted)]">~{step.minutes} min</span>
              </div>
              <p className="text-[var(--color-muted)] mt-1">{step.description}</p>
              {step.href && (
                <Link
                  to={step.href}
                  className="inline-block mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  Start →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      {session.nextUnitId && (
        <Link
          to={`/app/units/${session.nextUnitId}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium"
        >
          Continue: next unit →
        </Link>
      )}
    </div>
  );
}
