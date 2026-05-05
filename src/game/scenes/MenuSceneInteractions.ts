import type Phaser from "phaser";

type MenuSceneInteractionsOptions = {
  startButtonZone: Pick<Phaser.GameObjects.Zone, "on">;
  keyboard?: Pick<Phaser.Input.Keyboard.KeyboardPlugin, "once">;
  onStart: () => void;
};

export function bindMenuStartInteractions({
  startButtonZone,
  keyboard,
  onStart
}: MenuSceneInteractionsOptions): void {
  startButtonZone.on("pointerup", onStart);
  keyboard?.once("keydown-A", onStart);
}
