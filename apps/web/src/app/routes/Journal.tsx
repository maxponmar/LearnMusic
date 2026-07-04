/**
 * Journal — practice-session log. Lists past sessions and lets you log a new
 * one. Proves the full FE→API→DB pipeline end-to-end in Phase 1.
 * Phase 2 adds duration quick-buttons, module tagging, and streak tracking.
 */

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../lib/api";
import type { PracticeSession } from "@lag/shared";

export function Journal() {
  const [sessions, setSessions] = useState<PracticeSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ durationMin: 15, notes: "" });

  async function refresh() {
    try {
      setSessions(await api.listPractice());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await api.logPractice({
      durationSec: Math.round(draft.durationMin * 60),
      notes: draft.notes || undefined,
    });
    setDraft({ durationMin: 15, notes: "" });
    await refresh();
  }

  const totalMinutes = sessions?.reduce((sum, s) => sum + s.durationSec, 0) ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Practice journal</h1>

      <form onSubmit={submit} className="p-5 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30 space-y-3">
        <label className="block text-sm font-medium">Log a session</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min={1}
            max={360}
            value={draft.durationMin}
            onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })}
            className="w-20 px-2 py-1 rounded border border-[var(--color-accent-soft)] bg-white"
          />
          <span className="text-sm text-[var(--color-muted)]">minutes</span>
          <input
            type="text"
            placeholder="what did you work on? (optional)"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            className="flex-1 px-3 py-1 rounded border border-[var(--color-accent-soft)] bg-white text-sm"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-[var(--color-accent)] text-white text-sm hover:opacity-90"
          >
            Log it
          </button>
        </div>
      </form>

      {error && <div className="text-red-700">Couldn't load sessions: {error}</div>}

      {sessions && (
        <>
          <div className="text-sm text-[var(--color-muted)]">
            {sessions.length} session{sessions.length === 1 ? "" : "s"} ·{" "}
            {(totalMinutes / 60).toFixed(1)} hours total
          </div>
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30 flex justify-between gap-4"
              >
                <div>
                  <div className="text-sm text-[var(--color-muted)]">
                    {new Date(s.date).toLocaleString()}
                  </div>
                  {s.notes && <div className="mt-1">{s.notes}</div>}
                </div>
                <div className="font-mono text-sm whitespace-nowrap">
                  {(s.durationSec / 60).toFixed(0)} min
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
