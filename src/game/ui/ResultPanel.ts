import type Phaser from "phaser";
import { formatPercent } from "../../shared/utils";
import type { LevelResultPayload } from "../level/LevelResult";

export function createResultPanel(scene: Phaser.Scene, result: LevelResultPayload): void {
  const { levelName, quote, summary } = result;

  scene.add
    .rectangle(480, 270, 520, 300, 0x2b2018, 0.94)
    .setStrokeStyle(2, 0xffd166);

  scene.add
    .text(480, 136, levelName, {
      color: "#ffd166",
      fontSize: "18px",
      fontStyle: "bold"
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 174, "结算", {
      color: "#ffd166",
      fontSize: "34px",
      fontStyle: "bold"
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 228, `评级 ${summary.rating}`, {
      color: "#f7efe0",
      fontSize: "28px"
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 278, quote, {
      color: "#d8c7a3",
      fontSize: "18px",
      align: "center",
      wordWrap: { width: 420 }
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 336, `Score ${summary.score} / ${summary.maxScore}  Accuracy ${formatPercent(summary.accuracy)}`, {
      color: "#d8c7a3",
      fontSize: "18px"
    })
    .setOrigin(0.5);

  scene.add
    .text(480, 390, "按 Space 或点击返回标题", {
      color: "#f7efe0",
      fontSize: "18px"
    })
    .setOrigin(0.5);
}
