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

type SpriteAnimationState = {
  isBusy: boolean;
  queue: Array<() => void>;
};

export class AnimationController {
  private readonly spriteStates = new WeakMap<Phaser.GameObjects.Sprite, SpriteAnimationState>();

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

    this.enqueueOrRun(sprite, () => {
      if (this.playSequence(sprite, sequence, idleKey)) {
        return;
      }

      this.playActionNow(sprite, actor, action, direction, idleKey);
    });
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

    this.enqueueOrRun(sprite, () => {
      if (this.playSequence(sprite, sequence, idleKey)) {
        return;
      }

      this.playActionNow(sprite, actor, action, direction, idleKey);
    });
  }

  playAction(
    sprite: Phaser.GameObjects.Sprite,
    actor: string,
    action: string,
    direction: Direction
  ): void {
    const idleKey = animationKeyForAction(actor, "idle", direction);

    if (action === "praise") {
      this.playNonBlockingAction(sprite, actor, action, direction);
      return;
    }

    this.enqueueOrRun(sprite, () => {
      this.playActionNow(sprite, actor, action, direction, idleKey);
    });
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
        this.finishAction(sprite, idleKey);
        return;
      }

      sprite.play(key, true);
      sprite.once("animationcomplete", () => {
        if (index >= playable.length - 1) {
          this.finishAction(sprite, idleKey);
          return;
        }

        playNext(index + 1);
      });
    };

    playNext(0);
    return true;
  }

  private playActionNow(
    sprite: Phaser.GameObjects.Sprite,
    actor: string,
    action: string,
    direction: Direction,
    idleKey: string
  ): void {
    const key = animationKeyForAction(actor, action, direction);

    if (!sprite.anims.animationManager.exists(key)) {
      this.finishAction(sprite, idleKey);
      return;
    }

    sprite.play(key, true);

    if (!this.requiresFullPlayback(action)) {
      this.finishAction(sprite, idleKey);
      return;
    }

    sprite.once("animationcomplete", () => {
      this.finishAction(sprite, idleKey);
    });
  }

  private playNonBlockingAction(
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

  private enqueueOrRun(sprite: Phaser.GameObjects.Sprite, runner: () => void): void {
    const state = this.stateForSprite(sprite);
    if (state.isBusy) {
      state.queue.push(runner);
      return;
    }

    state.isBusy = true;
    runner();
  }

  private finishAction(sprite: Phaser.GameObjects.Sprite, idleKey: string): void {
    const state = this.stateForSprite(sprite);
    const next = state.queue.shift();

    if (next) {
      state.isBusy = true;
      next();
      return;
    }

    state.isBusy = false;
    if (sprite.anims.animationManager.exists(idleKey)) {
      sprite.play(idleKey, true);
    }
  }

  private stateForSprite(sprite: Phaser.GameObjects.Sprite): SpriteAnimationState {
    const existing = this.spriteStates.get(sprite);
    if (existing) {
      return existing;
    }

    const created: SpriteAnimationState = {
      isBusy: false,
      queue: []
    };
    this.spriteStates.set(sprite, created);
    return created;
  }

  private requiresFullPlayback(action: string): boolean {
    return !["idle", "watch", "run"].includes(action);
  }
}
