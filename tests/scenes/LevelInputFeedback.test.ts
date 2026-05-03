import { describe, expect, it } from "vitest";
import {
  failedSfxKeyForResolvedInput,
  type ResolvedInputFeedback
} from "../../src/game/scenes/LevelInputFeedback";

describe("LevelInputFeedback", () => {
  it("plays the failed sfx only for wrong-time player inputs", () => {
    const wrongAttentionInput: ResolvedInputFeedback = {
      kind: "wrong-input",
      inputType: "A"
    };
    const wrongSaluteInput: ResolvedInputFeedback = {
      kind: "wrong-input",
      inputType: "AB"
    };

    expect(failedSfxKeyForResolvedInput(wrongAttentionInput)).toBe("PLAYER-failed.wav");
    expect(failedSfxKeyForResolvedInput(wrongSaluteInput)).toBe("PLAYER-failed.wav");
  });

  it("stays silent when the player simply misses by not pressing anything", () => {
    const silentMiss: ResolvedInputFeedback = {
      kind: "miss-no-input"
    };

    expect(failedSfxKeyForResolvedInput(silentMiss)).toBeNull();
  });
});
