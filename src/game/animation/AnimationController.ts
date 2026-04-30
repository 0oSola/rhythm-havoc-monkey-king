import type Phaser from "phaser";
import type { Direction } from "./AnimationTypes";
import type { JudgementResult } from "../rhythm/RhythmTypes";

export function animationKeyForAction(actor: string, action: string, direction: Direction): string {
  return `${actor}_${action}_${direction}`;
}

export function animationKeyForJudgement(
  actor: string,
  action: string,
  direction: Direction,
  judgement: JudgementResult
): string {
  if (judgement === "MISS") {
    return animationKeyForAction(actor, "fail", direction);
  }

  return animationKeyForAction(actor, action, direction);
}

export class AnimationController {
  playAction(
    sprite: Phaser.GameObjects.Sprite,
    actor: string,
    action: string,
    direction: Direction
  ): void {
    const key = animationKeyForAction(actor, action, direction);

    if (sprite.anims.animationManager.exists(key)) {
      sprite.play(key, true);
    }
  }

  playJudgement(
    sprite: Phaser.GameObjects.Sprite,
    actor: string,
    action: string,
    direction: Direction,
    judgement: JudgementResult
  ): void {
    const key = animationKeyForJudgement(actor, action, direction, judgement);

    if (sprite.anims.animationManager.exists(key)) {
      sprite.play(key, true);
    }
  }
}
