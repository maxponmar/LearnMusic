/**
 * Adaptive ear-training prompt selection — weights due SRS skills.
 */

import { SKILLS } from "@lag/curriculum";
import { getDueSkillKeys } from "./learningEngine.js";
import { generatePrompt } from "./earTrainingPrompts.js";
import type { EarTrainingPrompt } from "@lag/shared";

const DEGREE_SKILL_MAP: Record<string, number> = {
  "scale-degree-1": 1,
  "scale-degree-3": 3,
  "scale-degree-5": 5,
};

/** Pick exercise type and options based on due review skills (70%) or random (30%). */
export function generateAdaptivePrompt(): EarTrainingPrompt {
  const due = getDueSkillKeys();
  const useDue = due.length > 0 && Math.random() < 0.7;
  const skillKey = useDue ? due[Math.floor(Math.random() * due.length)]! : null;

  if (skillKey) {
    const def = SKILLS[skillKey];
    if (def?.earType === "chord-quality") {
      return generatePrompt("chord-quality");
    }
    if (def?.earType === "progression") {
      return generatePrompt("progression");
    }
    const degree = DEGREE_SKILL_MAP[skillKey];
    if (degree) {
      return generatePrompt("scale-degree", { targetDegree: degree });
    }
  }

  // Fallback: random scale degree (most common early drill)
  const types = ["scale-degree", "scale-degree", "chord-quality", "progression"] as const;
  const type = types[Math.floor(Math.random() * types.length)]!;
  return generatePrompt(type);
}
