import Phaser from "phaser";
import {
  MENU_BACKGROUND_KEY,
  MENU_CANVAS_HEIGHT,
  MENU_CANVAS_WIDTH,
  START_BUTTON_BOUNDS
} from "./MenuSceneConfig";

export class MenuScene extends Phaser.Scene {
  private startButtonZone?: Phaser.GameObjects.Zone;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.add
      .image(MENU_CANVAS_WIDTH / 2, MENU_CANVAS_HEIGHT / 2, MENU_BACKGROUND_KEY)
      .setDisplaySize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);

    this.startButtonZone = this.add
      .zone(
        START_BUTTON_BOUNDS.x + START_BUTTON_BOUNDS.width / 2,
        START_BUTTON_BOUNDS.y + START_BUTTON_BOUNDS.height / 2,
        START_BUTTON_BOUNDS.width,
        START_BUTTON_BOUNDS.height
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.startButtonZone.on("pointerup", () => {
      this.scene.start("LevelScene");
    });

    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("LevelScene"));
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("LevelScene"));
  }
}
