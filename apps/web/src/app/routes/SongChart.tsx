/**
 * SongChart — renders a single song's NNS chart into a chosen key.
 *
 * All music-theory logic (NNS token → chord name, capo suggestion) lives in
 * @lag/theory; this component only picks state and lays out the result.
 * "Ear-verified" is a per-song toggle persisted in localStorage — seed
 * charts are starting points, not verified transcriptions (see charts.ts).
 */

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ALL_KEYS, chordForToken, suggestCapo } from "@lag/theory";
import { SONG_CHARTS } from "../data/charts";

type Display = "numbers" | "chords";

function verifiedStorageKey(slug: string): string {
  return `chart-verified:${slug}`;
}

function readVerified(slug: string): boolean {
  try {
    return localStorage.getItem(verifiedStorageKey(slug)) === "true";
  } catch {
    return false;
  }
}

export function SongChart() {
  const { slug } = useParams<{ slug: string }>();
  const chart = SONG_CHARTS.find((c) => c.slug === slug);

  const [selectedKey, setSelectedKey] = useState(chart?.defaultKey ?? "C");
  const [display, setDisplay] = useState<Display>("chords");
  const [verified, setVerified] = useState(() => (slug ? readVerified(slug) : false));

  // Re-sync local state when navigating between chart pages.
  useEffect(() => {
    if (!chart) return;
    setSelectedKey(chart.defaultKey);
    setVerified(readVerified(chart.slug));
  }, [chart?.slug]);

  if (!chart) {
    return (
      <div className="space-y-4">
        <Link to="/app/songs" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Song library
        </Link>
        <p className="text-red-700">No song chart found for "{slug}".</p>
      </div>
    );
  }

  const capo = suggestCapo(selectedKey);

  function toggleVerified() {
    const next = !verified;
    setVerified(next);
    try {
      localStorage.setItem(verifiedStorageKey(chart!.slug), String(next));
    } catch {
      /* localStorage unavailable (private browsing, etc.) — non-fatal */
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/app/songs" className="text-sm text-[var(--color-accent)] hover:underline">
        ← Song library
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">{chart.title}</h1>
          <p className="text-[var(--color-muted)]">
            {chart.artist} · {chart.timeSignature} · default key {chart.defaultKey}
          </p>
        </div>
        <button
          onClick={toggleVerified}
          className={`px-3 py-1.5 rounded text-sm transition whitespace-nowrap ${
            verified
              ? "bg-green-700 text-white"
              : "bg-white border border-[var(--color-accent-soft)] text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/15"
          }`}
        >
          {verified ? "✓ Ear-verified" : "Mark ear-verified"}
        </button>
      </div>

      <div className="p-3 rounded-md bg-[#f3ead8] border border-[var(--color-accent-soft)] text-sm">
        Seed charts are starting points — verify every section by ear before
        trusting it.
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30">
        <label className="text-sm font-medium">Key:</label>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="px-3 py-1.5 rounded border border-[var(--color-accent-soft)] bg-white text-sm"
        >
          {ALL_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <div className="flex gap-1 ml-2">
          {(
            [
              { value: "numbers", label: "Numbers" },
              { value: "chords", label: "Chords" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDisplay(opt.value)}
              className={`px-3 py-1.5 rounded text-sm transition ${
                display === opt.value
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white border border-[var(--color-accent-soft)] text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/15"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto text-sm font-mono">
          Capo {capo.fret} · play {capo.shape} shapes
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {chart.sections.map((section) => (
          <section
            key={section.name}
            className="p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30"
          >
            <h2 className="font-serif text-lg text-[var(--color-accent)] mb-2">{section.name}</h2>
            <div className="flex flex-wrap gap-2">
              {section.bars.map((token, i) => (
                <div
                  key={i}
                  className="min-w-[3.5rem] px-3 py-2 rounded border border-[var(--color-accent-soft)] bg-white text-center font-mono text-sm"
                >
                  {display === "numbers" ? token : chordForToken(token, selectedKey)}
                </div>
              ))}
            </div>
            {section.note && (
              <p className="mt-2 text-xs text-[var(--color-muted)]">{section.note}</p>
            )}
          </section>
        ))}
      </div>

      {chart.notes && <p className="text-sm text-[var(--color-muted)]">{chart.notes}</p>}
    </div>
  );
}
