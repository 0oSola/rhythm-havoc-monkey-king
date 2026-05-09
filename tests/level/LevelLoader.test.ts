import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";

describe("LevelLoader", () => {
  it("parses the new phase-based gate_01 definition", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(level.levelId).toBe("gate_01");
    expect(level.type).toBe("teaching");
    expect(level.phases.map((phase) => phase.id)).toEqual([
      "opening",
      "attention_free",
      "attention_rhythm",
      "salute_free",
      "salute_rhythm",
      "exam"
    ]);
  });

  it("keeps the agreed first-level copy and practice structure", () => {
    const level = parseLevelDefinition(gateLevelData);
    const openingPhase = level.phases.find((phase) => phase.id === "opening");
    const attentionFree = level.phases.find((phase) => phase.id === "attention_free");
    const attentionPractice = level.phases.find((phase) => phase.id === "attention_rhythm");
    const saluteFree = level.phases.find((phase) => phase.id === "salute_free");
    const salutePractice = level.phases.find((phase) => phase.id === "salute_rhythm");
    const examPhase = level.phases.find((phase) => phase.id === "exam");

    expect(level.name).toBe("南天门 · 混进天庭");
    expect(level.actions.ATTENTION.name).toBe("立正");
    expect(level.actions.SALUTE.name).toBe("敬礼");

    expect(openingPhase).toMatchObject({
      type: "opening"
    });
    expect(openingPhase && "steps" in openingPhase ? openingPhase.steps.map((step) => step.kind) : []).toEqual([
      "story-caption",
      "story-caption",
      "story-caption",
      "story-caption",
      "story-caption",
      "wukong-run-in",
      "guard-reveal",
      "dialogue",
      "dialogue",
      "dialogue",
      "dialogue"
    ]);
    expect(
      openingPhase && "steps" in openingPhase ? openingPhase.steps[0] : null
    ).toMatchObject({
      kind: "story-caption",
      text: "故事要从玉帝宣孙悟空上天做官开始说起……",
      autoAdvanceAfterMs: 1800
    });
    expect(
      openingPhase && "steps" in openingPhase ? openingPhase.steps[4] : null
    ).toMatchObject({
      kind: "story-caption",
      text: "先溜进去再说！",
      requireConfirm: true
    });

    expect(attentionFree).toMatchObject({
      type: "free",
      prompt: "你先学会立正，按A",
      hudPrompt: "按A"
    });

    expect(attentionPractice).toMatchObject({
      type: "practice",
      promptTemplate: "跟着我的节奏来，还有{n}次。",
      hudPromptTemplate: "跟随门卫节奏按A",
      requiredPassCount: 3,
      passThreshold: "GOOD",
      warmupAudioKey: "level1_practice_ready_bgm",
      warmupDurationMs: 2400
    });

    expect(saluteFree).toMatchObject({
      type: "free",
      prompt: "不错，还算有天赋，接下来跟我学敬礼，同时按A和S。",
      hudPrompt: "同时按A和S"
    });

    expect(salutePractice).toMatchObject({
      type: "practice",
      promptTemplate: "注意我的节奏，还有{n}次。",
      hudPromptTemplate: "跟随门卫节奏同时按A和S",
      requiredPassCount: 3,
      passThreshold: "GOOD",
      warmupAudioKey: "level1_practice_ready_bgm",
      warmupDurationMs: 2400
    });

    expect(examPhase).toMatchObject({
      type: "exam",
      backgroundKey: "level1-stage-bg",
      audioKey: "level1_exam_bgm_0503"
    });
  });

  it("rejects level definitions without phases", () => {
    expect(() =>
      parseLevelDefinition({
        levelId: "broken_level",
        name: "Broken",
        bpm: 100,
        type: "teaching",
        actions: {
          ATTENTION: {
            name: "立正",
            inputType: "A",
            animationKey: "wukong_attention_right"
          }
        },
        audio: {
          practiceKey: "practice",
          examKey: "exam"
        },
        phases: [],
        resultTexts: {
          天尊: "ok",
          真仙: "ok",
          道童: "ok",
          凡夫: "ok"
        }
      })
    ).toThrow("Level must include at least one phase");
  });
});
