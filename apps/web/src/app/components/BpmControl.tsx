/**
 * BpmControl — slider + steppers + manual BPM entry, synced to a single value.
 */

import { useEffect, useState } from "react";
import { BPM_MAX, BPM_MIN, clampBpm } from "../lib/metronome";

interface BpmControlProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function BpmControl({ bpm, onBpmChange, disabled, compact }: BpmControlProps) {
  const [draft, setDraft] = useState(String(bpm));

  useEffect(() => {
    setDraft(String(bpm));
  }, [bpm]);

  const commitDraft = () => {
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) {
      onBpmChange(clampBpm(parsed));
      return;
    }
    setDraft(String(bpm));
  };

  return (
    <div className={`space-y-3 ${compact ? "" : "p-6 rounded-md bg-white/60 border border-[var(--color-accent-soft)]/40"}`}>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onBpmChange(clampBpm(bpm - 1))}
          className="w-10 h-10 rounded-md border border-[var(--color-accent-soft)]/40 hover:border-[var(--color-accent)] text-lg disabled:opacity-40"
          aria-label="Decrease BPM"
        >
          −
        </button>
        <input
          type="range"
          min={BPM_MIN}
          max={BPM_MAX}
          value={bpm}
          disabled={disabled}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="flex-1 accent-[var(--color-accent)] disabled:opacity-40"
          aria-label="BPM slider"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onBpmChange(clampBpm(bpm + 1))}
          className="w-10 h-10 rounded-md border border-[var(--color-accent-soft)]/40 hover:border-[var(--color-accent)] text-lg disabled:opacity-40"
          aria-label="Increase BPM"
        >
          +
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          min={BPM_MIN}
          max={BPM_MAX}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="w-20 px-2 py-1.5 rounded border border-[var(--color-accent-soft)] bg-white text-center font-mono text-sm tabular-nums disabled:opacity-40"
          aria-label="BPM"
        />
        <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">BPM</span>
      </div>

      <div className="flex justify-between text-xs text-[var(--color-muted)]">
        <span>{BPM_MIN}</span>
        <span>{BPM_MAX}</span>
      </div>
    </div>
  );
}
