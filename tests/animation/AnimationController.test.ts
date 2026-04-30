import { describe, expect, it } from "vitest";
import {
  animationKeyForAction,
  animationKeyForJudgement
} from "../../src/game/animation/AnimationController";

describe("AnimationController", () => {
  it("creates stable Phaser animation keys from character actions", () => {
    expect(animationKeyForAction("wukong", "salute", "right")).toBe("wukong_salute_right");
  });

  it("maps miss feedback to the actor fail animation", () => {
    expect(animationKeyForJudgement("wukong", "stand", "right", "MISS")).toBe("wukong_fail_right");
  });
});
