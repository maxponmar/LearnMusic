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
import { useNavigate } from "react-router-dom";
import { Fretboard, type FretboardMode } from "./Fretboard";
import { AudioEngine } from "../lib/audio";
import { OPEN_MIDI, OPEN_STRING_NAMES, type FretNote } from "@lag/theory";
import type { PentatonicKind } from "@lag/theory";
import type { ScaleQuality } from "@lag/theory";

/** Standard tuning labels — high E (string 1) through low E (string 6). */
const OPEN_STRING_LABELS: Record<number, string> = {
  1: "high E",
  2: "B",
  3: "G",
  4: "D",
  5: "A",
  6: "low E",
};

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

function OpenStringsWidget() {
  const strings = [6, 5, 4, 3, 2, 1] as const;
  return (
    <div className="my-4">
      <div className="open-strings-widget">
        {strings.map((s) => (
          <button
            key={s}
            type="button"
            onClick={async () => {
              await ensureAudioOnce();
              AudioEngine.playNote(OPEN_MIDI[s]!, 1.2);
            }}
          >
            {OPEN_STRING_LABELS[s]} — {OPEN_STRING_NAMES[s - 1]}
          </button>
        ))}
        <button
          type="button"
          onClick={async () => {
            await ensureAudioOnce();
            AudioEngine.playNotes([40, 45, 50, 55, 59, 64], 1.5);
          }}
        >
          All open strings
        </button>
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-1">
        Click to hear each open string (low E at bottom, high E at top — same as the fretboard).
      </p>
    </div>
  );
}

export function LessonContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // In-app links in lesson HTML should use client-side routing.
    const appLinks = container.querySelectorAll<HTMLAnchorElement>('a[href^="/app"]');
    const linkCleanups: Array<() => void> = [];
    appLinks.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href) return;
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        navigate(href);
      };
      anchor.addEventListener("click", onClick);
      linkCleanups.push(() => anchor.removeEventListener("click", onClick));
    });

    // 1. discover embedded widgets
    const placeholders = discoverPlaceholders(container);
    const openStringEls = container.querySelectorAll<HTMLElement>("[data-open-strings]");

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

    for (const el of openStringEls) {
      el.innerHTML = "";
      const root = createRoot(el);
      roots.push({ root });
      root.render(<OpenStringsWidget />);
    }

    return () => {
      linkCleanups.forEach((fn) => fn());
      // Cleanup on unmount or re-render
      for (const r of roots) r.root.unmount();
    };
  }, [html, navigate]);

  return <div ref={containerRef} className="prose-lesson" dangerouslySetInnerHTML={{ __html: html }} />;
}
