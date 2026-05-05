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
  it("uses no bubble actor during non-dialogue opening beats and uses the speaker during dialogue beats", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(
      bubbleActorForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 0
      })
    ).toBeNull();

    expect(
      bubbleActorForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 7
      })
    ).toBe("guard");

    expect(phaseBackgroundKeyForState(level, createLevelFlowState(level))).toBe("level1-opening-bg");
  });

  it("keeps tutorial and exam phases on the clean level stage background", () => {
    const level = parseLevelDefinition(gateLevelData);

    level.phases
      .filter((phase) => phase.type !== "opening")
      .forEach((phase) => {
        expect(phase.backgroundKey).toBe("level1-stage-bg");
      });
  });

  it("routes the new dialogue, warmup, practice, and exam bgm keys by phase stage", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 0
      })
    ).toBe("level1_dialogue_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "free",
        currentPhaseId: "attention_free",
        progressCount: 0
      })
    ).toBe("level1_dialogue_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "practice",
        currentPhaseId: "attention_rhythm",
        passCount: 0,
        attempts: 0,
        stage: "warmup"
      })
    ).toBe("level1_practice_ready_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "practice",
        currentPhaseId: "attention_rhythm",
        passCount: 0,
        attempts: 0,
        stage: "loop"
      })
    ).toBe("level1_attention_practice_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "practice",
        currentPhaseId: "salute_rhythm",
        passCount: 0,
        attempts: 0,
        stage: "loop"
      })
    ).toBe("level1_salute_practice_bgm");

    expect(
      phaseAudioKeyForState(level, {
        phaseType: "exam",
        currentPhaseId: "exam"
      })
    ).toBe("level1_exam_bgm_0503");
  });
});
