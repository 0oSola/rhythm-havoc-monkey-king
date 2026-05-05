import { describe, expect, it } from "vitest";
import {
  didPracticePassIncrement,
  shouldRestartPracticeLoopAudio
} from "../../src/game/scenes/LevelPracticeLoopState";

describe("LevelPracticeLoopState", () => {
  it("restarts practice audio when the next loop stays in the same practice phase", () => {
    expect(
      shouldRestartPracticeLoopAudio(
        {
          phaseType: "practice",
          currentPhaseId: "attention_rhythm",
          passCount: 1,
          attempts: 2,
          stage: "loop"
        },
        {
          phaseType: "practice",
          currentPhaseId: "attention_rhythm",
          passCount: 2,
          attempts: 3,
          stage: "loop"
        }
      )
    ).toBe(true);
  });

  it("does not restart practice audio when the loop exits the practice phase", () => {
    expect(
      shouldRestartPracticeLoopAudio(
        {
          phaseType: "practice",
          currentPhaseId: "attention_rhythm",
          passCount: 2,
          attempts: 3,
          stage: "loop"
        },
        {
          phaseType: "free",
          currentPhaseId: "salute_free",
          progressCount: 0
        }
      )
    ).toBe(false);
  });

  it("treats a loop as passed only when passCount actually increments", () => {
    expect(
      didPracticePassIncrement(
        {
          phaseType: "practice",
          currentPhaseId: "attention_rhythm",
          passCount: 1,
          attempts: 2,
          stage: "loop"
        },
        {
          phaseType: "practice",
          currentPhaseId: "attention_rhythm",
          passCount: 2,
          attempts: 3,
          stage: "loop"
        }
      )
    ).toBe(true);

    expect(
      didPracticePassIncrement(
        {
          phaseType: "practice",
          currentPhaseId: "attention_rhythm",
          passCount: 1,
          attempts: 2,
          stage: "loop"
        },
        {
          phaseType: "practice",
          currentPhaseId: "attention_rhythm",
          passCount: 1,
          attempts: 3,
          stage: "loop"
        }
      )
    ).toBe(false);
  });
});
