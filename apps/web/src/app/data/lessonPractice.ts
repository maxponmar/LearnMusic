/**
 * Maps each lesson (and module fallback) to concrete in-app practice steps.
 * Keeps the read → do → log loop explicit instead of leaving the learner
 * to guess which tab to open.
 */

import type { LessonSummary } from "@lag/shared";

export type PracticeTool = "fretboard" | "ear" | "songs" | "journal" | "metronome";

export interface PracticeStep {
  tool: PracticeTool;
  label: string;
  /** Path under /app, optional query string included. */
  href: string;
  minutes?: number;
}

/** Module-level default when a lesson has no specific entry. */
const MODULE_DEFAULTS: Record<string, PracticeStep[]> = {
  "fretboard-landmarks": [
    {
      tool: "fretboard",
      label: "Find every root on the neck (root-only mode, key G)",
      href: "/app/fretboard?key=G&mode=root-only",
      minutes: 10,
    },
    {
      tool: "journal",
      label: "Log what you drilled on your guitar",
      href: "/app/journal",
      minutes: 5,
    },
  ],
  "intervals-major-scale": [
    {
      tool: "ear",
      label: "Scale-degree ear trainer — focus on 1, 3, and 5",
      href: "/app/ear-training?mode=scale-degree",
      minutes: 10,
    },
    {
      tool: "fretboard",
      label: "Hear the scale on the fretboard (key G, play scale)",
      href: "/app/fretboard?key=G&mode=scale",
      minutes: 5,
    },
  ],
  "diatonic-chords-nns": [
    {
      tool: "fretboard",
      label: "See all seven diatonic notes in key G",
      href: "/app/fretboard?key=G&mode=scale",
      minutes: 5,
    },
    {
      tool: "ear",
      label: "Chord quality drill — major vs minor vs sus",
      href: "/app/ear-training?mode=chord-quality",
      minutes: 10,
    },
  ],
  "progressions-by-ear": [
    {
      tool: "ear",
      label: "Progression recognition — name the Nashville pattern",
      href: "/app/ear-training?mode=progression",
      minutes: 10,
    },
    {
      tool: "songs",
      label: "Pick a worship chart and verify one section by ear",
      href: "/app/songs",
      minutes: 15,
    },
  ],
  "pentatonic-caged": [
    {
      tool: "fretboard",
      label: "Major pentatonic in G — find shape 1 (open position)",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "journal",
      label: "Log which CAGED shape you worked on",
      href: "/app/journal",
      minutes: 2,
    },
  ],
  improvisation: [
    {
      tool: "fretboard",
      label: "Pentatonic fills over G — try root-only then full pent.",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "songs",
      label: "Improvise one fill per chorus on a chart you know",
      href: "/app/songs",
      minutes: 15,
    },
  ],
};

