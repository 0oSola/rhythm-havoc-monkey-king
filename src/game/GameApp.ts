import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { LevelScene } from "./scenes/LevelScene";
import { MenuScene } from "./scenes/MenuScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { ResultScene } from "./scenes/ResultScene";

export function startGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: "#1f1712",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, PreloadScene, MenuScene, LevelScene, ResultScene]
  });
}
