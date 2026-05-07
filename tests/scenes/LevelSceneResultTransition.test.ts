import { describe, expect, it, vi } from "vitest";
import type { LevelResultPayload } from "../../src/game/level/LevelResult";
import {
  beginLevelResultTransition,
  LEVEL_RESULT_TRANSITION_DURATION_MS
} from "../../src/game/scenes/LevelSceneResultTransition";

describe("LevelSceneResultTransition", () => {
  it("plays the final confirm sfx and only starts the result scene after the fade completes", () => {
    const sound = {
      play: vi.fn()
    };
    const overlay = {
      setDepth: vi.fn(() => overlay)
    };
    const add = {
      rectangle: vi.fn(() => overlay)
    };
    const tweens = {
      add: vi.fn()
    };
    const scene = {
      start: vi.fn()
    };
    const payload: LevelResultPayload = {
      levelName: "Gate 01",
      summary: {
        score: 1234,
        maxScore: 1600,
        accuracy: 0.77125,
        rating: "道童"
      },
      quote: "Result quote"
    };

    beginLevelResultTransition({
      sound: sound as never,
      add: add as never,
      tweens: tweens as never,
      scene: scene as never,
      payload
    });

    expect(sound.play).toHaveBeenCalledWith("level1_dialogue_confirm_final_sfx", {
      volume: 0.75
    });
    expect(add.rectangle).toHaveBeenCalledWith(480, 270, 960, 540, 0x000000, 0);
    expect(overlay.setDepth).toHaveBeenCalledWith(100);

    const capturedTweenConfig = tweens.add.mock.calls[0]?.[0] as
      | { duration: number; alpha: number; onComplete: () => void }
      | undefined;

    expect(capturedTweenConfig).toBeDefined();
    if (!capturedTweenConfig) {
      throw new Error("Expected tween config to be captured");
    }

    expect(capturedTweenConfig.duration).toBe(LEVEL_RESULT_TRANSITION_DURATION_MS);
    expect(capturedTweenConfig.alpha).toBe(1);
    expect(scene.start).not.toHaveBeenCalled();

    capturedTweenConfig.onComplete();

    expect(scene.start).toHaveBeenCalledWith("ResultScene", payload);
  });
});
