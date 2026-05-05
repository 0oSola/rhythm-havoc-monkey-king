import type { LevelActor } from "../level/LevelTypes";
import { OPENING_BEAT_MATCHED_IDLE_FRAME_RATE } from "./LevelOpeningStory";

export const IDLE_ANIMATION_KEY_BY_ACTOR: Record<LevelActor, string> = {
  guard: "guard_idle_left",
  wukong: "wukong_idle_right"
};

export const SHARED_IDLE_FRAME_RATE = OPENING_BEAT_MATCHED_IDLE_FRAME_RATE;
export const SHARED_IDLE_BASE_FRAME_RATE = 6;
export const SHARED_IDLE_ANIMATION_TIME_SCALE =
  SHARED_IDLE_FRAME_RATE / SHARED_IDLE_BASE_FRAME_RATE;
export const SHARED_IDLE_LOOP_KEYS = new Set(["guard_idle_left", "wukong_idle_right", "guard_watch_left"]);

export function idleAnimationKeyForActor(actor: LevelActor): string {
  return IDLE_ANIMATION_KEY_BY_ACTOR[actor];
}

export function loopAnimationTimeScaleForKey(animationKey: string): number {
  return SHARED_IDLE_LOOP_KEYS.has(animationKey) ? SHARED_IDLE_ANIMATION_TIME_SCALE : 1;
}
