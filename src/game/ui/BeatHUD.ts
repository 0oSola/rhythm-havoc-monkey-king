import type Phaser from "phaser";

export class BeatHUD {
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly promptText: Phaser.GameObjects.Text;
  private readonly feedbackText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, levelName: string) {
    this.titleText = scene.add.text(28, 22, levelName, {
      color: "#fff7e8",
      fontSize: "22px",
      fontStyle: "bold",
      backgroundColor: "rgba(24, 18, 14, 0.58)",
      padding: { left: 14, right: 14, top: 8, bottom: 8 }
    });

    this.scoreText = scene.add.text(708, 24, "Combo 0  Score 0", {
      color: "#fff7e8",
      fontSize: "18px",
      backgroundColor: "rgba(24, 18, 14, 0.58)",
      padding: { left: 14, right: 14, top: 8, bottom: 8 }
    });

    this.feedbackText = scene.add
      .text(480, 40, "按 A 或点击继续", {
        color: "#ffd166",
        fontSize: "18px",
        fontStyle: "bold",
        backgroundColor: "rgba(24, 18, 14, 0.58)",
        padding: { left: 14, right: 14, top: 8, bottom: 8 }
      })
      .setOrigin(0.5, 0);

    this.promptText = scene.add
      .text(480, 504, "A 立正 / A+S 敬礼", {
        color: "#2f241c",
        fontSize: "16px",
        backgroundColor: "rgba(255, 247, 232, 0.92)",
        padding: { left: 16, right: 16, top: 8, bottom: 8 }
      })
      .setOrigin(0.5);
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
    this.titleText.setText(title);
  }
}
