/**
 * Metronome route — rhythm practice with Tone.js click track.
 */

import { Metronome } from "../components/Metronome";

export function MetronomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl mb-2">Metronome</h1>
        <p className="text-[var(--color-muted)] max-w-prose">
          Steady time is the foundation of everything you'll play. Start slow, stay in the pocket,
          then speed up only when the rhythm feels natural.
        </p>
      </header>
      <Metronome />
    </div>
  );
}
