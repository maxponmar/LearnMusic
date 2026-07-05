/**
 * UnitPractice — single curriculum unit with embedded tools and metronome bar.
 */

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { PathUnit } from "@lag/shared";
import { LessonContent } from "../components/LessonFretboard";
import { PracticeSessionBar } from "../components/PracticeSessionBar";
import { BpmControl } from "../components/BpmControl";
import { MetronomeEngine, clampBpm } from "../lib/metronome";
import { AudioEngine } from "../lib/audio";

export function UnitPractice() {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<PathUnit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [tick, setTick] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);
  const [localBpm, setLocalBpm] = useState(60);
  const metronomeStep = unit?.practice.find((p) => p.tool === "metronome");

  useEffect(() => {
    if (!id) return;
    api.getUnit(id).then(setUnit).catch((e) => setError(String(e)));
    api.startUnit(id).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (metronomeStep?.bpm) setLocalBpm(metronomeStep.bpm);
  }, [metronomeStep?.bpm]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const minSeconds = unit?.passCriteria.minSeconds ?? 60;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  void tick;
  const canComplete = elapsed >= minSeconds;

  const complete = useCallback(async () => {
    if (!id || !unit) return;
    setCompleting(true);
    try {
      await api.completeUnit(id, elapsed);
      setDone(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setCompleting(false);
    }
  }, [id, unit, elapsed]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!unit) return <p className="text-[var(--color-muted)]">Loading unit…</p>;

  if (unit.status === "locked") {
    return (
      <div>
        <p>This unit is locked. Complete earlier steps on the <Link to="/app/path">path</Link> first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <header>
        <p className="text-sm text-[var(--color-muted)]">{unit.moduleName}</p>
        <h1 className="font-serif text-3xl mt-1">{unit.title}</h1>
        {unit.deepDiveLessonId && (
          <Link
            to={`/app/lessons/${unit.deepDiveLessonId}`}
            className="text-sm text-[var(--color-accent)] hover:underline mt-2 inline-block"
          >
            Read full deep-dive lesson →
          </Link>
        )}
      </header>

      <LessonContent html={unit.html} />

      {metronomeStep && (
        <section className="rounded-xl border border-[var(--color-accent-soft)]/30 p-5 space-y-4">
          <h2 className="font-serif text-lg">Metronome drill</h2>
          <p className="text-sm text-[var(--color-muted)]">{metronomeStep.label}</p>
          <InlineMetronomeDrill bpm={localBpm} onBpmChange={setLocalBpm} />
        </section>
      )}

      {unit.practice.filter((p) => p.tool !== "metronome").length > 0 && (
        <section>
          <h2 className="font-serif text-lg mb-3">Practice steps</h2>
          <ul className="space-y-2">
            {unit.practice
              .filter((p) => p.tool !== "metronome")
              .map((step, i) => (
                <li key={i}>
                  <Link
                    to={step.href ?? "/app/tools"}
                    className="block p-3 rounded-lg border border-[var(--color-accent-soft)]/30 hover:border-[var(--color-accent)]/50"
                  >
                    {step.label}
                    {step.minutes && (
                      <span className="text-[var(--color-muted)] text-sm"> · ~{step.minutes} min</span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      <footer className="space-y-3">
        {!canComplete && (
          <p className="text-sm text-[var(--color-muted)]">
            Practice at least {minSeconds}s before marking complete ({minSeconds - elapsed}s remaining).
          </p>
        )}
        {done ? (
          <div className="space-y-2">
            <p className="text-green-700 font-medium">Unit complete!</p>
            <Link to="/app/today" className="text-[var(--color-accent)] hover:underline">
              Back to today&apos;s session →
            </Link>
          </div>
        ) : (
          <button
            type="button"
            disabled={!canComplete || completing}
            onClick={complete}
            className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium disabled:opacity-40"
          >
            {completing ? "Saving…" : "Mark unit complete"}
          </button>
        )}
      </footer>

      <PracticeSessionBar defaultBpm={localBpm} sticky />
    </div>
  );
}

function InlineMetronomeDrill({ bpm, onBpmChange }: { bpm: number; onBpmChange: (v: number) => void }) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    MetronomeEngine.onBeat((b) => setBeat(b));
    return () => MetronomeEngine.onBeat(() => {});
  }, []);

  const toggle = async () => {
    if (running) {
      MetronomeEngine.stop();
      setRunning(false);
      return;
    }
    await AudioEngine.init();
    MetronomeEngine.setBpm(bpm);
    MetronomeEngine.setBeatsPerMeasure(4);
    await MetronomeEngine.start();
    setRunning(true);
    api.setLastBpm(bpm).catch(() => {});
  };

  return (
    <div className="space-y-4">
      <BpmControl bpm={bpm} onBpmChange={(v) => onBpmChange(clampBpm(v))} />
      <button
        type="button"
        onClick={toggle}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          running ? "bg-red-600/90 text-white" : "bg-[var(--color-accent)] text-white"
        }`}
      >
        {running ? "Stop" : "Start — play with the click"}
      </button>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((b) => (
          <span
            key={b}
            className={`w-4 h-4 rounded-full ${
              running && beat === b ? "bg-[var(--color-accent)]" : "bg-[var(--color-accent-soft)]/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
