import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { createLevelFlowState } from "../../src/game/level/LevelFlow";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import {
  bubbleActorForState,
  freeHudPromptForPhase,
  practiceBubblePromptForPhase,
  practiceHudPromptForPhase,
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

  it("keeps bubble copy separate from HUD tutorial prompts", () => {
    const level = parseLevelDefinition(gateLevelData);
    const attentionFree = level.phases.find((entry) => entry.id === "attention_free");
    const attentionPractice = level.phases.find((entry) => entry.id === "attention_rhythm");
    const saluteFree = level.phases.find((entry) => entry.id === "salute_free");
    const salutePractice = level.phases.find((entry) => entry.id === "salute_rhythm");

    expect(attentionFree && attentionFree.type === "free" ? attentionFree.prompt : null).toBe(
      "你先学会立正，按A"
    );
    expect(attentionFree && attentionFree.type === "free" ? freeHudPromptForPhase(level, attentionFree) : null).toBe(
      "按A"
    );

    expect(attentionPractice && attentionPractice.type === "practice" ? attentionPractice.promptTemplate : null).toBe(
      "跟着我的节奏来，还有{n}次。"
    );
    expect(
      attentionPractice && attentionPractice.type === "practice"
        ? practiceBubblePromptForPhase(attentionPractice, 1)
        : null
    ).toBe("跟着我的节奏来，还有2次。");
    expect(
      attentionPractice && attentionPractice.type === "practice"
        ? practiceHudPromptForPhase(attentionPractice, 1)
        : null
    ).toBe("跟随门卫节奏按A");

    expect(saluteFree && saluteFree.type === "free" ? saluteFree.prompt : null).toBe(
      "不错，还算有天赋，接下来跟我学敬礼，同时按A和S。"
    );
    expect(saluteFree && saluteFree.type === "free" ? freeHudPromptForPhase(level, saluteFree) : null).toBe(
      "同时按A和S"
    );

    expect(salutePractice && salutePractice.type === "practice" ? salutePractice.promptTemplate : null).toBe(
      "注意我的节奏，还有{n}次。"
    );
    expect(
      salutePractice && salutePractice.type === "practice" ? practiceBubblePromptForPhase(salutePractice, 1) : null
    ).toBe("注意我的节奏，还有2次。");
    expect(
      salutePractice && salutePractice.type === "practice" ? practiceHudPromptForPhase(salutePractice, 1) : null
    ).toBe("跟随门卫节奏同时按A和S");
  });
});
