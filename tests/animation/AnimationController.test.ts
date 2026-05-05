import { describe, expect, it } from "vitest";
import {
  animationKeyForAction,
  animationKeyForActionPhase,
  animationKeyForJudgement
} from "../../src/game/animation/AnimationController";

describe("AnimationController", () => {
  it("creates stable Phaser animation keys from character actions", () => {
    expect(animationKeyForAction("wukong", "salute", "right")).toBe("wukong_salute_right");
    expect(animationKeyForAction("guard", "praise", "left")).toBe("guard_praise_left");
  });

  it("maps miss feedback to the actor fail animation", () => {
    expect(animationKeyForJudgement("wukong", "stand", "right", "MISS")).toBe("wukong_fail_right");
  });

  it("creates stable phase keys for segmented rhythm actions", () => {
    expect(animationKeyForActionPhase("wukong", "salute", "right", "start")).toBe(
      "wukong_salute_right__start"
    );
    expect(animationKeyForActionPhase("wukong", "salute", "right", "recover")).toBe(
      "wukong_salute_right__recover"
    );
  });
});
