import { MODULES } from "./pathModules.js";
import { RHYTHM_UNITS, INSTRUMENT_UNITS } from "./units/pilot.js";
import { LESSON_UNITS } from "./units/lessonUnits.js";
import type { CurriculumUnit } from "./types.js";

export { MODULES };

/** Full ordered learning path. */
export const UNITS: CurriculumUnit[] = [...RHYTHM_UNITS, ...INSTRUMENT_UNITS, ...LESSON_UNITS].sort(
  (a, b) => a.order - b.order,
);

export function getUnit(id: string): CurriculumUnit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function getModuleUnits(moduleId: string): CurriculumUnit[] {
  return UNITS.filter((u) => u.moduleId === moduleId);
}

export function prerequisitesMet(unit: CurriculumUnit, completedIds: Set<string>): boolean {
  return unit.unlockAfter.every((id) => completedIds.has(id));
}

export function nextAvailableUnit(completedIds: Set<string>): CurriculumUnit | undefined {
  return UNITS.find((u) => !completedIds.has(u.id) && prerequisitesMet(u, completedIds));
}

export function allSkillKeysFromUnits(): string[] {
  const keys = new Set<string>();
  for (const u of UNITS) for (const s of u.skills) keys.add(s);
  return [...keys];
}
