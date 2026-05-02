import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { createLevelFlowState } from "../../src/game/level/LevelFlow";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import {
  bubbleActorForState,
  phaseAudioKeyForState,
  phaseBackgroundKeyForState
} from "../../src/game/scenes/LevelScenePresentation";

describe("LevelScenePresentation", () => {
  it("uses the speaking actor from opening dialogue flow", () => {
    const level = parseLevelDefinition(gateLevelData);
    const state = createLevelFlowState(level);

    expect(bubbleActorForState(level, state)).toBe("guard");
    expect(phaseBackgroundKeyForState(level, state)).toBe("level1-opening-bg");
  });

  it("keeps tutorial and exam phases on the clean level stage background", () => {
    const level = parseLevelDefinition(gateLevelData);

    level.phases
      .filter((phase) => phase.type !== "opening")
      .forEach((phase) => {
        expect(phase.backgroundKey).toBe("level1-stage-bg");
      });
  });

  it("routes speak bgm only to dialogue and free teaching, but uses exam music for rhythm phases", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        dialogueIndex: 0
      })
    ).toBe("level1_speak_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "free",
        currentPhaseId: "attention_free",
        progressCount: 0
      })
    ).toBe("level1_speak_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "practice",
        currentPhaseId: "attention_rhythm",
        passCount: 0,
        attempts: 0
      })
    ).toBe("level1_practice_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "exam",
        currentPhaseId: "exam"
      })
    ).toBe("level1_exam_bgm");
  });
});
