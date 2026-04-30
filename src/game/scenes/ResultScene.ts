import Phaser from "phaser";
import type { ScoreSummary } from "../feedback/ScoreSystem";
import { createResultPanel } from "../ui/ResultPanel";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(summary: ScoreSummary): void {
    this.add.rectangle(480, 270, 960, 540, 0x1f1712);
    createResultPanel(this, summary);
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("MenuScene"));
    this.input.once("pointerdown", () => this.scene.start("MenuScene"));
  }
}
