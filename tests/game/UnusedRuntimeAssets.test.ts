import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const UNUSED_RUNTIME_ASSET_PATHS = [
  "src/assets/audio/\u751f\u6210\u8fde\u8d2f\u52a8\u4f5c\u89c6\u9891 (1).mp4",
  "src/assets/audio/\u751f\u6210\u8fde\u8d2f\u52a8\u4f5c\u89c6\u9891.mp4",
  "src/assets/sprites/level1/guard/praise/guard_praise_left_0001 - bk.png",
  "src/assets/sprites/level1/wukong/idle/wukong_idle_right_0001.png\u7684\u66ff\u8eab",
  "src/assets/sprites/level1/wukong/idle/wukong_idle_right_0002.png\u7684\u66ff\u8eab"
] as const;

describe("unused runtime assets", () => {
  it("removes files that are not part of the runtime asset set", () => {
    expect(
      UNUSED_RUNTIME_ASSET_PATHS.filter((path) => existsSync(path))
    ).toEqual([]);
  });
});
