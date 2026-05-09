import { describe, expect, it } from "vitest";
import type { ScoreSummary } from "../../src/game/feedback/ScoreSystem";
import {
  RESULT_CG_ENTRIES,
  resultCgKeyForRating
} from "../../src/game/ui/ResultCg";

const RESULT_CG_URLS = import.meta.glob("../../src/assets/results/level1/*.png", {
  eager: true,
  import: "default"
}) as Record<string, string>;

describe("ResultCg", () => {
  it("maps every rating to a preloadable level result CG", () => {
    const ratings: ScoreSummary["rating"][] = ["天尊", "真仙", "道童", "凡夫"];

    expect(ratings.map((rating) => resultCgKeyForRating(rating))).toEqual([
      "level1-result-cg-tianzun",
      "level1-result-cg-zhenxian",
      "level1-result-cg-daotong",
      "level1-result-cg-fanfu"
    ]);

    Object.values(RESULT_CG_ENTRIES).forEach((entry) => {
      expect(RESULT_CG_URLS[`../../src/assets/results/level1/${entry.fileName}`]).toBeDefined();
    });
  });
});
