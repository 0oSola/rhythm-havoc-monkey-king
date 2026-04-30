import type Phaser from "phaser";
import { formatPercent } from "../../shared/utils";
import type { ScoreSummary } from "../feedback/ScoreSystem";

export function createResultPanel(scene: Phaser.Scene, summary: ScoreSummary): void {
  scene.add
    .rectangle(480, 270, 520, 300, 0x2b2018, 0.94)
    .setStrokeStyle(2, 0xffd166);

  scene.add
    .text(480, 164, "结算", {
      color: "#ffd166",
      fontSize: "34px",
      fontStyle: "bold"
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 238, `评级 ${summary.rating}`, {
      color: "#f7efe0",
      fontSize: "28px"
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 292, `Score ${summary.score} / ${summary.maxScore}  Accuracy ${formatPercent(summary.accuracy)}`, {
      color: "#d8c7a3",
      fontSize: "18px"
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 370, "按 Space 回到标题", {
      color: "#f7efe0",
      fontSize: "18px"
    })
    .setOrigin(0.5);
}
