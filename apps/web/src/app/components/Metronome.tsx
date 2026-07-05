/**
 * Metronome — BPM control, start/stop, beat indicator, tap tempo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BpmControl } from "./BpmControl";
import {
  MetronomeEngine,
  bpmFromTaps,
  clampBpm,
  type TimeSignature,
} from "../lib/metronome";

export function Metronome() {
  const [searchParams] = useSearchParams();
  const initialBpm = (() => {
    const raw = searchParams.get("bpm");
    if (!raw) return 120;
    const n = Number(raw);
    return Number.isFinite(n) ? clampBpm(n) : 120;
  })();
  const [bpm, setBpm] = useState(initialBpm);
  const [timeSig, setTimeSig] = useState<TimeSignature>(4);
  const [running, setRunning] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const [accentFlash, setAccentFlash] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const tapTimes = useRef<number[]>([]);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    MetronomeEngine.onBeat((beat, isAccent) => {
      setActiveBeat(beat);
      if (isAccent) {
        setAccentFlash(true);
        if (flashTimeout.current) clearTimeout(flashTimeout.current);
        flashTimeout.current = setTimeout(() => setAccentFlash(false), 120);
      }
    });
    return () => {
      MetronomeEngine.stop();
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  const applyBpm = useCallback((next: number) => {
    const clamped = clampBpm(next);
    setBpm(clamped);
    MetronomeEngine.setBpm(clamped);
  }, []);

  const toggle = useCallback(async () => {
    if (running) {
      MetronomeEngine.stop();
      setRunning(false);
      setActiveBeat(0);
      setAccentFlash(false);
      return;
    }
    try {
      MetronomeEngine.setBpm(bpm);
      MetronomeEngine.setBeatsPerMeasure(timeSig);
      await MetronomeEngine.start();
      setAudioError(null);
      setRunning(true);
    } catch {
      setAudioError("Couldn't start audio — try clicking Start again.");
    }
  }, [running, bpm, timeSig]);

  const handleTimeSig = (sig: TimeSignature) => {
    setTimeSig(sig);
    MetronomeEngine.setBeatsPerMeasure(sig);
    if (!running) setActiveBeat(0);
  };

  const handleTap = () => {
    const now = Date.now();
    const recent = [...tapTimes.current, now].filter((t) => now - t <= 2000);
    tapTimes.current = recent.slice(-4);
    const detected = bpmFromTaps(tapTimes.current);
    if (detected != null) applyBpm(detected);
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* BPM display + pulse ring on accent */}
      <div className="relative flex flex-col items-center pt-4">
        <div
          className={`absolute inset-0 mx-auto w-48 h-48 rounded-full transition-transform duration-100 ${
            accentFlash && running ? "scale-100 opacity-30" : "scale-75 opacity-0"
          } bg-[var(--color-accent)]`}
          aria-hidden
        />
        <div className="relative text-center">
          <div className="font-serif text-7xl font-bold text-[var(--color-accent)] tabular-nums">
            {bpm}
          </div>
          <div className="text-sm uppercase tracking-wide text-[var(--color-muted)] mt-1">BPM</div>
        </div>
      </div>

      {/* Beat dots */}
      <div className="flex justify-center gap-3" aria-label={`Beat ${activeBeat || "—"} of ${timeSig}`}>
        {Array.from({ length: timeSig }, (_, i) => {
          const beatNum = i + 1;
          const isActive = running && activeBeat === beatNum;
          const isAccent = beatNum === 1;
          return (
            <div
              key={beatNum}
              className={`w-4 h-4 rounded-full transition-all duration-75 ${
                isActive
                  ? isAccent
                    ? "bg-[var(--color-accent)] scale-125 shadow-[0_0_12px_var(--color-accent)]"
                    : "bg-[var(--color-accent-soft)] scale-110"
                  : "bg-[var(--color-accent-soft)]/25"
              }`}
            />
          );
        })}
      </div>

      {/* Start / stop */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => void toggle()}
          className={`px-10 py-3 rounded-md font-medium text-white transition ${
            running
              ? "bg-red-600 hover:bg-red-700"
              : "bg-[var(--color-accent)] hover:opacity-90"
          }`}
        >
          {running ? "Stop" : "Start"}
        </button>
      </div>

      {audioError && (
        <p className="text-center text-sm text-red-600" role="alert">
          {audioError}
        </p>
      )}

      <BpmControl bpm={bpm} onBpmChange={applyBpm} />

      {/* Time signature + tap tempo */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex rounded-md border border-[var(--color-accent-soft)]/40 overflow-hidden">
          {([4, 3] as const).map((sig) => (
            <button
              key={sig}
              type="button"
              onClick={() => handleTimeSig(sig)}
              className={`px-4 py-2 text-sm transition ${
                timeSig === sig
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white/50 text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/15"
              }`}
            >
              {sig}/4
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleTap}
          className="px-4 py-2 text-sm rounded-md border border-[var(--color-accent-soft)]/40 bg-white/50 hover:border-[var(--color-accent)] transition"
        >
          Tap tempo
        </button>
      </div>

      <p className="text-center text-sm text-[var(--color-muted)] max-w-prose mx-auto">
        Set a comfortable tempo, then practice strumming or scales in time. Beat 1 is the accented
        click — use it to feel where each measure starts.
      </p>
    </div>
  );
}
