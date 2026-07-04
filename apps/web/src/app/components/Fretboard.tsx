/**
 * Fretboard — interactive SVG guitar fretboard.
 *
 * Renders all 6 strings × N frets as SVG, with notes highlighted by their
 * role in the active key. Click a note to play it (via the onPlayNote prop,
 * wired to the AudioEngine by the parent).
 *
 * Geometry uses real guitar proportions: frets space by the rule-of-18
 * (each fret is 17.817% closer to the bridge than the previous), so the
 * neck narrows realistically up the fretboard. Strings thicken toward the
 * low E. The nut is drawn thicker than the frets.
 *
 * Rendering modes:
 *  - "scale"     — highlight all in-scale notes (default)
 *  - "root-only" — highlight only the tonic across the neck
 *  - "chord"     — (Phase 3) highlight a specific chord shape
 */

import { useMemo } from "react";
import {
  contextFor,
  fretNotes,
  pentatonicContext,
  type FretNote,
  type PentatonicKind,
  type PitchClass,
  type ScaleQuality,
} from "@lag/theory";

export type FretboardMode = "scale" | "root-only" | "chord";

export interface FretboardProps {
  /** Tonic of the key, e.g. "G", "Bb", "F#". */
  tonic: string;
  quality?: ScaleQuality;
  /**
   * Pentatonic overlay. When set, the fretboard highlights only the 5
   * pentatonic notes (instead of the full 7-note diatonic scale), with the
   * root on the pentatonic tonic. "off" = full diatonic scale (default).
   */
  pentatonic?: PentatonicKind;
  /** Number of frets to render (default 12). */
  frets?: number;
  /** Start fret (default 0 = open position). Non-zero hides the nut. */
  startFret?: number;
  /** Render mode. */
  mode?: FretboardMode;
  /** Called when the user clicks a note. */
  onPlayNote?: (note: FretNote) => void;
  /** Currently "previewing" note (e.g. hovered) — drawn larger. */
  hoveredMidi?: number | null;
  /** Show note names inside the dots (default true). */
  showNames?: boolean;
  /** Compact height (default false). */
  compact?: boolean;
}

// Visual constants
const STRING_GAP = 26; // px between strings (vertical)
const STRING_PADDING_X = 28; // px left/right margin in the SVG
const NUT_WIDTH = 6;
const FRET_WIDTH = 1.5;
const NOTE_RADIUS = 9;

// Rule-of-18: each fret is 1/17.817 of the remaining scale length.
// We apply this to a base scale-length to compute x positions.
const FRET_RATIO = 1 / 17.817;

/** Compute the x-offset of each fret boundary using rule-of-18 spacing. */
function computeFretXs(numFrets: number, availableWidth: number): number[] {
  const xs: number[] = [0];
  let remaining = availableWidth;
  let cursor = 0;
  for (let i = 1; i <= numFrets; i++) {
    const step = remaining * FRET_RATIO;
    cursor += step;
    xs.push(cursor);
    remaining -= step;
  }
  return xs;
}

const STRING_THICKNESS: Record<number, number> = { 1: 1, 2: 1.2, 3: 1.6, 4: 2.1, 5: 2.7, 6: 3.3 };

// Inlay fret markers (single dot positions on a real fretboard)
const INLAY_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAY_FRETS = new Set([12, 24]);

