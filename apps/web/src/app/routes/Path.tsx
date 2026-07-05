/**
 * Path — linear curriculum map with lock/unlock status.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { PathModule, UnitStatus } from "@lag/shared";

const statusStyle: Record<UnitStatus, string> = {
  complete: "border-green-500/40 bg-green-50/50",
  started: "border-[var(--color-accent)]/50 bg-[var(--color-accent-soft)]/10",
  not_started: "border-[var(--color-accent-soft)]/30 hover:border-[var(--color-accent)]/40",
  locked: "border-gray-200 bg-gray-50/50 opacity-60",
};

export function Path() {
  const [modules, setModules] = useState<PathModule[] | null>(null);

  useEffect(() => {
    api.getPath().then(setModules).catch(() => setModules([]));
  }, []);

  if (!modules) {
    return <p className="text-[var(--color-muted)]">Loading path…</p>;
  }

  return (
    <div className="space-y-12 pb-24">
      <section>
        <h1 className="font-serif text-4xl mb-3">Your path</h1>
        <p className="text-[var(--color-muted)] max-w-prose">
          Step-by-step from rhythm to playing with purpose. Complete each unit in order — later steps
          unlock as you go.
        </p>
      </section>

      {modules.map((mod) => (
        <section key={mod.id}>
          <h2 className="font-serif text-2xl mb-1">{mod.name}</h2>
          <p className="text-sm text-[var(--color-muted)] mb-4">{mod.goal}</p>
          <ul className="space-y-2">
            {mod.units.map((unit) => (
              <li key={unit.id}>
                {unit.status === "locked" ? (
                  <div className={`p-4 rounded-lg border ${statusStyle.locked}`}>
                    <span className="text-[var(--color-muted)]">🔒 {unit.title}</span>
                  </div>
                ) : (
                  <Link
                    to={`/app/units/${unit.id}`}
                    className={`block p-4 rounded-lg border transition ${statusStyle[unit.status]}`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span>
                        {unit.status === "complete" && "✓ "}
                        {unit.title}
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        ~{unit.estimatedMinutes} min · {unit.type}
                      </span>
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
