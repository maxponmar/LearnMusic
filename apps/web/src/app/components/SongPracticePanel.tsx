/**
 * SongPracticePanel — play a chart section on guitar with metronome.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { chordForToken } from "@lag/theory";
import type { SongChartData } from "@lag/shared";
import { AudioEngine } from "../lib/audio";
import { MetronomeEngine, clampBpm } from "../lib/metronome";
import { barDurationSec, parseBeatsPerMeasure, triadMidisForToken } from "../lib/songPractice";
import { BpmControl } from "./BpmControl";

interface SongPracticePanelProps {
  chart: SongChartData;
  selectedKey: string;
  capoFret: number;
  capoShape: string;
}

export function SongPracticePanel({
  chart,
  selectedKey,
  capoFret,
  capoShape,
}: SongPracticePanelProps) {
  const defaultBpm = chart.bpm ?? 80;
  const [bpm, setBpm] = useState(defaultBpm);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [loop, setLoop] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef(false);

  const section = chart.sections[sectionIndex]!;
  const timeSig = parseBeatsPerMeasure(chart.timeSignature);
  const progressionLabel = section.bars
    .map((token) => `${token} (${chordForToken(token, selectedKey)})`)
    .join(" · ");

  useEffect(() => {
    setBpm(chart.bpm ?? 80);
    setSectionIndex(0);
  }, [chart.slug, chart.bpm]);

  useEffect(() => {
    return () => {
      stopRef.current = true;
      MetronomeEngine.stop();
    };
  }, []);

  const stop = useCallback(() => {
    stopRef.current = true;
    MetronomeEngine.stop();
    setRunning(false);
  }, []);

  const start = useCallback(async () => {
    stopRef.current = false;
    try {
      await AudioEngine.init();
      MetronomeEngine.setBpm(bpm);
      MetronomeEngine.setBeatsPerMeasure(timeSig);
      await MetronomeEngine.start();
      setRunning(true);
      setError(null);

      const chordMidis = section.bars.map((token) => triadMidisForToken(token, selectedKey));
      const barSec = barDurationSec(bpm, timeSig);
      const chordSec = barSec * 0.88;
      const gapSec = Math.max(0, barSec - chordSec);

      do {
        if (stopRef.current) break;
        await AudioEngine.playProgression(chordMidis, chordSec, gapSec);
      } while (loop && !stopRef.current);

      if (!stopRef.current) {
        MetronomeEngine.stop();
        setRunning(false);
      }
    } catch {
      setError("Couldn't start practice audio — try clicking Start again.");
      stop();
    }
  }, [bpm, loop, section.bars, selectedKey, timeSig, stop]);

  const applyBpm = useCallback(
    (next: number) => {
      const clamped = clampBpm(next);
      setBpm(clamped);
      MetronomeEngine.setBpm(clamped);
    },
    [],
  );

  return (
    <section className="p-5 rounded-md bg-white/50 border border-[var(--color-accent-soft)]/40 space-y-5">
      <div>
        <h2 className="font-serif text-xl text-[var(--color-accent)]">Practice mode</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Hear the progression on acoustic guitar while the metronome keeps time — then play along
          in {selectedKey}.
        </p>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <dt className="text-[var(--color-muted)]">Key</dt>
          <dd className="font-mono font-medium">{selectedKey}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Capo</dt>
          <dd className="font-mono font-medium">
            fret {capoFret} · {capoShape} shapes
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Time</dt>
          <dd className="font-mono font-medium">{chart.timeSignature}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Suggested tempo</dt>
          <dd className="font-mono font-medium">{chart.bpm ?? 80} BPM</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <label htmlFor="practice-section" className="text-sm font-medium">
          Section
        </label>
        <select
          id="practice-section"
          value={sectionIndex}
          disabled={running}
          onChange={(e) => setSectionIndex(Number(e.target.value))}
          className="w-full sm:w-auto px-3 py-2 rounded border border-[var(--color-accent-soft)] bg-white text-sm disabled:opacity-50"
        >
          {chart.sections.map((s, i) => (
            <option key={s.name} value={i}>
              {s.name} ({s.bars.join(" ")})
            </option>
          ))}
        </select>
        <p className="text-xs font-mono text-[var(--color-muted)] break-words">{progressionLabel}</p>
      </div>

      <BpmControl bpm={bpm} onBpmChange={applyBpm} disabled={running} compact />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void (running ? stop() : start())}
          className={`px-6 py-2.5 rounded-md font-medium text-white transition ${
            running
              ? "bg-red-600 hover:bg-red-700"
              : "bg-[var(--color-accent)] hover:opacity-90"
          }`}
        >
          {running ? "Stop" : "Start practice"}
        </button>
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={loop}
            disabled={running}
            onChange={(e) => setLoop(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          Loop section
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
