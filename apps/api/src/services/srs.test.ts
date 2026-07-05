import { describe, expect, it } from "vitest";
import { newReviewCard, scheduleReview, ratingFromCorrect } from "./srs.js";

describe("SRS scheduler", () => {
  it("again resets interval to 1 day", () => {
    const card = newReviewCard("scale-degree-1");
    const updated = scheduleReview(card, "again");
    expect(updated.intervalDays).toBe(1);
    expect(updated.repetitions).toBe(0);
  });

  it("good increases interval on repeat reviews", () => {
    let card = newReviewCard("scale-degree-1");
    card = scheduleReview(card, "good");
    card = scheduleReview(card, "good");
    expect(card.repetitions).toBe(2);
    expect(card.intervalDays).toBeGreaterThan(1);
  });

  it("maps fast correct answers to easy", () => {
    expect(ratingFromCorrect(true, 2000)).toBe("easy");
    expect(ratingFromCorrect(false, 2000)).toBe("again");
  });
});
