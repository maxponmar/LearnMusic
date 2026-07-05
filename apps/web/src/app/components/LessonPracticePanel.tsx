/**
 * Action panel shown after each lesson — turns reading into a concrete
 * practice loop with links to the right app tools.
 */

import { Link } from "react-router-dom";
import type { LessonSummary } from "@lag/shared";
import { practiceStepsFor, toolLabel } from "../data/lessonPractice";

export function LessonPracticePanel({
  lesson,
  onLogPractice,
}: {
  lesson: Pick<LessonSummary, "id" | "moduleId" | "title" | "minutes">;
  onLogPractice?: () => void;
}) {
  const steps = practiceStepsFor(lesson);
  const totalMin = steps.reduce((s, step) => s + (step.minutes ?? 0), 0) || lesson.minutes;

  return (
    <section className="p-6 rounded-md bg-[var(--color-accent-soft)]/15 border border-[var(--color-accent)] space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--color-accent)] mb-1">
          Practice this lesson
        </div>
        <h2 className="font-serif text-xl">Do this on your guitar (~{totalMin} min)</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1 max-w-prose">
          Reading alone won't wire your ear or fingers. Work through these steps,
          then mark the lesson complete when you've actually done them.
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.href} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <Link
                to={step.href}
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                {toolLabel(step.tool)} →
              </Link>
              <div className="text-sm text-[var(--color-muted)]">{step.label}</div>
              {step.minutes != null && (
                <div className="text-xs text-[var(--color-muted)] mt-0.5">~{step.minutes} min</div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {onLogPractice && (
        <button
          type="button"
          onClick={onLogPractice}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          Log this session in your journal →
        </button>
      )}
    </section>
  );
}
