import Phaser from "phaser";
import type { LevelResultPayload } from "../level/LevelResult";
import { createResultPanel } from "../ui/ResultPanel";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(result: LevelResultPayload): void {
    this.add.rectangle(480, 270, 960, 540, 0x1f1712);
    createResultPanel(this, result);
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("MenuScene"));
    this.input.once("pointerdown", () => this.scene.start("MenuScene"));
  }
}
