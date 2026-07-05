/**
 * Persistent metronome bar for practice sessions.
 */

import { useCallback, useEffect, useState } from "react";
import { MetronomeEngine, clampBpm } from "../lib/metronome";
import { BpmControl } from "./BpmControl";
import { api } from "../lib/api";

interface PracticeSessionBarProps {
  defaultBpm?: number;
  /** When true, bar is always visible at bottom of viewport. */
  sticky?: boolean;
}

export function PracticeSessionBar({ defaultBpm = 60, sticky = true }: PracticeSessionBarProps) {
  const [bpm, setBpm] = useState(defaultBpm);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    MetronomeEngine.onBeat((b) => setBeat(b));
    return () => MetronomeEngine.onBeat(() => {});
  }, []);

  const toggle = useCallback(async () => {
    if (running) {
      MetronomeEngine.stop();
      setRunning(false);
      return;
    }
    MetronomeEngine.setBpm(bpm);
    MetronomeEngine.setBeatsPerMeasure(4);
    await MetronomeEngine.start();
    setRunning(true);
    api.setLastBpm(bpm).catch(() => {});
  }, [running, bpm]);

  const onBpmChange = (v: number) => {
    const c = clampBpm(v);
    setBpm(c);
    if (running) MetronomeEngine.setBpm(c);
  };

  const wrap = sticky
    ? "fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-accent-soft)]/40 bg-[var(--color-bg)]/95 backdrop-blur px-4 py-3"
    : "rounded-lg border border-[var(--color-accent-soft)]/30 p-4";

  return (
    <div className={wrap}>
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-[var(--color-muted)]">Practice click</span>
        <BpmControl bpm={bpm} onBpmChange={onBpmChange} disabled={false} />
        <button
          type="button"
          onClick={toggle}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            running
              ? "bg-red-600/90 text-white"
              : "bg-[var(--color-accent)] text-white"
          }`}
        >
          {running ? "Stop" : "Start click"}
        </button>
        {running && (
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((b) => (
              <span
                key={b}
                className={`w-3 h-3 rounded-full transition ${
                  beat === b ? "bg-[var(--color-accent)] scale-125" : "bg-[var(--color-accent-soft)]/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
