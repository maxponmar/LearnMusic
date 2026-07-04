/**
 * EarTrainer — functional ear-training drills.
 *
 * Two exercise types (toggle at the top):
 *  - scale-degree: cadence establishes key → test note → "which degree (1–7)?"
 *  - chord-quality: chord plays → "major, minor, diminished, or sus4?"
 *
 * Flow per round:
 *   1. Fetch a server-generated prompt (the server is the source of truth
 *      for what was played).
 *   2. Play the cadence + test stimulus (note or chord).
 *   3. User taps an answer; instant green/red feedback.
 *   4. Submit attempt to the API; streak + mastery update live.
 *
 * The cadence is the whole game for scale-degree drills — without it you're
 * just doing interval recognition. Functional hearing requires a tonal center.
 */

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { AudioEngine } from "../lib/audio";
import { contextFor, keyPcs, WORSHIP_PROGRESSIONS } from "@lag/theory";
import type {
  ScaleDegreePrompt,
  ChordQualityPrompt,
  ProgressionPrompt,
  EarTrainingStats,
} from "@lag/shared";

type Mode = "scale-degree" | "chord-quality" | "progression";
type Phase = "loading" | "ready" | "playing" | "answered";

// The five common patterns serve as the answer choices for progression mode.
const PROGRESSION_OPTIONS = WORSHIP_PROGRESSIONS.map((p) => p.name);

const DEGREES = [1, 2, 3, 4, 5, 6, 7] as const;
// Per-degree hints (the "sound" of each scale degree, taught in Module 1)
const DEGREE_FEEL: Record<number, string> = {
  1: "home / resting",
  2: " restless, wants up",
  3: "bright, stable",
  4: "suspended, wants down",
  5: "stable, second home",
  6: "wistful (relative minor)",
  7: "tense, wants home",
};

const CHORD_OPTIONS = ["major", "minor", "diminished", "sus4"] as const;
const CHORD_FEEL: Record<string, string> = {
  major: "bright, happy",
  minor: "dark, sad",
  diminished: "tense, unstable",
  sus4: "open, suspended",
};

