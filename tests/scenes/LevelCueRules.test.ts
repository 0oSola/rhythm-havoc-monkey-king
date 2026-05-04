import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import {
  createExamCueWindows,
  dialogueConfirmSfxKeyForState,
  isFullHitBar,
  practiceHandoffCueWindow,
  practicePraiseCueTimeMs
} from "../../src/game/scenes/LevelCueRules";

describe("LevelCueRules", () => {
  it("uses normal and final confirm sfx only on dialogue opening steps", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(
      dialogueConfirmSfxKeyForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 3
      })
    ).toBeNull();

    expect(
      dialogueConfirmSfxKeyForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 4
      })
    ).toBe("level1_dialogue_confirm_sfx");

    expect(
      dialogueConfirmSfxKeyForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 7
      })
    ).toBe("level1_dialogue_confirm_final_sfx");
  });

  it("derives practice handoff and praise cue timing from the 2-bar loop", () => {
    const level = parseLevelDefinition(gateLevelData);
    const phase = level.phases.find((entry) => entry.id === "attention_rhythm");

    expect(phase && phase.type === "practice" ? practiceHandoffCueWindow(phase, 0) : null).toEqual({
      triggerTimeMs: 2100,
      sustainUntilMs: 4800
    });
    expect(phase && phase.type === "practice" ? practicePraiseCueTimeMs(phase, 0) : null).toBe(4500);
  });

  it("only praises player bars when every event was hit", () => {
    expect(isFullHitBar(["GOOD", "PERFECT"])).toBe(true);
    expect(isFullHitBar(["GOOD", "MISS"])).toBe(false);
    expect(isFullHitBar([])).toBe(false);
  });

  it("builds exam cue windows only for npc bars that hand off to a player bar", () => {
    const level = parseLevelDefinition(gateLevelData);
    const exam = level.phases.find((entry) => entry.id === "exam");

    expect(exam && exam.type === "exam" ? createExamCueWindows(exam) : []).toEqual(
      expect.arrayContaining([
        {
          npcBar: 3,
          playerBar: 4,
          handoffTimeMs: 6900,
          playerBarStartTimeMs: 7200,
          playerBarEndTimeMs: 9600,
          praiseTimeMs: 9300
        },
        {
          npcBar: 33,
          playerBar: 34,
          handoffTimeMs: 78900,
          playerBarStartTimeMs: 79200,
          playerBarEndTimeMs: 81600,
          praiseTimeMs: 81300
        }
      ])
    );
  });
});
