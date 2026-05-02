export type Level1SpriteActor = "wukong" | "guard";
export type Level1SpriteDirection = "right" | "left";
export type Level1SpritePlayback = "loop" | "once";

export interface Level1SpriteAsset {
  assetId: string;
  actor: Level1SpriteActor;
  action: string;
  direction: Level1SpriteDirection;
  frameCount: number;
  playback: Level1SpritePlayback;
  frameRate: number;
  hitFrame: number | null;
  sourceSheet: string;
  outputDirectory: string;
  animationAliases?: readonly string[];
}

export const level1SpriteAssets: readonly Level1SpriteAsset[] = [
  {
    assetId: "wukong_idle_right",
    actor: "wukong",
    action: "idle",
    direction: "right",
    frameCount: 4,
    playback: "loop",
    frameRate: 6,
    hitFrame: null,
    sourceSheet: "level1_idle_dual_sheet.png",
    outputDirectory: "level1/wukong/idle"
  },
  {
    assetId: "guard_idle_left",
    actor: "guard",
    action: "idle",
    direction: "left",
    frameCount: 4,
    playback: "loop",
    frameRate: 6,
    hitFrame: null,
    sourceSheet: "level1_idle_dual_sheet.png",
    outputDirectory: "level1/guard/idle"
  },
  {
    assetId: "wukong_attention_right",
    actor: "wukong",
    action: "attention",
    direction: "right",
    frameCount: 4,
    playback: "once",
    frameRate: 10,
    hitFrame: 3,
    sourceSheet: "level1_attention_dual_sheet.png",
    outputDirectory: "level1/wukong/attention",
    animationAliases: ["wukong_stand_right"]
  },
  {
    assetId: "guard_attention_left",
    actor: "guard",
    action: "attention",
    direction: "left",
    frameCount: 4,
    playback: "once",
    frameRate: 10,
    hitFrame: 3,
    sourceSheet: "level1_attention_dual_sheet.png",
    outputDirectory: "level1/guard/attention",
    animationAliases: ["guard_stand_left"]
  },
  {
    assetId: "wukong_salute_right",
    actor: "wukong",
    action: "salute",
    direction: "right",
    frameCount: 7,
    playback: "once",
    frameRate: 12,
    hitFrame: 4,
    sourceSheet: "level1_salute_dual_sheet.png",
    outputDirectory: "level1/wukong/salute"
  },
  {
    assetId: "guard_salute_left",
    actor: "guard",
    action: "salute",
    direction: "left",
    frameCount: 7,
    playback: "once",
    frameRate: 12,
    hitFrame: 4,
    sourceSheet: "level1_salute_dual_sheet.png",
    outputDirectory: "level1/guard/salute"
  },
  {
    assetId: "wukong_run_right",
    actor: "wukong",
    action: "run",
    direction: "right",
    frameCount: 6,
    playback: "loop",
    frameRate: 12,
    hitFrame: null,
    sourceSheet: "wukong_run_right_sheet.png",
    outputDirectory: "level1/wukong/run"
  },
  {
    assetId: "wukong_fail_right",
    actor: "wukong",
    action: "fail",
    direction: "right",
    frameCount: 5,
    playback: "once",
    frameRate: 10,
    hitFrame: 3,
    sourceSheet: "wukong_fail_right_sheet.png",
    outputDirectory: "level1/wukong/fail"
  }
];

export function frameKeysForAsset(asset: Level1SpriteAsset): string[] {
  return Array.from({ length: asset.frameCount }, (_, index) => `${asset.assetId}_${String(index + 1).padStart(4, "0")}`);
}

export function animationKeysForAsset(asset: Level1SpriteAsset): string[] {
  return [asset.assetId, ...(asset.animationAliases ?? [])];
}

export function framePathForAsset(asset: Level1SpriteAsset, frameNumber: number): string {
  return `${asset.outputDirectory}/${asset.assetId}_${String(frameNumber).padStart(4, "0")}.png`;
}
