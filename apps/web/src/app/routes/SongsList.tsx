/**
 * SongsList — the Song Chart Library index. Charts are static seed data
 * (`../data/charts`), grouped by language, each rendered into its
 * `defaultKey` on the SongChart page. See SongChart.tsx for the
 * NNS-to-chord rendering and capo suggestion.
 */

import { Link } from "react-router-dom";
import { SONG_CHARTS } from "../data/charts";
import type { SongChartData } from "../data/charts";

const LANGUAGE_LABEL: Record<SongChartData["language"], string> = {
  en: "English",
  es: "Español",
};

export function SongsList() {
  const byLanguage = new Map<SongChartData["language"], SongChartData[]>();
  for (const chart of SONG_CHARTS) {
    const arr = byLanguage.get(chart.language) ?? [];
    arr.push(chart);
    byLanguage.set(chart.language, arr);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Song chart library</h1>
        <p className="text-[var(--color-muted)] mt-2 max-w-prose">
          Worship songs charted as Nashville Number System progressions —
          key-agnostic, rendered into whatever key you need with a capo
          suggestion attached.
        </p>
      </div>

      {(["en", "es"] as const).map((lang) => {
        const charts = byLanguage.get(lang);
        if (!charts || charts.length === 0) return null;
        return (
          <section key={lang}>
            <h2 className="font-serif text-xl text-[var(--color-accent)] mb-3">
              {LANGUAGE_LABEL[lang]}
            </h2>
            <ul className="space-y-2">
              {charts.map((chart) => (
                <li key={chart.slug}>
                  <Link
                    to={`/app/songs/${chart.slug}`}
                    className="block p-4 rounded-md bg-white/40 border border-[var(--color-accent-soft)]/30 hover:border-[var(--color-accent)] transition"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <div className="font-medium">{chart.title}</div>
                        <div className="text-sm text-[var(--color-muted)]">{chart.artist}</div>
                      </div>
                      <div className="text-xs font-mono text-[var(--color-muted)] whitespace-nowrap">
                        key {chart.defaultKey}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="p-5 rounded-md bg-[#f3ead8] border border-[var(--color-accent-soft)] text-sm">
        <strong className="font-serif text-base">Want to add a song?</strong>{" "}
        Chart it by ear first — that's the Module 3 skill (name the
        progression by scale degree, not by memorizing shapes). Once you have
        the sections and their Nashville-number bars, add a{" "}
        <code>SongChartData</code> entry to{" "}
        <code>apps/web/src/app/data/charts.ts</code>. No new UI code needed —
        the library and chart pages pick it up automatically.
      </div>
    </div>
  );
}
