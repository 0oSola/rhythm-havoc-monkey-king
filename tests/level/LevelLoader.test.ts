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

  it("keeps the agreed first-level practice rules", () => {
    const level = parseLevelDefinition(gateLevelData);
    const attentionPractice = level.phases.find((phase) => phase.id === "attention_rhythm");
    const salutePractice = level.phases.find((phase) => phase.id === "salute_rhythm");
    const examPhase = level.phases.find((phase) => phase.id === "exam");

    expect(attentionPractice).toMatchObject({
      type: "practice",
      requiredPassCount: 3,
      passThreshold: "GOOD"
    });

    expect(salutePractice).toMatchObject({
      type: "practice",
      requiredPassCount: 3,
      passThreshold: "GOOD"
    });

    expect(examPhase).toMatchObject({
      type: "exam",
      backgroundKey: "level1-stage-bg"
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
