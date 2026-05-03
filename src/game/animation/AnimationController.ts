import type Phaser from "phaser";
import type { ActionPhase, Direction } from "./AnimationTypes";
import type { JudgementResult } from "../rhythm/RhythmTypes";

export function animationKeyForAction(actor: string, action: string, direction: Direction): string {
  return `${actor}_${action}_${direction}`;
}

export function animationKeyForActionPhase(
  actor: string,
  action: string,
  direction: Direction,
  phase: ActionPhase
): string {
  return `${animationKeyForAction(actor, action, direction)}__${phase}`;
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
  playTelegraphedAction(
    sprite: Phaser.GameObjects.Sprite,
    actor: string,
    action: string,
    direction: Direction
  ): void {
    const idleKey = animationKeyForAction(actor, "idle", direction);
    const sequence = [
      animationKeyForActionPhase(actor, action, direction, "start"),
      animationKeyForActionPhase(actor, action, direction, "hit"),
      animationKeyForActionPhase(actor, action, direction, "recover")
    ];

    if (this.playSequence(sprite, sequence, idleKey)) {
      return;
    }

    this.playAction(sprite, actor, action, direction);
  }

  playReactiveAction(
    sprite: Phaser.GameObjects.Sprite,
    actor: string,
    action: string,
    direction: Direction
  ): void {
    const idleKey = animationKeyForAction(actor, "idle", direction);
    const sequence = [
      animationKeyForActionPhase(actor, action, direction, "hit"),
      animationKeyForActionPhase(actor, action, direction, "recover")
    ];

    if (this.playSequence(sprite, sequence, idleKey)) {
      return;
    }

    this.playAction(sprite, actor, action, direction);
  }

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
    if (judgement === "MISS") {
      this.playReactiveAction(sprite, actor, "fail", direction);
      return;
    }

    this.playReactiveAction(sprite, actor, action, direction);
  }

  private playSequence(
    sprite: Phaser.GameObjects.Sprite,
    sequence: string[],
    idleKey: string
  ): boolean {
    const playable = sequence.filter((key) => sprite.anims.animationManager.exists(key));
    if (playable.length === 0) {
      return false;
    }

    const playNext = (index: number) => {
      const key = playable[index];
      if (!key) {
        if (sprite.anims.animationManager.exists(idleKey)) {
          sprite.play(idleKey, true);
        }
        return;
      }

      sprite.play(key, true);
      sprite.once("animationcomplete", () => {
        if (index >= playable.length - 1) {
          if (sprite.anims.animationManager.exists(idleKey)) {
            sprite.play(idleKey, true);
          }
          return;
        }

        playNext(index + 1);
      });
    };

    playNext(0);
    return true;
  }
}
