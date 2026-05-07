import { describe, expect, it, vi } from "vitest";
import type { LevelResultPayload } from "../../src/game/level/LevelResult";
import {
  RESULT_SCENE_FADE_IN_DURATION_MS,
  showResultSceneIntro
} from "../../src/game/scenes/ResultSceneIntro";

describe("ResultSceneIntro", () => {
  it("fades the result panel in from transparent to fully visible", () => {
    const panel = {
      setAlpha: vi.fn(() => panel)
    };
    const createPanel = vi.fn(() => panel);
    const tweens = {
      add: vi.fn()
    };
    const payload: LevelResultPayload = {
      levelName: "Gate 01",
      summary: {
        score: 100,
        maxScore: 160,
        accuracy: 0.625,
        rating: "道童"
      },
      quote: "Result quote"
    };

    showResultSceneIntro({
      scene: {} as never,
      tweens: tweens as never,
      result: payload,
      createPanel
    });

    expect(createPanel).toHaveBeenCalledWith({}, payload);
    expect(panel.setAlpha).toHaveBeenCalledWith(0);

    const tweenConfig = tweens.add.mock.calls[0]?.[0] as
      | { targets: unknown; alpha: number; duration: number; ease: string }
      | undefined;

    expect(tweenConfig).toBeDefined();
    expect(tweenConfig?.targets).toBe(panel);
    expect(tweenConfig?.alpha).toBe(1);
    expect(tweenConfig?.duration).toBe(RESULT_SCENE_FADE_IN_DURATION_MS);
    expect(tweenConfig?.ease).toBe("Sine.easeOut");
  });
});
