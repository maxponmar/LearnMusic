/**
 * FretboardLab — the interactive fretboard page.
 *
 * Key selector + the SVG Fretboard + click-to-play (wired to AudioEngine) +
 * a "play the scale" button that walks up one octave so you can hear the key
 * you're looking at. This is the centerpiece of Phase 2.
 */

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Fretboard, type FretboardMode } from "../components/Fretboard";
import { AudioEngine } from "../lib/audio";
import { contextFor, fretNotes, midiToFreq, type PentatonicKind } from "@lag/theory";

/** Worship home keys first; extras for transposing practice. */
const WORSHIP_KEYS = ["G", "D", "C", "A"] as const;
const EXTRA_KEYS = ["E", "F", "Bb", "Eb"] as const;
const MODES: { value: FretboardMode; label: string }[] = [
  { value: "scale", label: "Whole scale" },
  { value: "root-only", label: "Roots only" },
];
const PENTATONIC_OPTS: { value: PentatonicKind; label: string }[] = [
  { value: "off", label: "Full scale" },
  { value: "major", label: "Major pent." },
  { value: "minor", label: "Minor pent." },
];

function readParam<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[], fallback: T): T {
  const raw = params.get(key);
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

export function FretboardLab() {
  const [searchParams] = useSearchParams();
  const [tonic, setTonic] = useState<string>(() =>
    readParam(searchParams, "key", [...WORSHIP_KEYS, ...EXTRA_KEYS], "G"),
  );
  const [mode, setMode] = useState<FretboardMode>(() =>
    readParam(searchParams, "mode", ["scale", "root-only"] as const, "scale"),
  );
  const [pentatonic, setPentatonic] = useState<PentatonicKind>(() =>
    readParam(searchParams, "pentatonic", ["off", "major", "minor"] as const, "off"),
  );
  const [showExtraKeys, setShowExtraKeys] = useState(() =>
    EXTRA_KEYS.some((k) => k === searchParams.get("key")),
  );
  const [audioReady, setAudioReady] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hoveredMidi, setHoveredMidi] = useState<number | null>(null);

  // The notes of one octave of the scale (low→high) for the "play scale" button.
  const scaleMidiSeq = useMemo(() => {
    const ctx = contextFor(tonic, "major");
    // Find the lowest root on the fretboard, then walk up one octave.
    const all = fretNotes(ctx, 12)
      .filter((n) => n.inScale)
      .sort((a, b) => a.midi - b.midi);
    if (all.length === 0) return [];
    const lowestRootMidi = all.find((n) => n.isRoot)!.midi;
    // Build a one-octave ascending sequence: root, 2, 3, 4, 5, 6, 7, root(+12)
    const degreeToMidi = new Map<number, number>();
    for (const n of all) {
      if (n.degree && !degreeToMidi.has(n.degree) && n.midi >= lowestRootMidi) {
        degreeToMidi.set(n.degree, n.midi);
      }
    }
    const seq: number[] = [];
    for (let d = 1; d <= 7; d++) {
      const m = degreeToMidi.get(d);
      if (m !== undefined) seq.push(m);
    }
    seq.push(lowestRootMidi + 12); // octave
    return seq;
  }, [tonic]);

  async function ensureAudio() {
    if (audioReady) return;
    setAudioLoading(true);
    setAudioError(null);
    try {
      await AudioEngine.init();
      setAudioReady(true);
    } catch (e) {
      setAudioError((e as Error).message || "Couldn't start audio");
    } finally {
      setAudioLoading(false);
    }
  }

  // When user clicks "play scale", ensure audio is up, then arpeggiate.
  async function playScale() {
    await ensureAudio();
    if (!AudioEngine.ready) return;
    for (const midi of scaleMidiSeq) {
      AudioEngine.playNote(midi, 0.5);
      await sleep(280);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Fretboard lab</h1>
        <p className="text-[var(--color-muted)] mt-2 max-w-prose">
          Pick a worship key (G, D, C, A) and see where every scale note lives
          on your acoustic neck. Click a dot to hear it — then find that note
          on your guitar. Brown dots are roots; use <strong>roots only</strong>{" "}
          for the Module 0 note-finding drill.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30">
        <label className="text-sm font-medium">Key:</label>
        <select
          value={tonic}
          onChange={(e) => setTonic(e.target.value)}
          className="px-3 py-1.5 rounded border border-[var(--color-accent-soft)] bg-white text-sm"
        >
          <optgroup label="Worship keys">
            {WORSHIP_KEYS.map((k) => (
              <option key={k} value={k}>
                {k} major
              </option>
            ))}
          </optgroup>
          {showExtraKeys && (
            <optgroup label="More keys">
              {EXTRA_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k} major
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {!showExtraKeys && (
          <button
            type="button"
            onClick={() => setShowExtraKeys(true)}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] underline"
          >
            More keys…
          </button>
        )}

        <div className="flex gap-1 ml-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-3 py-1.5 rounded text-sm transition ${
                mode === m.value
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white border border-[var(--color-accent-soft)] text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/15"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 ml-2">
          <span className="text-sm font-medium self-center mr-1">Pent:</span>
          {PENTATONIC_OPTS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPentatonic(p.value)}
              className={`px-3 py-1.5 rounded text-sm transition ${
                pentatonic === p.value
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white border border-[var(--color-accent-soft)] text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/15"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={playScale}
          disabled={audioLoading}
          className="ml-auto px-4 py-1.5 rounded bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
        >
          {audioLoading ? "Loading samples…" : audioReady ? "▶ Play the scale" : "▶ Enable audio & play scale"}
        </button>
      </div>

      {audioError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          Audio couldn't start: {audioError}. (Some browsers need a real click;
          try again.)
        </div>
      )}

      {/* Fretboard */}
      <div
        className="p-5 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30"
        onMouseLeave={() => setHoveredMidi(null)}
      >
        <Fretboard
          tonic={tonic}
          mode={mode}
          pentatonic={pentatonic}
          hoveredMidi={hoveredMidi}
          onPlayNote={async (note) => {
            await ensureAudio();
            setHoveredMidi(note.midi);
            AudioEngine.playFretNote(note);
          }}
        />
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          {audioReady
            ? "Click any note to hear it."
            : "First click enables audio (browsers require a user gesture)."}
          {hoveredMidi !== null && (
            <span className="ml-2 font-mono">
              · {midiToFreq(hoveredMidi).toFixed(1)} Hz
            </span>
          )}
        </p>
      </div>

      {/* Pedagogy callout */}
      <div className="p-5 rounded-md bg-[#f3ead8] border border-[var(--color-accent-soft)] text-sm">
        <strong className="font-serif text-base">Try this:</strong> switch to
        <strong> root-only</strong> mode, pick key <strong>G</strong>, and find
        every G on the neck by eye. That's the drill from{" "}
        <em>Lesson 1 — Name any note</em>. Then switch to <strong>whole scale</strong>{" "}
        and notice how the dots form the same five CAGED shapes up the neck —
        that's the bridge to Module 4 (pentatonic + CAGED).
      </div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
