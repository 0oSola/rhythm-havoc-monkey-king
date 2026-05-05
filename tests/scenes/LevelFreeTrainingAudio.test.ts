import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import { playerSfxKeyForFreeTrainingInput } from "../../src/game/scenes/LevelFreeTrainingAudio";

describe("LevelFreeTrainingAudio", () => {
  it("plays the configured player sfx when the free-training input matches the phase action", () => {
    const level = parseLevelDefinition(gateLevelData);
    const attentionFree = level.phases.find((phase) => phase.id === "attention_free");

    expect(attentionFree?.type).toBe("free");
    if (!attentionFree || attentionFree.type !== "free") {
      throw new Error("attention_free phase missing");
    }

    expect(playerSfxKeyForFreeTrainingInput(level, attentionFree, "A")).toBe("立正.wav");
  });

  it("does not play player sfx for the wrong input during free training", () => {
    const level = parseLevelDefinition(gateLevelData);
    const attentionFree = level.phases.find((phase) => phase.id === "attention_free");

    expect(attentionFree?.type).toBe("free");
    if (!attentionFree || attentionFree.type !== "free") {
      throw new Error("attention_free phase missing");
    }

    expect(playerSfxKeyForFreeTrainingInput(level, attentionFree, "B")).toBeNull();
  });
});
