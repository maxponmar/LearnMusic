/**
 * Maps each lesson (and module fallback) to concrete in-app practice steps.
 * Keeps the read → do → log loop explicit instead of leaving the learner
 * to guess which tab to open.
 */

import type { LessonSummary } from "@lag/shared";

export type PracticeTool = "fretboard" | "ear" | "songs" | "journal";

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
      label: "Root-only mode in G — find every G without counting from open E",
      href: "/app/fretboard?key=G&mode=root-only",
      minutes: 5,
    },
    {
      tool: "journal",
      label: "On your guitar: name low E & A strings frets 0–7 out loud, then log it",
      href: "/app/journal?minutes=15",
      minutes: 15,
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
  "0006-nashville-number-system": [
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
  ],
  "0013-capo-strategy": [
    {
      tool: "fretboard",
      label: "Capo-2 position in G — pentatonic shape you already know",
      href: "/app/fretboard?key=G&mode=scale&pentatonic=major",
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
