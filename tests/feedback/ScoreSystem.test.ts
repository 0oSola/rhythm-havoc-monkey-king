import { describe, expect, it } from "vitest";
import { createScoreSummary } from "../../src/game/feedback/ScoreSystem";

describe("ScoreSystem", () => {
  it("scores judgement results and maps accuracy to rating", () => {
    expect(createScoreSummary(["PERFECT", "GREAT", "GOOD", "MISS"])).toEqual({
      score: 230,
      maxScore: 400,
      accuracy: 0.575,
      rating: "凡夫"
    });
  });

  it("returns the top rating at 95 percent accuracy", () => {
    expect(createScoreSummary(["PERFECT", "PERFECT", "PERFECT", "PERFECT"]).rating).toBe(
      "天尊"
    );
  });
});
