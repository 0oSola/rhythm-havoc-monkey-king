import type Phaser from "phaser";
import type { LevelResultPayload } from "../level/LevelResult";
import { createResultPanel } from "../ui/ResultPanel";

export const RESULT_SCENE_FADE_IN_DURATION_MS = 500;

type ResultSceneTweenManager = Pick<Phaser.Tweens.TweenManager, "add">;
type FadeableResultPanel = {
  setAlpha: (value: number) => unknown;
};
type ResultPanelFactory = (
  scene: Phaser.Scene,
  result: LevelResultPayload
) => FadeableResultPanel;

export function showResultSceneIntro({
  scene,
  tweens,
  result,
  createPanel = createResultPanel
}: {
  scene: Phaser.Scene;
  tweens: ResultSceneTweenManager;
  result: LevelResultPayload;
  createPanel?: ResultPanelFactory;
}): void {
  const panel = createPanel(scene, result);
  panel.setAlpha(0);

  tweens.add({
    targets: panel,
    alpha: 1,
    duration: RESULT_SCENE_FADE_IN_DURATION_MS,
    ease: "Sine.easeOut"
  });
}
