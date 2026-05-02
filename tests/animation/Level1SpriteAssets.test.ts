import { describe, expect, it } from "vitest";
import {
  animationKeysForAsset,
  frameKeysForAsset,
  level1SpriteAssets
} from "../../src/game/animation/Level1SpriteAssets";

describe("Level1SpriteAssets", () => {
  it("defines the eight level 1 animation assets needed for the prototype", () => {
    expect(level1SpriteAssets.map((asset) => asset.assetId)).toEqual([
      "wukong_idle_right",
      "guard_idle_left",
      "wukong_attention_right",
      "guard_attention_left",
      "wukong_salute_right",
      "guard_salute_left",
      "wukong_run_right",
      "wukong_fail_right"
    ]);
  });

  it("keeps the agreed frame counts and hit frames", () => {
    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_attention_right")).toMatchObject({
      frameCount: 4,
      hitFrame: 3,
      sourceSheet: "level1_attention_dual_sheet.png"
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_salute_right")).toMatchObject({
      frameCount: 7,
      hitFrame: 4,
      sourceSheet: "level1_salute_dual_sheet.png"
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_run_right")).toMatchObject({
      frameCount: 6,
      hitFrame: null,
      sourceSheet: "wukong_run_right_sheet.png"
    });
  });

  it("builds stable frame keys from the asset id", () => {
    const asset = level1SpriteAssets.find((entry) => entry.assetId === "guard_salute_left");

    expect(asset).toBeDefined();
    expect(frameKeysForAsset(asset!)).toEqual([
      "guard_salute_left_0001",
      "guard_salute_left_0002",
      "guard_salute_left_0003",
      "guard_salute_left_0004",
      "guard_salute_left_0005",
      "guard_salute_left_0006",
      "guard_salute_left_0007"
    ]);
  });

  it("preserves the old stand animation aliases for attention actions", () => {
    const wukongAttention = level1SpriteAssets.find((asset) => asset.assetId === "wukong_attention_right");
    const guardAttention = level1SpriteAssets.find((asset) => asset.assetId === "guard_attention_left");

    expect(animationKeysForAsset(wukongAttention!)).toContain("wukong_stand_right");
    expect(animationKeysForAsset(guardAttention!)).toContain("guard_stand_left");
  });
});
