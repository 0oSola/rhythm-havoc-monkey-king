import type Phaser from "phaser";

export function createInputHint(scene: Phaser.Scene, x: number, y: number, label: string): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, label, {
      color: "#1f1712",
      backgroundColor: "#ffd166",
      fixedWidth: 72,
      fixedHeight: 42,
      fontSize: "20px",
      fontStyle: "bold",
      align: "center"
    })
    .setOrigin(0.5)
    .setPadding(0, 7, 0, 0);
}
