/**
 * Library — songs and reference material.
 */

import { Link } from "react-router-dom";
import { SONG_CHARTS } from "../data/charts";

export function Library() {
  const general = SONG_CHARTS.filter((s) => s.repertoire === "general" || !s.repertoire);
  const worship = SONG_CHARTS.filter((s) => s.repertoire === "worship");

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-4xl mb-3">Library</h1>
        <p className="text-[var(--color-muted)] max-w-prose">
          Song charts for applied practice. Use practice mode with metronome + guitar together.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">Songs</h2>
        <Link to="/app/songs" className="text-[var(--color-accent)] hover:underline">
          Browse all charts →
        </Link>
        {general.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[var(--color-muted)] mb-2">General repertoire</h3>
            <ul className="space-y-1 text-sm">
              {general.map((s) => (
                <li key={s.slug}>
                  <Link to={`/app/songs/${s.slug}`} className="hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {worship.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[var(--color-muted)] mb-2">Worship repertoire</h3>
            <ul className="space-y-1 text-sm">
              {worship.map((s) => (
                <li key={s.slug}>
                  <Link to={`/app/songs/${s.slug}`} className="hover:underline">
                    {s.title} — {s.artist}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
