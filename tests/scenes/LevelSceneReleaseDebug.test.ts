import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("LevelScene release debug gating", () => {
  it("gates debug panel and dev sequence commands behind Vite dev mode", () => {
    const source = readFileSync("src/game/scenes/LevelScene.ts", "utf8").replace(/\r\n/g, "\n");

    expect(source).toContain("const LEVEL_SCENE_DEBUG_ENABLED = import.meta.env.DEV;");
    expect(source).toContain("if (LEVEL_SCENE_DEBUG_ENABLED) {\n      this.createBubbleDebugPanel();");
    expect(source).toContain("if (!LEVEL_SCENE_DEBUG_ENABLED) {\n      return;\n    }\n\n    if (event.repeat");
  });
});
