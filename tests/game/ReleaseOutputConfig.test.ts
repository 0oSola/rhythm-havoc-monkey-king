import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("release output config", () => {
  it("builds deployable release assets into the wukong directory", () => {
    const source = readFileSync("vite.config.ts", "utf8").replace(/\r\n/g, "\n");

    expect(source).toContain('base: "./"');
    expect(source).toContain("build: {\n    outDir: \"wukong\"");
  });

  it("keeps generated release directories out of lint checks", () => {
    const source = readFileSync("eslint.config.js", "utf8").replace(/\r\n/g, "\n");

    expect(source).toContain('ignores: ["dist", "release", "wukong", "node_modules", "coverage"]');
  });
});