/** Lesson-specific overrides (more precise than module defaults). */
const LESSON_STEPS: Record<string, PracticeStep[]> = {
  "0001-name-any-note": [
    {
      tool: "fretboard",
      label: "Click every G on the embedded fretboard, then find each on your guitar",
      href: "/app/fretboard?key=G&mode=root-only",
      minutes: 5,
    },
    {
      tool: "journal",
      label: "Name low E & A strings frets 0–7 out loud, then log it",
      href: "/app/journal?minutes=15",
      minutes: 15,
    },
  ],
  "0002-intervals": [
    {
      tool: "fretboard",
      label: "C major scale — click two dots and hear the interval between them",
      href: "/app/fretboard?key=C&mode=scale",
      minutes: 5,
    },
    {
      tool: "ear",
      label: "Scale-degree trainer — hear home (1) vs bright (3) vs stable (5)",
      href: "/app/ear-training?mode=scale-degree",
      minutes: 10,
    },
  ],
  "0003-major-scale": [
    {
      tool: "fretboard",
      label: "G major scale — click up the neck while singing do-re-mi",
      href: "/app/fretboard?key=G&mode=scale",
      minutes: 5,
    },
    {
      tool: "ear",
      label: "10 rounds identifying scale degrees 1, 3, and 5",
      href: "/app/ear-training?mode=scale-degree",
      minutes: 10,
    },
  ],
  "0004-scale-degrees": [
    {
      tool: "ear",
      label: "10 rounds of scale-degree drills (start with 1, 3, 5)",
      href: "/app/ear-training?mode=scale-degree",
      minutes: 10,
    },
    {
      tool: "fretboard",
      label: "Play the G major scale while singing degree numbers (1–7)",
      href: "/app/fretboard?key=G&mode=scale",
      minutes: 5,
    },
  ],
  "0005-diatonic-triads": [
    {
      tool: "fretboard",
      label: "G major scale — click each diatonic note, then play the matching triad",
      href: "/app/fretboard?key=G&mode=scale",
      minutes: 5,
    },
    {
      tool: "ear",
      label: "Chord quality drill — major vs minor vs diminished",
      href: "/app/ear-training?mode=chord-quality",
      minutes: 10,
    },
  ],
  "0006-nashville-number-system": [
    {
      tool: "fretboard",
      label: "Root-only in G — hear where 1, 4, 5, and 6- live on the neck",
      href: "/app/fretboard?key=G&mode=root-only",
      minutes: 5,
    },
    {
      tool: "songs",
      label: "Open a chart in Numbers view — read 1-5-6-4, not G-D-Em-C",
      href: "/app/songs",
      minutes: 10,
    },
    {
      tool: "ear",
      label: "Progression ear trainer — match what you hear to a pattern name",
      href: "/app/ear-training?mode=progression",
      minutes: 10,
    },
  ],
  "0007-worship-progressions": [
    {
      tool: "ear",
      label: "Progression recognition — 10 rounds",
      href: "/app/ear-training?mode=progression",
      minutes: 10,
    },
    {
      tool: "fretboard",
      label: "G major roots — click 1, 4, 5, 6 while hearing a 1-5-6-4 loop",
      href: "/app/fretboard?key=G&mode=root-only",
      minutes: 5,
    },
    {
      tool: "songs",
      label: "Chart a chorus by ear, then compare to the seed chart",
      href: "/app/songs",
      minutes: 20,
    },
  ],
  "0008-pentatonic-scale": [
    {
      tool: "fretboard",
      label: "G major pentatonic — click each dot, hear the five notes",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "journal",
      label: "Play G maj pent and E min pent — same dots, different root — then log it",
      href: "/app/journal",
      minutes: 5,
    },
  ],
  "0009-caged": [
    {
      tool: "fretboard",
      label: "Position 1 (open) and Position 2 (fret 3) — click every dot in each",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "journal",
      label: "Log which CAGED shape you drilled and where the root sits",
      href: "/app/journal",
      minutes: 5,
    },
  ],
  "0010-pentatonic-over-progressions": [
    {
      tool: "fretboard",
      label: "Stay-home vs follow-the-chord — G, D, and E min pentatonic overlays",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "songs",
      label: "Loop a I-V-vi-IV chart and try one fill per chord change",
      href: "/app/songs",
      minutes: 15,
    },
  ],
  "0011-motifs": [
    {
      tool: "metronome",
      label: "Set 60 BPM — clap or strum quarter notes, accent on beat 1",
      href: "/app/metronome?bpm=60",
      minutes: 5,
    },
    {
      tool: "fretboard",
      label: "G-A-B motif on Position 2 pentatonic — click each note before you play it",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "journal",
      label: "Log one motif you state → repeat → vary over G-D-Em-C",
      href: "/app/journal",
      minutes: 5,
    },
  ],
  "0012-space-and-dynamics": [
    {
      tool: "fretboard",
      label: "One soft note per chord change — click a chord tone, play it once, stop",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "journal",
      label: "Log where you left silence in a chorus you know",
      href: "/app/journal",
      minutes: 5,
    },
  ],
  "0013-capo-strategy": [
    {
      tool: "fretboard",
      label: "Capo-2 position in G — pentatonic shape you already know",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
      minutes: 10,
    },
    {
      tool: "ear",
      label: "Progression drill — find the key before choosing a capo fret",
      href: "/app/ear-training?mode=progression",
      minutes: 10,
    },
    {
      tool: "songs",
      label: "Transpose one chart to a new key using capo suggestion",
      href: "/app/songs",
      minutes: 10,
    },
  ],
};

const TOOL_LABEL: Record<PracticeTool, string> = {
  fretboard: "Fretboard lab",
  ear: "Ear trainer",
  songs: "Song charts",
  journal: "Practice journal",
  metronome: "Metronome",
};

export function practiceStepsFor(lesson: Pick<LessonSummary, "id" | "moduleId">): PracticeStep[] {
  return LESSON_STEPS[lesson.id] ?? MODULE_DEFAULTS[lesson.moduleId] ?? MODULE_DEFAULTS["fretboard-landmarks"]!;
}

export function toolLabel(tool: PracticeTool): string {
  return TOOL_LABEL[tool];
}

export function suggestedDailyPractice(
  nextLesson: Pick<LessonSummary, "id" | "moduleId" | "title"> | null,
): PracticeStep[] {
  if (nextLesson) return practiceStepsFor(nextLesson);
  return [
    {
      tool: "metronome",
      label: "Warm up with 2 minutes at a comfortable tempo",
      href: "/app/metronome",
      minutes: 2,
    },
    {
      tool: "ear",
      label: "5 minutes of scale-degree ear training",
      href: "/app/ear-training?mode=scale-degree",
      minutes: 5,
    },
    {
      tool: "fretboard",
      label: "Review the neck in your home key (G)",
      href: "/app/fretboard?key=G&mode=scale",
      minutes: 5,
    },
  ];
}
