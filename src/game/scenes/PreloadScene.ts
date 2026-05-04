import Phaser from "phaser";
import {
  animationPhaseKeysForAsset,
  animationKeysForAsset,
  frameKeysForAssetPhase,
  frameKeysForAsset,
  framePathForAsset,
  level1SpriteAssets
} from "../animation/Level1SpriteAssets";
import { LEVEL1_BACKGROUND_ENTRIES, LEVEL1_SOUND_ENTRIES } from "./Level1AssetCatalog";
import { MENU_BACKGROUND_ENTRIES } from "./MenuAssetCatalog";

const LEVEL1_FRAME_URLS = import.meta.glob(
  [
    "../../assets/sprites/level1/wukong/**/*.png",
    "../../assets/sprites/level1/guard/**/*.png"
  ],
  {
    eager: true,
    import: "default"
  }
) as Record<string, string>;

const LEVEL1_AUDIO_URLS = import.meta.glob("../../assets/audio/level1/*.wav", {
  eager: true,
  import: "default"
}) as Record<string, string>;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.loadLevel1Frames();
    this.loadLevel1Audio();
    this.loadLevel1Backgrounds();
    this.loadMenuBackgrounds();
  }

  create(): void {
    this.createAnimations();
    this.scene.start("MenuScene");
  }

  private loadLevel1Frames(): void {
    level1SpriteAssets.forEach((asset) => {
      for (let frameNumber = 1; frameNumber <= asset.frameCount; frameNumber += 1) {
        const frameKey = frameKeysForAsset(asset)[frameNumber - 1];
        const framePath = `../../assets/sprites/${framePathForAsset(asset, frameNumber)}`;
        const frameUrl = LEVEL1_FRAME_URLS[framePath];

        if (!frameUrl) {
          throw new Error(`Missing sprite frame URL for ${framePath}`);
        }

        this.load.image(frameKey, frameUrl);
      }
    });
  }

  private loadLevel1Audio(): void {
    Object.entries(LEVEL1_SOUND_ENTRIES).forEach(([key, path]) => {
      const audioUrl = LEVEL1_AUDIO_URLS[path];

      if (!audioUrl) {
        throw new Error(`Missing audio URL for ${path}`);
      }

      this.load.audio(key, audioUrl);
    });
  }

  private loadLevel1Backgrounds(): void {
    Object.entries(LEVEL1_BACKGROUND_ENTRIES).forEach(([key, url]) => {
      this.load.image(key, url);
    });
  }

  private loadMenuBackgrounds(): void {
    Object.entries(MENU_BACKGROUND_ENTRIES).forEach(([key, url]) => {
      this.load.image(key, url);
    });
  }

  private createAnimations(): void {
    level1SpriteAssets.forEach((asset) => {
      const frameKeys = frameKeysForAsset(asset);
      const repeat = asset.playback === "loop" ? -1 : 0;

      animationKeysForAsset(asset).forEach((animationKey) => {
        this.createFrameAnimation(animationKey, frameKeys, asset.frameRate, repeat);
      });

      if (asset.playback === "once" && asset.hitFrame !== null) {
        const phaseKeys = animationPhaseKeysForAsset(asset);
        (Object.keys(phaseKeys) as Array<keyof typeof phaseKeys>).forEach((phase) => {
          const phaseFrames = frameKeysForAssetPhase(asset, phase);
          if (phaseFrames.length === 0) {
            return;
          }

          this.createFrameAnimation(phaseKeys[phase], phaseFrames, asset.frameRate, 0);
        });
      }
    });
  }

  private createFrameAnimation(
    key: string,
    frameKeys: string[],
    frameRate: number,
    repeat: number
  ): void {
    if (this.anims.exists(key)) {
      return;
    }

    this.anims.create({
      key,
      frames: frameKeys.map((frameKey) => ({ key: frameKey })),
      frameRate,
      repeat
    });
  }
}
