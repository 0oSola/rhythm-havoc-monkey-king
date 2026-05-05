import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { advanceLevelFlow, createLevelFlowState } from "../../src/game/level/LevelFlow";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import { pointerEventForState } from "../../src/game/scenes/LevelSceneInputRouting";

describe("LevelSceneInputRouting", () => {
  it("does not map pointer click during auto-advancing opening story captions", () => {
    const level = parseLevelDefinition(gateLevelData);
    const state = createLevelFlowState(level);

    expect(pointerEventForState(level, state)).toBeNull();
  });

  it("maps pointer click to confirm once the final opening story line asks to continue", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(
      pointerEventForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 4
      })
    ).toEqual({ type: "confirm" });
  });

  it("does not map pointer click during the automatic run-in or guard reveal beats", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(
      pointerEventForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 5
      })
    ).toBeNull();

    expect(
      pointerEventForState(level, {
        phaseType: "opening",
        currentPhaseId: "opening",
        stepIndex: 6
      })
    ).toBeNull();
  });

  it("maps pointer click to A input during the attention free-training phase", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 11; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }

    expect(state.currentPhaseId).toBe("attention_free");
    expect(pointerEventForState(level, state)).toEqual({
      type: "free-input",
      inputType: "A"
    });
  });

  it("does not map pointer click to warmup, salute free-training, or rhythm gameplay", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 11; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }

    for (let index = 0; index < 4; index += 1) {
      state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });
    }

    expect(state).toMatchObject({
      currentPhaseId: "attention_rhythm",
      phaseType: "practice",
      stage: "warmup"
    });
    expect(pointerEventForState(level, state)).toBeNull();

    state = advanceLevelFlow(level, state, { type: "practice-warmup-completed" });

    for (let index = 0; index < 3; index += 1) {
      state = advanceLevelFlow(level, state, {
        type: "practice-loop-completed",
        judgements: ["PERFECT", "PERFECT"]
      });
    }

    expect(state.currentPhaseId).toBe("salute_free");
    expect(pointerEventForState(level, state)).toBeNull();
  });
});
