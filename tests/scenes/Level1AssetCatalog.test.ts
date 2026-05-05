import { describe, expect, it } from "vitest";
import {
  LEVEL1_BACKGROUND_ENTRIES,
  LEVEL1_FRAME_GLOB_PATTERNS,
  LEVEL1_SOUND_ENTRIES
} from "../../src/game/scenes/Level1AssetCatalog";

const LEVEL1_AUDIO_URLS = import.meta.glob("../../src/assets/audio/level1/*.wav", {
  eager: true,
  import: "default"
}) as Record<string, string>;

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

  it("uses the current level 1 audio set and player action keys", () => {
    expect(LEVEL1_SOUND_ENTRIES).toMatchObject({
      level1_dialogue_bgm: "../../assets/audio/level1/level1-dialogue-bgm.wav",
      level1_dialogue_confirm_sfx: "../../assets/audio/level1/dialogue-confirm.wav",
      level1_dialogue_confirm_final_sfx: "../../assets/audio/level1/dialogue-confirm-final.wav",
      level1_guard_oi_sfx: "../../assets/audio/level1/guard-oi.wav",
      level1_practice_ready_bgm: "../../assets/audio/level1/level1-practice-ready.wav",
      level1_attention_practice_bgm: "../../assets/audio/level1/level1-practice-attention.wav",
      level1_salute_practice_bgm: "../../assets/audio/level1/level1-practice-salute.wav",
      level1_exam_bgm_0503: "../../assets/audio/level1/level1-exam-bgm-0503.wav",
      level1_player_attention_sfx: "../../assets/audio/level1/PLAYER-attention.wav",
      level1_player_salute_sfx: "../../assets/audio/level1/PLAYER-salute.wav",
      "立正.wav": "../../assets/audio/level1/PLAYER-attention.wav",
      "敬礼.wav": "../../assets/audio/level1/PLAYER-salute.wav",
      "PLAYER-failed.wav": "../../assets/audio/level1/PLAYER-failed.wav",
      "PLAYER-correct.wav": "../../assets/audio/level1/player-correct.wav"
    });
  });

  it("maps every runtime audio path to a preloadable wav entry", () => {
    Object.values(LEVEL1_SOUND_ENTRIES).forEach((relativePath) => {
      const lookupPath = relativePath.replace("../../assets/audio", "../../src/assets/audio");
      expect(LEVEL1_AUDIO_URLS[lookupPath], `${relativePath} should be preloadable`).toBeDefined();
    });
  });
});