export function Fretboard({
  tonic,
  quality = "major",
  pentatonic = "off",
  frets = 12,
  startFret = 0,
  mode = "scale",
  onPlayNote,
  hoveredMidi,
  showNames = true,
  compact = false,
}: FretboardProps) {
  const numStrings = 6;
  const height = STRING_GAP * (numStrings - 1) + (compact ? 24 : 40);
  const labelWidth = 26; // space for open-string labels on the left
  const availableWidth = 720; // tuned to give comfortable spacing; SVG scales via viewBox
  const fretXs = useMemo(() => computeFretXs(frets, availableWidth), [frets]);
  const ctx = useMemo(
    () => (pentatonic === "off" ? contextFor(tonic, quality) : pentatonicContext(tonic, pentatonic)),
    [tonic, quality, pentatonic],
  );
  const notes = useMemo(() => fretNotes(ctx, startFret + frets), [ctx, startFret, frets]);

  // Filter to visible frets
  const visibleNotes = notes.filter((n) => n.fret >= startFret && n.fret <= startFret + frets);

  const stringY = (s: number) => (6 - s) * STRING_GAP + (compact ? 12 : 20); // string 6 (low E) at bottom
  const noteX = (fret: number) => {
    // Open notes draw left of the nut; fretted notes draw between frets
    if (fret === 0) return labelWidth / 2 + 2;
    // Center the dot in the space between fret (fret-1) and fret
    const left = labelWidth + (fret === 1 ? 0 : fretXs[fret - 1]!);
    const right = labelWidth + fretXs[fret]!;
    return (left + right) / 2;
  };
  const totalWidth = labelWidth + availableWidth + STRING_PADDING_X;

  const isVisible = (n: FretNote) => n.fret >= startFret && n.fret <= startFret + frets;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[820px]"
        style={{ minWidth: 540 }}
        role="img"
        aria-label={
          pentatonic === "off"
            ? `Fretboard in ${tonic} ${quality}`
            : `${tonic} ${pentatonic} pentatonic`
        }
      >
        {/* Fretboard wood background */}
        <rect
          x={labelWidth}
          y={stringY(6) - STRING_GAP / 2}
          width={availableWidth}
          height={STRING_GAP * (numStrings - 1) + STRING_GAP}
          fill="#e8d5b8"
          rx={2}
        />

        {/* Nut (only when starting at open position) */}
        {startFret === 0 && (
          <rect
            x={labelWidth - NUT_WIDTH / 2}
            y={stringY(6) - STRING_GAP / 2}
            width={NUT_WIDTH}
            height={STRING_GAP * (numStrings - 1) + STRING_GAP}
            fill="#3a2d20"
          />
        )}

        {/* Frets */}
        {Array.from({ length: frets + 1 }, (_, i) => i + 1).map((f) => {
          const x = labelWidth + fretXs[f]!;
          if (f > frets) return null;
          return (
            <line
              key={`fret-${f}`}
              x1={x}
              y1={stringY(6) - STRING_GAP / 2}
              x2={x}
              y2={stringY(1) + STRING_GAP / 2}
              stroke="#9a8970"
              strokeWidth={FRET_WIDTH}
            />
          );
        })}

        {/* Inlay dots (between strings, on frets 3/5/7/9/12/15...) */}
        {Array.from({ length: frets }, (_, i) => startFret + i + 1).map((f) => {
          const fretIdx = f - startFret;
          const x = labelWidth + (fretIdx === 0 ? 0 : (fretXs[fretIdx - 1]! + fretXs[fretIdx]!) / 2);
          const y = (stringY(1) + stringY(6)) / 2;
          if (DOUBLE_INLAY_FRETS.has(f)) {
            return (
              <g key={`inlay-${f}`}>
                <circle cx={x} cy={stringY(2) + 4} r={3} fill="#c9a98a" opacity={0.7} />
                <circle cx={x} cy={stringY(5) - 4} r={3} fill="#c9a98a" opacity={0.7} />
              </g>
            );
          }
          if (INLAY_FRETS.has(f)) {
            return <circle key={`inlay-${f}`} cx={x} cy={y} r={3} fill="#c9a98a" opacity={0.7} />;
          }
          return null;
        })}

        {/* Strings (drawn as lines, thickest at low E) */}
        {Array.from({ length: 6 }, (_, i) => i + 1).map((s) => (
          <line
            key={`string-${s}`}
            x1={labelWidth - (startFret === 0 ? NUT_WIDTH : 0)}
            y1={stringY(s)}
            x2={labelWidth + fretXs[frets]!}
            y2={stringY(s)}
            stroke="#5a4631"
            strokeWidth={STRING_THICKNESS[s]}
          />
        ))}

        {/* Open-string labels (note names at the nut) */}
        {startFret === 0 &&
          [1, 2, 3, 4, 5, 6].map((s) => {
            const openNote = visibleNotes.find((n) => n.string === s && n.fret === 0);
            if (!openNote) return null;
            return (
              <text
                key={`open-${s}`}
                x={6}
                y={stringY(s) + 4}
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                fill="#6b5e51"
              >
                {openNote.name}
              </text>
            );
          })}

        {/* Position marker (e.g. "5fr" if startFret > 0) */}
        {startFret > 0 && (
          <text
            x={4}
            y={stringY(1) - 4}
            fontSize={10}
            fontFamily="ui-monospace, monospace"
            fill="#7c5a3d"
            fontWeight="bold"
          >
            {startFret}fr
          </text>
        )}

        {/* Notes */}
        {visibleNotes
          .filter(isVisible)
          .filter((n) => {
            if (mode === "root-only") return n.isRoot;
            return n.inScale; // "scale" mode (and "chord" handled by parent filtering)
          })
          .map((n) => {
            const cx = noteX(n.fret);
            const cy = stringY(n.string);
            const isHovered = hoveredMidi === n.midi;
            const fill = n.isRoot ? "#7c5a3d" : "#c9a98a";
            const stroke = n.isRoot ? "#5a4631" : "none";
            return (
              <g
                key={`note-${n.string}-${n.fret}`}
                className={onPlayNote ? "cursor-pointer" : undefined}
                onClick={onPlayNote ? () => onPlayNote(n) : undefined}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? NOTE_RADIUS + 2 : NOTE_RADIUS}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={stroke ? 1.5 : 0}
                  opacity={n.isRoot ? 1 : 0.92}
                  style={{ transition: "r 0.1s" }}
                />
                {showNames && (
                  <text
                    x={cx}
                    y={cy + 3.5}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="ui-monospace, monospace"
                    fontWeight={n.isRoot ? 700 : 500}
                    fill="#fff"
                    pointerEvents="none"
                  >
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
      </svg>
    </div>
  );
}

export type { FretNote, PitchClass };
