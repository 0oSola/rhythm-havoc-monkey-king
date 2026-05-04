import type { LevelActor } from "../level/LevelTypes";

export interface ActorLayout {
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
}

export interface BubbleLayout {
  offsetX: number;
  offsetY: number;
  tailDirection: "left" | "right";
}

export const STAGE_SHADOWS = {
  guard: { x: 312, y: 380, width: 176, height: 26 },
  wukong: { x: 648, y: 390, width: 176, height: 26 }
} as const;

export const ACTOR_LAYOUT: Record<LevelActor, ActorLayout> = {
  guard: {
    x: 308,
    y: 304,
    scale: 0.92,
    flipX: true
  },
  wukong: {
    x: 650,
    y: 318,
    scale: 0.94,
    flipX: false
  }
};

export const BUBBLE_LAYOUT: Record<LevelActor, BubbleLayout> = {
  guard: {
    offsetX: -232,
    offsetY: -182,
    tailDirection: "right"
  },
  wukong: {
    offsetX: 232,
    offsetY: -184,
    tailDirection: "left"
  }
};

export function watchCueFlipXForActor(actor: LevelActor): boolean {
  return actor === "guard" ? !ACTOR_LAYOUT.guard.flipX : ACTOR_LAYOUT.wukong.flipX;
}

export function openingRunInFlipXForActor(actor: LevelActor): boolean {
  return actor === "wukong" ? !ACTOR_LAYOUT.wukong.flipX : ACTOR_LAYOUT.guard.flipX;
}
