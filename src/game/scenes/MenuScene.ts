import Phaser from "phaser";
import {
  MENU_BACKGROUND_KEY,
  MENU_CANVAS_HEIGHT,
  MENU_CANVAS_WIDTH,
  MENU_FADE_TO_BLACK_DURATION_MS,
  START_BUTTON_BOUNDS
} from "./MenuSceneConfig";
import { attachMenuStartAffordance } from "./MenuSceneAffordance";
import { attachMenuOpeningBgm, playMenuStartConfirmSfx } from "./MenuSceneAudio";
import { bindMenuStartInteractions } from "./MenuSceneInteractions";

export class MenuScene extends Phaser.Scene {
  private startButtonZone?: Phaser.GameObjects.Zone;
  private releaseMenuOpeningBgm?: () => void;
  private isTransitioning = false;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.isTransitioning = false;
    this.releaseMenuOpeningBgm = attachMenuOpeningBgm(this.sound);

    this.add
      .image(MENU_CANVAS_WIDTH / 2, MENU_CANVAS_HEIGHT / 2, MENU_BACKGROUND_KEY)
      .setDisplaySize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);
    attachMenuStartAffordance(this, MENU_BACKGROUND_KEY);

    this.startButtonZone = this.add
      .zone(
        START_BUTTON_BOUNDS.x + START_BUTTON_BOUNDS.width / 2,
        START_BUTTON_BOUNDS.y + START_BUTTON_BOUNDS.height / 2,
        START_BUTTON_BOUNDS.width,
        START_BUTTON_BOUNDS.height
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    bindMenuStartInteractions({
      startButtonZone: this.startButtonZone,
      keyboard: this.input.keyboard ?? undefined,
      onStart: () => this.startLevel()
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.releaseMenuOpeningBgm?.();
      this.releaseMenuOpeningBgm = undefined;
    });
  }

  private startLevel(): void {
    if (this.isTransitioning) {
      return;
    }
    this.isTransitioning = true;

    playMenuStartConfirmSfx(this.sound);

    this.startButtonZone?.removeInteractive();

    const fadeOverlay = this.add
      .rectangle(MENU_CANVAS_WIDTH / 2, MENU_CANVAS_HEIGHT / 2, MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT, 0x000000, 0)
      .setDepth(100);

    this.tweens.add({
      targets: fadeOverlay,
      fillAlpha: 1,
      duration: MENU_FADE_TO_BLACK_DURATION_MS,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.releaseMenuOpeningBgm?.();
        this.releaseMenuOpeningBgm = undefined;
        this.scene.start("LevelScene");
      }
    });
  }
}
