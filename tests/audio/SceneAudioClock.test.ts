import { describe, expect, it, vi } from "vitest";
import { createSceneAudioClock } from "../../src/game/audio/SceneAudioClock";

describe("SceneAudioClock", () => {
  it("reuses the Phaser sound manager AudioContext when one is available", () => {
    const resume = vi.fn(async () => undefined);
    const sharedContext = {
      state: "running" as const,
      currentTime: 12.345,
      resume
    };

    const clock = createSceneAudioClock({ context: sharedContext });

    expect(clock.context).toBe(sharedContext);
  });

  it("falls back to a provided factory when the sound manager has no AudioContext", () => {
    const fallbackContext = {
      state: "suspended" as const,
      currentTime: 0,
      resume: vi.fn(async () => undefined)
    };
    const factory = vi.fn(() => fallbackContext);

    const clock = createSceneAudioClock({}, factory);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(clock.context).toBe(fallbackContext);
  });
});
