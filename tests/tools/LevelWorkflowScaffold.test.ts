import { describe, expect, it } from "vitest";
import {
  buildLevelWorkflowScaffold,
  normalizeLevelWorkflowOptions
} from "../../scripts/levelWorkflowScaffold.mjs";
import type { LevelWorkflowFile } from "../../scripts/levelWorkflowScaffold.mjs";

describe("level workflow scaffold", () => {
  it("normalizes and validates required options", () => {
    expect(
      normalizeLevelWorkflowOptions({
        levelId: "horse_02",
        levelName: "弼马温上班记"
      })
    ).toEqual({
      levelId: "horse_02",
      levelName: "弼马温上班记",
      levelDir: "horse_02",
      levelNumber: "02",
      audioKey: "horse_02_bgm"
    });
  });

  it("rejects invalid level ids", () => {
    expect(() =>
      normalizeLevelWorkflowOptions({
        levelId: "Level2",
        levelName: "弼马温上班记"
      })
    ).toThrow("levelId must use snake_case with a numeric suffix, for example gate_01.");
  });

  it("builds the standard workflow files for a level", () => {
    const files = buildLevelWorkflowScaffold({
      levelId: "horse_02",
      levelName: "弼马温上班记"
    });

    expect(files.map((file: LevelWorkflowFile) => file.path)).toEqual([
      "docs/levels/horse_02/spec.md",
      "docs/levels/horse_02/assets.md",
      "docs/levels/horse_02/qa.md",
      "src/game/level/levels/horse_02.json",
      "tests/level/horse_02.test.ts"
    ]);

    expect(files.find((file: LevelWorkflowFile) => file.path === "docs/levels/horse_02/spec.md")?.content).toContain(
      "levelId: `horse_02`"
    );
    expect(
      files.find((file: LevelWorkflowFile) => file.path === "src/game/level/levels/horse_02.json")?.content
    ).toContain(
      '"levelId": "horse_02"'
    );
    expect(files.find((file: LevelWorkflowFile) => file.path === "tests/level/horse_02.test.ts")?.content).toContain(
      'describe("horse_02 level scaffold"'
    );
  });
});