export function EarTrainer() {
  const [mode, setMode] = useState<Mode>("scale-degree");
  const [phase, setPhase] = useState<Phase>("loading");
  const [prompt, setPrompt] = useState<
    ScaleDegreePrompt | ChordQualityPrompt | ProgressionPrompt | null
  >(null);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState<EarTrainingStats | null>(null);
  const [streak, setStreak] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [roundStart, setRoundStart] = useState<number>(0);

  const ensureAudio = useCallback(async () => {
    if (audioReady) return true;
    try {
      await AudioEngine.init();
      setAudioReady(true);
      return true;
    } catch (e) {
      setAudioError((e as Error).message);
      return false;
    }
  }, [audioReady]);

  // Load a fresh prompt whenever mode changes
  const nextRound = useCallback(async () => {
    setPhase("loading");
    setLastAnswer(null);
    setWasCorrect(null);
    const ok = await ensureAudio();
    if (!ok) {
      setPhase("ready");
      return;
    }
    const p = await api.newPrompt(mode);
    setPrompt(p);
    setPhase("ready");
    setRoundStart(Date.now());
  }, [mode, ensureAudio]);

  // Refresh stats from server
  const refreshStats = useCallback(async () => {
    try {
      setStats(await api.getStats(mode));
    } catch {
      /* ignore — non-fatal */
    }
  }, [mode]);

  useEffect(() => {
    nextRound();
    refreshStats();
  }, [nextRound, refreshStats]);

  // Play the cadence + test stimulus for the current prompt
  async function playPrompt() {
    if (!prompt) return;
    setPhase("playing");
    if (prompt.exerciseType === "scale-degree") {
      const ctx = contextFor(prompt.key, prompt.quality);
      const pcs = keyPcs(ctx.key) as [number, number, number, number, number, number, number];
      const tonicMidi = 60; // C4 anchor; cadence projects from here regardless of key
      await AudioEngine.playCadence(pcs, tonicMidi);
      await sleep(300);
      AudioEngine.playNote(prompt.midi, 1.5);
    } else if (prompt.exerciseType === "chord-quality") {
      AudioEngine.playChord(prompt.rootMidi, prompt.chordQuality);
    } else {
      // progression
      await AudioEngine.playProgression(prompt.chordMidis);
    }
    setPhase("ready");
  }

  async function answer(value: string) {
    if (!prompt || phase !== "ready" || wasCorrect !== null) return;
    const correctAnswer =
      prompt.exerciseType === "scale-degree"
        ? String((prompt as ScaleDegreePrompt).degree)
        : prompt.exerciseType === "chord-quality"
          ? (prompt as ChordQualityPrompt).chordQuality
          : (prompt as ProgressionPrompt).patternName;
    const correct = value === correctAnswer;
    setLastAnswer(value);
    setWasCorrect(correct);
    setStreak((s) => (correct ? s + 1 : 0));

    const responseMs = Date.now() - roundStart;
    // Submit attempt
    try {
      await api.logAttempt({
        exerciseType: prompt.exerciseType,
        prompt: JSON.stringify(prompt),
        correctAnswer,
        userAnswer: value,
        correct,
        responseMs,
      });
      await refreshStats();
    } catch {
      /* non-fatal */
    }
  }

  const level = stats ? Math.max(1, Math.ceil(stats.mastery * 5)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Ear trainer</h1>
        <p className="text-[var(--color-muted)] mt-2 max-w-prose">
          The single most important skill for playing by ear. Each round,
          you'll hear a key established (a cadence), then a note or chord —
          identify it. Slow at first; within two weeks of daily practice you'll
          reliably hear scale degrees 1, 3, 5, then 4, then the rest.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30 w-fit">
        {(["scale-degree", "chord-quality", "progression"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setStreak(0);
            }}
            className={`px-4 py-1.5 rounded text-sm transition ${
              mode === m ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-muted)]"
            }`}
          >
            {m === "scale-degree"
              ? "Scale degrees"
              : m === "chord-quality"
                ? "Chord quality"
                : "Progressions"}
          </button>
        ))}
      </div>

      {audioError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          Audio couldn't start: {audioError}
        </div>
      )}

      {/* Mastery meter */}
      {stats && (
        <div className="p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30 flex flex-wrap items-center gap-6 text-sm">
          <Stat label="Mastery" value={`${Math.round(stats.mastery * 100)}%`} />
          <Stat label="Skill level" value={`${level} / 5`} />
          <Stat label="Recent acc." value={`${Math.round(stats.recentAccuracy * 100)}%`} />
          <Stat label="Best streak" value={String(stats.bestStreak)} />
          <Stat label="Total reps" value={String(stats.total)} />
          <div className="ml-auto">
            <span className="text-[var(--color-muted)]">Current streak: </span>
            <span className="font-mono font-bold text-[var(--color-accent)]">{streak} 🔥</span>
          </div>
        </div>
      )}

      {/* Drill card */}
      <div className="p-8 rounded-md bg-white/60 border border-[var(--color-accent-soft)]/40 text-center space-y-6">
        {phase === "loading" && (
          <div className="text-[var(--color-muted)]">Loading next round…</div>
        )}

        {prompt && phase !== "loading" && (
          <>
            <div className="text-sm text-[var(--color-muted)]">
              {prompt.exerciseType === "scale-degree" ? (
                <>
                  Key of <strong>{prompt.key} {prompt.quality}</strong> — listen for the cadence,
                  then identify the test note's scale degree.
                </>
              ) : prompt.exerciseType === "chord-quality" ? (
                <>Listen to the chord and identify its quality.</>
              ) : (
                <>
                  Key of <strong>{prompt.key} {prompt.quality}</strong> — listen to the chord
                  loop, then identify which Nashville Number pattern it is.
                </>
              )}
            </div>

            <button
              onClick={playPrompt}
              disabled={phase === "playing"}
              className="px-6 py-3 rounded-md bg-[var(--color-accent)] text-white text-lg hover:opacity-90 disabled:opacity-50"
            >
              {phase === "playing" ? "▶ Playing…" : wasCorrect === null ? "▶ Play round" : "▶ Replay"}
            </button>

            {/* Answer buttons */}
            <div className={prompt.exerciseType === "progression" ? "grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto pt-2" : "flex flex-wrap justify-center gap-2 pt-2"}>
              {prompt.exerciseType === "scale-degree"
                ? DEGREES.map((d) => (
                    <AnswerButton
                      key={d}
                      label={String(d)}
                      hint={DEGREE_FEEL[d]}
                      disabled={wasCorrect !== null}
                      state={buttonState(String(d), lastAnswer, prompt ? String((prompt as ScaleDegreePrompt).degree) : null, wasCorrect)}
                      onClick={() => answer(String(d))}
                    />
                  ))
                : prompt.exerciseType === "chord-quality"
                  ? CHORD_OPTIONS.map((q) => (
                      <AnswerButton
                        key={q}
                        label={q}
                        hint={CHORD_FEEL[q]}
                        disabled={wasCorrect !== null}
                        state={buttonState(q, lastAnswer, prompt ? (prompt as ChordQualityPrompt).chordQuality : null, wasCorrect)}
                        onClick={() => answer(q)}
                      />
                    ))
                  : PROGRESSION_OPTIONS.map((name) => {
                      const prog = WORSHIP_PROGRESSIONS.find((p) => p.name === name);
                      return (
                        <AnswerButton
                          key={name}
                          label={name}
                          hint={prog?.feel ?? ""}
                          disabled={wasCorrect !== null}
                          state={buttonState(name, lastAnswer, prompt ? (prompt as ProgressionPrompt).patternName : null, wasCorrect)}
                          onClick={() => answer(name)}
                          wide
                        />
                      );
                    })}
            </div>

            {/* Feedback */}
            {wasCorrect !== null && (
              <div className={`text-lg font-medium ${wasCorrect ? "text-green-700" : "text-red-700"}`}>
                {wasCorrect ? "✓ Correct!" : "✗ Not quite."}{" "}
                <span className="text-[var(--color-muted)] text-sm">
                  That was{" "}
                  {prompt.exerciseType === "scale-degree"
                    ? `degree ${(prompt as ScaleDegreePrompt).degree} (${(prompt as ScaleDegreePrompt).noteName})`
                    : prompt.exerciseType === "chord-quality"
                      ? `a ${(prompt as ChordQualityPrompt).chordQuality} chord (${(prompt as ChordQualityPrompt).chordName})`
                      : `${(prompt as ProgressionPrompt).patternName} — ${(prompt as ProgressionPrompt).chordNames.join(" → ")}`}
                  .
                </span>
                <button
                  onClick={nextRound}
                  className="ml-4 px-4 py-1.5 rounded bg-[var(--color-accent)] text-white text-sm hover:opacity-90"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pedagogy callout */}
      <div className="p-5 rounded-md bg-[#f3ead8] border border-[var(--color-accent-soft)] text-sm">
        <strong className="font-serif text-base">How to practice:</strong> aim
        for 5–10 minutes daily, not 30 minutes once a week. Skill builds with
        sleep between sessions. If you're stuck below ~70% on a degree,
        re-listen to the cadence and hum <em>do-re-mi-fa-sol-la-ti-do</em>{" "}
        before answering — that maps the scale onto your voice, which is how
        your ear internalizes it.
      </div>
    </div>
  );
}

type BtnState = "idle" | "correct" | "wrong" | "dim";
function buttonState(
  value: string,
  lastAnswer: string | null,
  correctAnswer: string | null,
  wasCorrect: boolean | null,
): BtnState {
  if (wasCorrect === null) return "idle";
  if (value === correctAnswer) return "correct";
  if (value === lastAnswer) return "wrong";
  return "dim";
}

function AnswerButton({
  label,
  hint,
  state,
  disabled,
  onClick,
  wide = false,
}: {
  label: string;
  hint: string;
  state: BtnState;
  disabled: boolean;
  onClick: () => void;
  wide?: boolean;
}) {
  const styles: Record<BtnState, string> = {
    idle: "bg-white border-[var(--color-accent-soft)] text-[var(--color-ink)] hover:bg-[var(--color-accent-soft)]/15",
    correct: "bg-green-600 border-green-700 text-white",
    wrong: "bg-red-600 border-red-700 text-white",
    dim: "bg-white border-[var(--color-accent-soft)]/40 text-[var(--color-muted)] opacity-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-3 rounded-md border min-w-[88px] transition text-left ${styles[state]} ${
        wide ? "w-full" : "text-center"
      }`}
    >
      <div className={`font-bold ${wide ? "text-base" : "text-lg"} leading-none`}>{label}</div>
      <div className={`text-[10px] mt-1 opacity-80 ${wide ? "normal-case" : ""}`}>{hint}</div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</div>
      <div className="font-mono text-lg font-bold text-[var(--color-accent)]">{value}</div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
