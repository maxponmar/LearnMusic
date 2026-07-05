/** A single practice step inside a unit. */
export type PracticeTool =
  | "metronome"
  | "fretboard"
  | "ear"
  | "open-strings"
  | "songs"
  | "journal";

export interface PracticeStep {
  tool: PracticeTool;
  label: string;
  href?: string;
  bpm?: number;
  minutes?: number;
}

export type UnitType = "learn" | "drill" | "checkpoint" | "apply";

export type PassCriteriaType = "manual" | "ear-reps" | "min-time";

export interface PassCriteria {
  type: PassCriteriaType;
  /** Minimum seconds on unit before marking complete (manual type). */
  minSeconds?: number;
  minAccuracy?: number;
  minReps?: number;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  order: number;
  type: UnitType;
  skills: string[];
  html: string;
  practice: PracticeStep[];
  unlockAfter: string[];
  passCriteria: PassCriteria;
  /** Link to full lesson in lessons/ for deep reading. */
  deepDiveLessonId?: string;
  estimatedMinutes: number;
}

export interface CurriculumModule {
  id: string;
  name: string;
  order: number;
  goal: string;
}
