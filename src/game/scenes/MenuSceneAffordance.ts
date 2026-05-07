import type Phaser from "phaser";
import { START_BUTTON_BOUNDS } from "./MenuSceneConfig";

export const MENU_START_PROMPT_TEXT = "按 A 或点击开始游戏";

type MenuAffordanceScene = Pick<Phaser.Scene, "add" | "tweens">;

export function attachMenuStartAffordance(
  scene: MenuAffordanceScene,
  _backgroundKey: string
): void {
  const centerX = START_BUTTON_BOUNDS.x + START_BUTTON_BOUNDS.width / 2;

  scene.add
    .text(
      centerX,
      START_BUTTON_BOUNDS.y + START_BUTTON_BOUNDS.height - 14,
      MENU_START_PROMPT_TEXT,
      {
        fontSize: "14px",
        color: "#8e8e8e",
        fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", sans-serif"
      }
    )
    .setOrigin(0.5, 0)
    .setDepth(2);
}
