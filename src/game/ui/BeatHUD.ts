import type Phaser from "phaser";
import { BEAT_HUD_LAYOUT } from "./BeatHUDLayout";

function titleLabelForLevel(levelName: string): string {
  return levelName.length <= 10 ? levelName : "第一关";
}

export class BeatHUD {
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly promptText: Phaser.GameObjects.Text;
  private readonly feedbackText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, levelName: string) {
    this.titleText = scene.add
      .text(BEAT_HUD_LAYOUT.title.x, BEAT_HUD_LAYOUT.title.y, titleLabelForLevel(levelName), {
        color: "#fff7e8",
        fontSize: `${BEAT_HUD_LAYOUT.title.fontSize}px`,
        fontStyle: "bold",
        backgroundColor: "rgba(24, 18, 14, 0.58)",
        padding: { left: 12, right: 12, top: 6, bottom: 6 }
      })
      .setOrigin(0, 0)
      .setDepth(30);

    this.scoreText = scene.add
      .text(BEAT_HUD_LAYOUT.score.x, BEAT_HUD_LAYOUT.score.y, "Combo 0  Score 0", {
        color: "#fff7e8",
        fontSize: `${BEAT_HUD_LAYOUT.score.fontSize}px`,
        backgroundColor: "rgba(24, 18, 14, 0.58)",
        padding: { left: 12, right: 12, top: 6, bottom: 6 }
      })
      .setOrigin(1, 0)
      .setDepth(30);

    this.feedbackText = scene.add
      .text(BEAT_HUD_LAYOUT.feedback.x, BEAT_HUD_LAYOUT.feedback.y, "按 A 或点击继续", {
        color: "#ffd166",
        fontSize: `${BEAT_HUD_LAYOUT.feedback.fontSize}px`,
        fontStyle: "bold",
        backgroundColor: "rgba(24, 18, 14, 0.58)",
        padding: { left: 12, right: 12, top: 6, bottom: 6 },
        align: "center"
      })
      .setOrigin(0.5, 0)
      .setDepth(30);

    this.promptText = scene.add
      .text(BEAT_HUD_LAYOUT.prompt.x, BEAT_HUD_LAYOUT.prompt.y, "A 立正 / A+S 敬礼", {
        color: "#2f241c",
        fontSize: `${BEAT_HUD_LAYOUT.prompt.fontSize}px`,
        backgroundColor: "rgba(255, 247, 232, 0.94)",
        padding: { left: 18, right: 18, top: 10, bottom: 10 },
        align: "center",
        wordWrap: {
          width: BEAT_HUD_LAYOUT.prompt.width,
          useAdvancedWrap: true
        }
      })
      .setOrigin(0.5)
      .setDepth(30);
  }

  setScore(combo: number, score: number): void {
    this.scoreText.setText(`Combo ${combo}  Score ${score}`);
  }

  setFeedback(label: string, color = "#ffd166"): void {
    this.feedbackText.setText(label);
    this.feedbackText.setColor(color);
  }

  setPrompt(prompt: string): void {
    this.promptText.setText(prompt);
  }

  setTitle(title: string): void {
    this.titleText.setText(titleLabelForLevel(title));
  }
}
