import { describe, expect, it } from "vitest";
import {
  LEVEL1_BACKGROUND_ENTRIES,
  LEVEL1_FRAME_GLOB_PATTERNS,
  LEVEL1_SOUND_ENTRIES
} from "../../src/game/scenes/Level1AssetCatalog";

describe("Level1AssetCatalog", () => {
  it("loads level 1 frame assets only from actor frame folders", () => {
    expect(LEVEL1_FRAME_GLOB_PATTERNS).toEqual([
      "../../assets/sprites/level1/wukong/**/*.png",
      "../../assets/sprites/level1/guard/**/*.png"
    ]);
    expect(LEVEL1_FRAME_GLOB_PATTERNS.some((pattern) => pattern.includes("staging"))).toBe(false);
  });

  it("provides the two runtime background URLs", () => {
    expect(Object.keys(LEVEL1_BACKGROUND_ENTRIES)).toEqual([
      "level1-opening-bg",
      "level1-stage-bg"
    ]);
    expect(decodeURIComponent(LEVEL1_BACKGROUND_ENTRIES["level1-opening-bg"])).toContain("opening.png");
    expect(decodeURIComponent(LEVEL1_BACKGROUND_ENTRIES["level1-stage-bg"])).toContain("stage.png");
  });

  it("uses the current level 1 audio set", () => {
    expect(LEVEL1_SOUND_ENTRIES).toMatchObject({
      level1_speak_bgm: "../../assets/audio/level1/speak-bgm.wav",
      level1_practice_bgm: "../../assets/audio/level1/level1-NPC&玩家全对音效BGM.wav",
      level1_exam_bgm: "../../assets/audio/level1/lever1-BPM100-34bar.wav"
    });
  });
});
