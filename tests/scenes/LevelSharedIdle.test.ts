import { describe, expect, it } from "vitest";
import {
  loopAnimationTimeScaleForKey,
  IDLE_ANIMATION_KEY_BY_ACTOR,
  SHARED_IDLE_ANIMATION_TIME_SCALE,
  SHARED_IDLE_FRAME_RATE
} from "../../src/game/scenes/LevelSharedIdle";

describe("LevelSharedIdle", () => {
  it("keeps gameplay idle loops on the same beat-matched cadence as opening dialogue", () => {
    expect(SHARED_IDLE_FRAME_RATE).toBe(5 / 3);
    expect(SHARED_IDLE_ANIMATION_TIME_SCALE).toBe(5 / 18);
  });

  it("maps each actor back to the authored idle animation key", () => {
    expect(IDLE_ANIMATION_KEY_BY_ACTOR.guard).toBe("guard_idle_left");
    expect(IDLE_ANIMATION_KEY_BY_ACTOR.wukong).toBe("wukong_idle_right");
  });

  it("keeps the guard watch loop on the same cadence as shared idle", () => {
    expect(loopAnimationTimeScaleForKey("guard_watch_left")).toBe(
      SHARED_IDLE_ANIMATION_TIME_SCALE
    );
    expect(loopAnimationTimeScaleForKey("guard_salute_left")).toBe(1);
  });
});
