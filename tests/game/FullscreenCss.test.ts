import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("fullscreen canvas styles", () => {
  it("lets the game container fill the viewport with black letterbox space", () => {
    const css = readFileSync("src/style.css", "utf8");

    expect(css).toContain("#app {\n  width: 100vw;\n  height: 100vh;");
    expect(css).toContain("background: #000000;");
    expect(css).not.toContain("1280px");
    expect(css).not.toContain("720px");
  });

  it("does not stretch the Phaser canvas away from its scene aspect ratio", () => {
    const css = readFileSync("src/style.css", "utf8");

    expect(css).toContain("canvas {\n  display: block;\n}");
    expect(css).not.toContain("canvas {\n  width: 100vw;\n  height: 100vh;");
    expect(css).not.toContain("canvas {\n  width: 100%;\n  height: 100%;");
  });
});
