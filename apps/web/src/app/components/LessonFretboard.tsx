/**
 * LessonContent — renders raw lesson HTML and hydrates embedded interactive
 * widgets.
 *
 * Lesson authors embed widgets in the HTML with data attributes:
 *
 *   <div data-fretboard data-tonic="G" data-mode="scale"></div>
 *
 * After the HTML is injected, we walk the DOM for these placeholders and
 * render the corresponding React component into them via createRoot. This
 * lets lessons stay portable HTML (printable, citation-friendly) while still
 * supporting live fretboards inline.
 *
 * Security note: the HTML comes from our own lessons/ directory (trusted
 * authoring — see the teach-skill workflow), so dangerouslySetInnerHTML is
 * acceptable here. If lessons ever come from untrusted sources, switch to
 * DOMPurify before injection.
 */

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Fretboard, type FretboardMode } from "./Fretboard";
import { AudioEngine } from "../lib/audio";
import type { FretNote } from "@lag/theory";
import type { PentatonicKind } from "@lag/theory";
import type { ScaleQuality } from "@lag/theory";

interface FretboardPlaceholder {
  element: HTMLElement;
  tonic: string;
  quality: ScaleQuality;
  pentatonic: PentatonicKind;
  mode: FretboardMode;
  frets: number;
  startFret: number;
}

function discoverPlaceholders(root: HTMLElement): FretboardPlaceholder[] {
  const found: FretboardPlaceholder[] = [];
  const els = root.querySelectorAll<HTMLElement>("[data-fretboard]");
  els.forEach((el) => {
    found.push({
      element: el,
      tonic: el.dataset.tonic ?? "C",
      quality: (el.dataset.quality as ScaleQuality) ?? "major",
      pentatonic: (el.dataset.pentatonic as PentatonicKind) ?? "off",
      mode: (el.dataset.mode as FretboardMode) ?? "scale",
      frets: Number(el.dataset.frets ?? 12),
      startFret: Number(el.dataset.startFret ?? 0),
    });
  });
  return found;
}

async function ensureAudioOnce() {
  try {
    await AudioEngine.init();
  } catch {
    /* surfaced on first explicit user click elsewhere */
  }
}

export function LessonContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. discover embedded fretboard placeholders
    const placeholders = discoverPlaceholders(container);

    // 2. render a live Fretboard into each placeholder
    const roots: Array<{ root: ReturnType<typeof createRoot> }> = [];
    for (const p of placeholders) {
      // Clear any prior content (HMR safety)
      p.element.innerHTML = "";
      const root = createRoot(p.element);
      roots.push({ root });
      root.render(
        <div className="my-6">
          <Fretboard
            tonic={p.tonic}
            quality={p.quality}
            pentatonic={p.pentatonic}
            mode={p.mode}
            frets={p.frets}
            startFret={p.startFret}
            onPlayNote={async (note: FretNote) => {
              await ensureAudioOnce();
              AudioEngine.playFretNote(note);
            }}
          />
          <p className="text-xs text-[var(--color-muted)] mt-1">
            Click any note to hear it.{" "}
            {p.pentatonic !== "off"
              ? `${p.tonic} ${p.pentatonic} pentatonic`
              : `${p.tonic} ${p.quality}`}{" "}
            · {p.startFret > 0 ? `start fret ${p.startFret}` : "open position"}.
          </p>
        </div>,
      );
    }

    return () => {
      // Cleanup on unmount or re-render
      for (const r of roots) r.root.unmount();
    };
  }, [html]);

  return <div ref={containerRef} className="prose-lesson" dangerouslySetInnerHTML={{ __html: html }} />;
}
