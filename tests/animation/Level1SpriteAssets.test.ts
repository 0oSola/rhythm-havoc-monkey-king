import { describe, expect, it } from "vitest";
import guardIdleLeftFrameUrl from "../../src/assets/sprites/level1/guard/idle/guard_idle_left_0001.png?inline";
import guardPraiseLeftFrameUrl from "../../src/assets/sprites/level1/guard/praise/guard_praise_left_0001.png?inline";
import {
  actionLeadInMsForAsset,
  animationPhaseKeysForAsset,
  animationKeysForAsset,
  frameKeysForAssetPhase,
  frameKeysForAsset,
  level1SpriteAssets,
  playbackDurationMsForAsset
} from "../../src/game/animation/Level1SpriteAssets";

function readPngDimensions(dataUrl: string): { width: number; height: number } {
  const [, base64Payload = ""] = dataUrl.split(",", 2);
  const binary = atob(base64Payload);
  const file = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    file[index] = binary.charCodeAt(index);
  }

  const view = new DataView(file.buffer);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20)
  };
}

describe("Level1SpriteAssets", () => {
  it("defines the ten level 1 animation assets needed for gameplay and npc cueing", () => {
    expect(level1SpriteAssets.map((asset) => asset.assetId)).toEqual([
      "wukong_idle_right",
      "guard_idle_left",
      "wukong_attention_right",
      "guard_attention_left",
      "wukong_salute_right",
      "guard_salute_left",
      "guard_praise_left",
      "guard_watch_left",
      "wukong_run_right",
      "wukong_fail_right"
    ]);
  });

  it("keeps the agreed frame counts and hit frames", () => {
    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_idle_right")).toMatchObject({
      frameCount: 2,
      hitFrame: null
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "guard_idle_left")).toMatchObject({
      frameCount: 2,
      hitFrame: null
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_attention_right")).toMatchObject({
      frameCount: 7,
      hitFrame: 4,
      sourceSheet: "level1_attention_dual_sheet.png"
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_salute_right")).toMatchObject({
      frameCount: 7,
      hitFrame: 4,
      sourceSheet: "level1_salute_dual_sheet.png"
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "guard_attention_left")).toMatchObject({
      frameCount: 7,
      hitFrame: 4,
      sourceSheet: "level1_attention_dual_sheet.png"
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "guard_watch_left")).toMatchObject({
      playback: "loop",
      hitFrame: null
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "guard_praise_left")).toMatchObject({
      frameCount: 1,
      frameRate: 1,
      playback: "once",
      hitFrame: null
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_run_right")).toMatchObject({
      frameCount: 5,
      frameRate: 25 / 6,
      hitFrame: null,
      sourceSheet: "wukong_run_right_sheet.png"
    });

    expect(level1SpriteAssets.find((asset) => asset.assetId === "wukong_fail_right")).toMatchObject({
      frameCount: 2,
      hitFrame: 2,
      sourceSheet: "wukong_fail_right_sheet.png"
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

  it("preserves aliases for attention stand playback without reusing salute as praise art", () => {
    const wukongAttention = level1SpriteAssets.find((asset) => asset.assetId === "wukong_attention_right");
    const guardAttention = level1SpriteAssets.find((asset) => asset.assetId === "guard_attention_left");
    const guardSalute = level1SpriteAssets.find((asset) => asset.assetId === "guard_salute_left");
    const guardPraise = level1SpriteAssets.find((asset) => asset.assetId === "guard_praise_left");

    expect(animationKeysForAsset(wukongAttention!)).toContain("wukong_stand_right");
    expect(animationKeysForAsset(guardAttention!)).toContain("guard_stand_left");
    expect(animationKeysForAsset(guardSalute!)).not.toContain("guard_praise_left");
    expect(animationKeysForAsset(guardPraise!)).toEqual(["guard_praise_left"]);
  });

  it("splits once-played rhythm actions into start, hit, and recover phases", () => {
    const salute = level1SpriteAssets.find((asset) => asset.assetId === "wukong_salute_right");

    expect(animationPhaseKeysForAsset(salute!)).toEqual({
      start: "wukong_salute_right__start",
      hit: "wukong_salute_right__hit",
      recover: "wukong_salute_right__recover"
    });

    expect(frameKeysForAssetPhase(salute!, "start")).toEqual([
      "wukong_salute_right_0001",
      "wukong_salute_right_0002",
      "wukong_salute_right_0003"
    ]);
    expect(frameKeysForAssetPhase(salute!, "hit")).toEqual([
      "wukong_salute_right_0004",
      "wukong_salute_right_0004"
    ]);
    expect(frameKeysForAssetPhase(salute!, "recover")).toEqual([
      "wukong_salute_right_0005",
      "wukong_salute_right_0006",
      "wukong_salute_right_0007"
    ]);
  });

  it("computes the lead-in timing needed to land the hit frame on beat", () => {
    const attention = level1SpriteAssets.find((asset) => asset.assetId === "guard_attention_left");
    const salute = level1SpriteAssets.find((asset) => asset.assetId === "guard_salute_left");
    const idle = level1SpriteAssets.find((asset) => asset.assetId === "guard_idle_left");
    const praise = level1SpriteAssets.find((asset) => asset.assetId === "guard_praise_left");

    expect(actionLeadInMsForAsset(attention!)).toBe(125);
    expect(actionLeadInMsForAsset(salute!)).toBe(125);
    expect(actionLeadInMsForAsset(idle!)).toBe(0);
    expect(playbackDurationMsForAsset(praise!)).toBe(1000);
  });

  it("keeps the praise art at the same runtime height without changing its aspect ratio", () => {
    const praiseSize = readPngDimensions(guardPraiseLeftFrameUrl);
    const idleSize = readPngDimensions(guardIdleLeftFrameUrl);

    expect(praiseSize.height).toBe(idleSize.height);
    expect(praiseSize.width).toBe(471);
  });
});
