/**
 * Skill graph — defines what skills exist and their prerequisites.
 * Used by the learning engine for unlock logic and SRS card creation.
 */

export interface SkillDef {
  key: string;
  label: string;
  /** Skills that must reach mastery ≥ 0.5 before this skill is introduced. */
  requires: string[];
  /** Ear exercise type if this skill maps to ear training. */
  earType?: "scale-degree" | "chord-quality" | "progression";
}

export const SKILLS: Record<string, SkillDef> = {
  "rhythm-quarter": {
    key: "rhythm-quarter",
    label: "Quarter notes in time",
    requires: [],
  },
  "metronome-basic": {
    key: "metronome-basic",
    label: "Play with a metronome",
    requires: [],
  },
  "open-strings": {
    key: "open-strings",
    label: "Open string names",
    requires: ["rhythm-quarter", "metronome-basic"],
  },
  "note-names-low": {
    key: "note-names-low",
    label: "Note names on low E and A",
    requires: ["open-strings"],
  },
  "major-scale": {
    key: "major-scale",
    label: "Major scale shape",
    requires: ["note-names-low"],
  },
  "scale-degree-1": {
    key: "scale-degree-1",
    label: "Hear scale degree 1 (tonic)",
    requires: ["major-scale"],
    earType: "scale-degree",
  },
  "scale-degree-3": {
    key: "scale-degree-3",
    label: "Hear scale degree 3",
    requires: ["scale-degree-1"],
    earType: "scale-degree",
  },
  "scale-degree-5": {
    key: "scale-degree-5",
    label: "Hear scale degree 5 (dominant)",
    requires: ["scale-degree-1"],
    earType: "scale-degree",
  },
  "interval-m3": {
    key: "interval-m3",
    label: "Minor third interval",
    requires: ["scale-degree-3"],
  },
  "interval-M3": {
    key: "interval-M3",
    label: "Major third interval",
    requires: ["scale-degree-3"],
  },
  "diatonic-triads": {
    key: "diatonic-triads",
    label: "Diatonic triads in a key",
    requires: ["interval-m3", "interval-M3"],
    earType: "chord-quality",
  },
  "keys-gdca": {
    key: "keys-gdca",
    label: "Keys G, D, C, A",
    requires: ["diatonic-triads"],
  },
  "progression-ear": {
    key: "progression-ear",
    label: "Hear common progressions",
    requires: ["keys-gdca"],
    earType: "progression",
  },
  "pentatonic-major": {
    key: "pentatonic-major",
    label: "Major pentatonic",
    requires: ["progression-ear"],
  },
  "song-apply": {
    key: "song-apply",
    label: "Play songs with purpose",
    requires: ["progression-ear"],
  },
};

export const SKILL_KEYS = Object.keys(SKILLS);

export function skillRequiresMet(skillKey: string, mastery: Map<string, number>, threshold = 0.5): boolean {
  const def = SKILLS[skillKey];
  if (!def) return true;
  return def.requires.every((r) => (mastery.get(r) ?? 0) >= threshold);
}
