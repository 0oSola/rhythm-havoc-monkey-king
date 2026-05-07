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

export const OPENING_RUN_IN_DURATION_MS = 2400;
// Align praise to idle by the lower-body anchor rather than the full bbox,
// so the guard does not appear to slide when returning to idle.
export const GUARD_PRAISE_OFFSET_X = 23.5;
export const GUARD_PRAISE_OFFSET_Y = 1.5;
export const GUARD_PRAISE_IDLE_REPOSITION_DELAY_MS = 300;

export const ACTOR_LAYOUT: Record<LevelActor, ActorLayout> = {
  guard: {
    x: 308,
    y: 304,
    scale: 0.92,
    flipX: false
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
  return ACTOR_LAYOUT[actor].flipX;
}

export function openingRunInFlipXForActor(actor: LevelActor): boolean {
  return ACTOR_LAYOUT[actor].flipX;
}
