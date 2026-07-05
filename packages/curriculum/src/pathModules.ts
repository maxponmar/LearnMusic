import type { CurriculumModule } from "./types.js";

export const MODULES: CurriculumModule[] = [
  { id: "time-rhythm", name: "0 · Time & rhythm", order: 0, goal: "Play in time with a metronome" },
  { id: "your-instrument", name: "1 · Your instrument", order: 1, goal: "Know the neck's landmarks" },
  { id: "notes-major-scale", name: "2 · Notes & major scale", order: 2, goal: "See and hear the major scale" },
  { id: "scale-degrees", name: "3 · Scale degrees", order: 3, goal: "Notes have jobs, not just names" },
  { id: "chords-keys", name: "4 · Chords & keys", order: 4, goal: "Chords come from the scale" },
  { id: "play-with-purpose", name: "5 · Play with purpose", order: 5, goal: "Escape memorization-only playing" },
  { id: "improv-basics", name: "6 · Improv basics", order: 6, goal: "Play tasteful fills and motifs" },
];
