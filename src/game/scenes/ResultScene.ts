import Phaser from "phaser";
import type { LevelResultPayload } from "../level/LevelResult";
import { showResultSceneIntro } from "./ResultSceneIntro";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(result: LevelResultPayload): void {
    this.add.rectangle(480, 270, 960, 540, 0x1f1712);
    showResultSceneIntro({
      scene: this,
      tweens: this.tweens,
      result
    });
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("MenuScene"));
    this.input.once("pointerdown", () => this.scene.start("MenuScene"));
  }
}
