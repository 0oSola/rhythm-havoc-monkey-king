import type Phaser from "phaser";

export class BeatHUD {
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly promptText: Phaser.GameObjects.Text;
  private readonly feedbackText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, levelName: string) {
    this.titleText = scene.add.text(32, 26, levelName, {
      color: "#f7efe0",
      fontSize: "22px",
      fontStyle: "bold"
    });

    this.scoreText = scene.add.text(720, 28, "Combo 0  Score 0", {
      color: "#f7efe0",
      fontSize: "18px"
    });

    this.feedbackText = scene.add
      .text(480, 106, "按 Space 开始", {
        color: "#ffd166",
        fontSize: "30px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.promptText = scene.add
      .text(480, 492, "A 立正 / S 辅助组合 AB", {
        color: "#d8c7a3",
        fontSize: "20px"
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
