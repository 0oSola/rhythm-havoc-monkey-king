import { describe, expect, it } from "vitest";
import source from "../../src/game/GameApp.ts?raw";

describe("GameApp", () => {
  it("keeps the authored 16:9 scene fully visible inside the viewport", () => {
    expect(source).toContain("width: 960");
    expect(source).toContain("height: 540");
    expect(source).toContain("mode: Phaser.Scale.FIT");
    expect(source).toContain("autoCenter: Phaser.Scale.CENTER_BOTH");
  });
});
