import type Phaser from "phaser";
import type { LevelResultPayload } from "../level/LevelResult";
import { FINAL_CONFIRM_SFX_KEY } from "./LevelCueRules";
import { MENU_FADE_TO_BLACK_DURATION_MS } from "./MenuSceneConfig";

export const LEVEL_RESULT_TRANSITION_DURATION_MS = MENU_FADE_TO_BLACK_DURATION_MS;

type ResultTransitionAdd = Pick<Phaser.GameObjects.GameObjectFactory, "rectangle">;
type ResultTransitionTweenManager = Pick<Phaser.Tweens.TweenManager, "add">;
type ResultTransitionSoundManager = Pick<Phaser.Sound.BaseSoundManager, "play">;
type ResultTransitionScenePlugin = Pick<Phaser.Scenes.ScenePlugin, "start">;

export function beginLevelResultTransition({
  sound,
  add,
  tweens,
  scene,
  payload
}: {
  sound: ResultTransitionSoundManager;
  add: ResultTransitionAdd;
  tweens: ResultTransitionTweenManager;
  scene: ResultTransitionScenePlugin;
  payload: LevelResultPayload;
}): void {
  sound.play(FINAL_CONFIRM_SFX_KEY, { volume: 0.75 });

  const fadeOverlay = add.rectangle(480, 270, 960, 540, 0x000000, 0).setDepth(100);

  tweens.add({
    targets: fadeOverlay,
    alpha: 1,
    duration: LEVEL_RESULT_TRANSITION_DURATION_MS,
    ease: "Sine.easeInOut",
    onComplete: () => {
      scene.start("ResultScene", payload);
    }
  });
}
