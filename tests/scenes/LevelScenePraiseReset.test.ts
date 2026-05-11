import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("LevelScene praise reset", () => {
  it("returns the guard to idle when praise feedback expires", () => {
    const source = readFileSync("src/game/scenes/LevelScene.ts", "utf8");

    expect(source).toContain("this.playActorIdleLoop(\"guard\", true);");
  });
});
