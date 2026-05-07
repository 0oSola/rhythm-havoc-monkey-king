import { describe, expect, it } from "vitest";
import {
  ACTOR_LAYOUT,
  BUBBLE_LAYOUT,
  GUARD_PRAISE_IDLE_REPOSITION_DELAY_MS,
  GUARD_PRAISE_OFFSET_X,
  GUARD_PRAISE_OFFSET_Y,
  OPENING_RUN_IN_DURATION_MS,
  openingRunInFlipXForActor,
  watchCueFlipXForActor
} from "../../src/game/scenes/LevelSceneLayout";

describe("LevelSceneLayout", () => {
  it("places the guard on the left and wukong on the right", () => {
    expect(ACTOR_LAYOUT.guard.x).toBeLessThan(ACTOR_LAYOUT.wukong.x);
  });

  it("keeps both actors on the original authored facing", () => {
    expect(ACTOR_LAYOUT.guard.flipX).toBe(false);
    expect(ACTOR_LAYOUT.wukong.flipX).toBe(false);
  });

  it("does not reverse the guard facing during the watch cue", () => {
    expect(watchCueFlipXForActor("guard")).toBe(false);
  });

  it("does not reverse wukong facing during the opening run-in", () => {
    expect(openingRunInFlipXForActor("wukong")).toBe(false);
  });

  it("keeps the opening run-in long enough to land on a four-beat sneaky entrance", () => {
    expect(OPENING_RUN_IN_DURATION_MS).toBe(2400);
  });

  it("aligns praise to idle using the lower-body anchor instead of the full image bounds", () => {
    expect(GUARD_PRAISE_OFFSET_X).toBe(23.5);
    expect(GUARD_PRAISE_OFFSET_Y).toBe(1.5);
    expect(GUARD_PRAISE_IDLE_REPOSITION_DELAY_MS).toBe(300);
  });

  it("keeps each dialogue bubble near its actor", () => {
    expect(BUBBLE_LAYOUT.guard.offsetX).toBeLessThan(0);
    expect(BUBBLE_LAYOUT.wukong.offsetX).toBeGreaterThan(0);
  });

  it("points each bubble tail inward toward the speaking actor", () => {
    expect(BUBBLE_LAYOUT.guard.tailDirection).toBe("right");
    expect(BUBBLE_LAYOUT.wukong.tailDirection).toBe("left");
  });
});
