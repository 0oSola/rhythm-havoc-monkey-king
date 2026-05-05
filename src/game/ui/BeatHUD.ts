import type Phaser from "phaser";
import { BEAT_HUD_LAYOUT } from "./BeatHUDLayout";

export class BeatHUD {
  private readonly promptText: Phaser.GameObjects.Text;
  private readonly feedbackText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, _levelName: string) {
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

  setScore(_combo: number, _score: number): void {}

  setFeedback(label: string, color = "#ffd166"): void {
    this.feedbackText.setText(label);
    this.feedbackText.setColor(color);
  }

  setFeedbackVisible(visible: boolean): void {
    this.feedbackText.setVisible(visible);
  }

  setPrompt(prompt: string): void {
    this.promptText.setText(prompt);
  }

  setPromptVisible(visible: boolean): void {
    this.promptText.setVisible(visible);
  }

  setTitle(_title: string): void {}
}
