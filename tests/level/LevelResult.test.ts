import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { createScoreSummary } from "../../src/game/feedback/ScoreSystem";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import { createLevelResultPayload } from "../../src/game/level/LevelResult";

describe("LevelResult", () => {
  it("builds a result payload with the level title and matching rating quote", () => {
    const level = parseLevelDefinition(gateLevelData);
    const summary = createScoreSummary(["PERFECT", "PERFECT", "GREAT", "GOOD"]);

    expect(createLevelResultPayload(level, summary)).toEqual({
      levelName: level.name,
      summary,
      quote: level.resultTexts[summary.rating]
    });
  });
});
