/**
 * Simplified SM-2 spaced repetition scheduler.
 * https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

import type { ReviewRating } from "@lag/shared";

export interface ReviewCardState {
  skillKey: string;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastResult: ReviewRating | null;
}

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function newReviewCard(skillKey: string, now = new Date()): ReviewCardState {
  return {
    skillKey,
    nextReviewAt: now.toISOString(),
    intervalDays: 0,
    easeFactor: DEFAULT_EASE,
    repetitions: 0,
    lastResult: null,
  };
}

/** Apply a review rating and return updated card state. */
export function scheduleReview(
  card: ReviewCardState,
  rating: ReviewRating,
  now = new Date(),
): ReviewCardState {
  let { easeFactor, intervalDays, repetitions } = card;

  if (rating === "again") {
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else if (rating === "hard") {
    repetitions += 1;
    intervalDays = Math.max(1, intervalDays * 1.2);
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
  } else if (rating === "good") {
    repetitions += 1;
    intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 3 : intervalDays * easeFactor;
  } else {
    // easy
    repetitions += 1;
    intervalDays = (repetitions === 1 ? 1 : intervalDays * easeFactor) * 1.3;
    easeFactor += 0.15;
  }

  const next = new Date(now);
  next.setDate(next.getDate() + Math.max(1, Math.round(intervalDays)));

  return {
    skillKey: card.skillKey,
    nextReviewAt: next.toISOString(),
    intervalDays,
    easeFactor,
    repetitions,
    lastResult: rating,
  };
}

export function isDue(card: ReviewCardState, now = new Date()): boolean {
  return new Date(card.nextReviewAt) <= now;
}

/** Map ear-training correctness to SRS rating. */
export function ratingFromCorrect(correct: boolean, responseMs: number): ReviewRating {
  if (!correct) return "again";
  if (responseMs > 8000) return "hard";
  if (responseMs > 4000) return "good";
  return "easy";
}
