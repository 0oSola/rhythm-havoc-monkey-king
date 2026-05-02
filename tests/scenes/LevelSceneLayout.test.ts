import { describe, expect, it } from "vitest";
import { ACTOR_LAYOUT, BUBBLE_LAYOUT } from "../../src/game/scenes/LevelSceneLayout";

describe("LevelSceneLayout", () => {
  it("places the guard on the left and wukong on the right", () => {
    expect(ACTOR_LAYOUT.guard.x).toBeLessThan(ACTOR_LAYOUT.wukong.x);
  });

  it("keeps the guard mirrored and wukong on the original facing for the swapped staging", () => {
    expect(ACTOR_LAYOUT.guard.flipX).toBe(true);
    expect(ACTOR_LAYOUT.wukong.flipX).toBe(false);
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
