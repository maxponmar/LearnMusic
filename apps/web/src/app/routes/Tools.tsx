/**
 * Tools hub — secondary access to ear trainer, fretboard, metronome, journal.
 */

import { Link } from "react-router-dom";

const tools = [
  { to: "/app/ear-training", label: "Ear trainer", desc: "Scale degrees, chords, progressions" },
  { to: "/app/fretboard", label: "Fretboard lab", desc: "Explore scales and keys on the neck" },
  { to: "/app/metronome", label: "Metronome", desc: "Practice rhythm at any tempo" },
  { to: "/app/journal", label: "Journal", desc: "Log practice sessions" },
  { to: "/app/lessons", label: "Deep-dive lessons", desc: "Full printable lesson library" },
];

export function Tools() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-4xl mb-3">Tools</h1>
        <p className="text-[var(--color-muted)] max-w-prose">
          Free exploration — use these anytime. Your guided path lives under Today and Path.
        </p>
      </section>
      <ul className="grid gap-4 sm:grid-cols-2">
        {tools.map((t) => (
          <li key={t.to}>
            <Link
              to={t.to}
              className="block p-5 rounded-xl border border-[var(--color-accent-soft)]/30 hover:border-[var(--color-accent)]/50"
            >
              <h2 className="font-serif text-lg">{t.label}</h2>
              <p className="text-sm text-[var(--color-muted)] mt-1">{t.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
