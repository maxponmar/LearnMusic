/**
 * Settings — instrument preference (localStorage + API sync for BPM).
 */

import { useEffect, useState } from "react";
import { INSTRUMENTS, type InstrumentId } from "@lag/theory";

const STORAGE_KEY = "lag.instrument";

export function Settings() {
  const [instrument, setInstrument] = useState<InstrumentId>("acoustic-guitar");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as InstrumentId | null;
    if (saved && INSTRUMENTS[saved]) setInstrument(saved);
  }, []);

  function select(id: InstrumentId) {
    setInstrument(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <div className="space-y-8 max-w-lg">
      <section>
        <h1 className="font-serif text-4xl mb-3">Settings</h1>
        <p className="text-[var(--color-muted)]">Preferences for your learning path.</p>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-3">Instrument</h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          Acoustic guitar is fully supported. Other instruments are coming soon.
        </p>
        <ul className="space-y-2">
          {(Object.keys(INSTRUMENTS) as InstrumentId[]).map((id) => {
            const spec = INSTRUMENTS[id]!;
            const enabled = spec.fretboardEnabled;
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={!enabled && id !== instrument}
                  onClick={() => enabled && select(id)}
                  className={`w-full text-left p-4 rounded-lg border ${
                    instrument === id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/15"
                      : "border-[var(--color-accent-soft)]/30"
                  } ${!enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="font-medium">{spec.displayName}</span>
                  {!enabled && (
                    <span className="text-xs text-[var(--color-muted)] ml-2">(coming soon)</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export function getStoredInstrument(): InstrumentId {
  if (typeof localStorage === "undefined") return "acoustic-guitar";
  const saved = localStorage.getItem(STORAGE_KEY) as InstrumentId | null;
  return saved && INSTRUMENTS[saved] ? saved : "acoustic-guitar";
}
