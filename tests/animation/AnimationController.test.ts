import { describe, expect, it, vi } from "vitest";
import {
  AnimationController,
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

  it("lets a queued action start only after the current segmented action fully completes", () => {
    const controller = new AnimationController();
    const handlers = new Map<string, () => void>();
    const playCalls: string[] = [];
    const existingKeys = new Set([
      "wukong_idle_right",
      "wukong_attention_right__start",
      "wukong_attention_right__hit",
      "wukong_attention_right__recover",
      "wukong_salute_right__start",
      "wukong_salute_right__hit",
      "wukong_salute_right__recover"
    ]);
    const sprite = {
      anims: {
        animationManager: {
          exists: vi.fn((key: string) => existingKeys.has(key))
        }
      },
      play: vi.fn((key: string) => {
        playCalls.push(key);
      }),
      once: vi.fn((event: string, handler: () => void) => {
        handlers.set(event, handler);
      }),
      off: vi.fn((event: string) => {
        handlers.delete(event);
      })
    };

    controller.playReactiveAction(sprite as never, "wukong", "attention", "right");
    controller.playReactiveAction(sprite as never, "wukong", "salute", "right");

    expect(playCalls).toEqual(["wukong_attention_right__hit"]);

    handlers.get("animationcomplete")?.();
    expect(playCalls).toEqual([
      "wukong_attention_right__hit",
      "wukong_attention_right__recover"
    ]);

    handlers.get("animationcomplete")?.();
    expect(playCalls).toEqual([
      "wukong_attention_right__hit",
      "wukong_attention_right__recover",
      "wukong_salute_right__hit"
    ]);

    handlers.get("animationcomplete")?.();
    expect(playCalls).toEqual([
      "wukong_attention_right__hit",
      "wukong_attention_right__recover",
      "wukong_salute_right__hit",
      "wukong_salute_right__recover"
    ]);

    handlers.get("animationcomplete")?.();
    expect(playCalls).toEqual([
      "wukong_attention_right__hit",
      "wukong_attention_right__recover",
      "wukong_salute_right__hit",
      "wukong_salute_right__recover",
      "wukong_idle_right"
    ]);
  });

  it("does not let guard praise block the next rhythm action", () => {
    const controller = new AnimationController();
    const playCalls: string[] = [];
    const existingKeys = new Set([
      "guard_idle_left",
      "guard_praise_left",
      "guard_attention_left__start",
      "guard_attention_left__hit",
      "guard_attention_left__recover"
    ]);
    const sprite = {
      anims: {
        animationManager: {
          exists: vi.fn((key: string) => existingKeys.has(key))
        }
      },
      play: vi.fn((key: string) => {
        playCalls.push(key);
      }),
      once: vi.fn(),
      off: vi.fn()
    };

    controller.playAction(sprite as never, "guard", "praise", "left");
    controller.playTelegraphedAction(sprite as never, "guard", "attention", "left");

    expect(playCalls).toEqual(["guard_praise_left", "guard_attention_left__start"]);
  });
});
