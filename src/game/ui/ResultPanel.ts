import type Phaser from "phaser";
import { formatPercent } from "../../shared/utils";
import type { LevelResultPayload } from "../level/LevelResult";
import { resultCgKeyForRating } from "./ResultCg";

export function createResultPanel(
  scene: Phaser.Scene,
  result: LevelResultPayload
): Phaser.GameObjects.Container {
  const { levelName, quote, summary } = result;

  const panelBackground = scene.add
    .rectangle(480, 270, 560, 440, 0x2b2018, 0.94)
    .setStrokeStyle(2, 0xffd166);

  const levelNameText = scene.add
    .text(480, 76, levelName, {
      color: "#ffd166",
      fontSize: "18px",
      fontStyle: "bold"
    })
    .setOrigin(0.5);

  const titleText = scene.add
    .text(480, 112, "结算", {
      color: "#ffd166",
      fontSize: "34px",
      fontStyle: "bold"
    })
    .setOrigin(0.5);

  const resultCg = scene.add
    .image(480, 238, resultCgKeyForRating(summary.rating))
    .setDisplaySize(420, 180);

  const ratingText = scene.add
    .text(480, 354, `评级 ${summary.rating}`, {
      color: "#f7efe0",
      fontSize: "28px"
    })
    .setOrigin(0.5);

  const quoteText = scene.add
    .text(480, 394, quote, {
      color: "#d8c7a3",
      fontSize: "18px",
      align: "center",
      wordWrap: { width: 420 }
    })
    .setOrigin(0.5);

  const summaryText = scene.add
    .text(
      480,
      438,
      `Score ${summary.score} / ${summary.maxScore}  Accuracy ${formatPercent(summary.accuracy)}`,
      {
        color: "#d8c7a3",
        fontSize: "18px"
      }
    )
    .setOrigin(0.5);

  const hintText = scene.add
    .text(480, 478, "按 Space 或点击返回标题", {
      color: "#f7efe0",
      fontSize: "18px"
    })
    .setOrigin(0.5);

  return scene.add.container(0, 0, [
    panelBackground,
    levelNameText,
    titleText,
    resultCg,
    ratingText,
    quoteText,
    summaryText,
    hintText
  ]);
}
