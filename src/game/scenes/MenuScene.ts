import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.add.rectangle(480, 270, 960, 540, 0x1f1712);
    this.add
      .text(480, 164, "西游滴打咚", {
        color: "#ffd166",
        fontSize: "52px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.add
      .text(480, 238, "用节奏控制行为，用行为推动喜剧", {
        color: "#f7efe0",
        fontSize: "22px"
      })
      .setOrigin(0.5);
    this.add
      .text(480, 376, "按 Space 查看关卡重构占位页", {
        color: "#d8c7a3",
        fontSize: "20px"
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("LevelScene"));
    this.input.once("pointerdown", () => this.scene.start("LevelScene"));
  }
}
