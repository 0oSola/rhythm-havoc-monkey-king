import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { advanceLevelFlow, createLevelFlowState } from "../../src/game/level/LevelFlow";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import { pointerEventForState } from "../../src/game/scenes/LevelSceneInputRouting";

describe("LevelSceneInputRouting", () => {
  it("maps pointer click to confirm during opening", () => {
    const level = parseLevelDefinition(gateLevelData);
    const state = createLevelFlowState(level);

    expect(pointerEventForState(level, state)).toEqual({ type: "confirm" });
  });

  it("maps pointer click to A input during the attention free-training phase", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 4; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }

    expect(state.currentPhaseId).toBe("attention_free");
    expect(pointerEventForState(level, state)).toEqual({
      type: "free-input",
      inputType: "A"
    });
  });

  it("does not map pointer click to the salute free-training phase", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 4; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }

    for (let index = 0; index < 9; index += 1) {
      state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });
    }

    for (let index = 0; index < 3; index += 1) {
      state = advanceLevelFlow(level, state, {
        type: "practice-loop-completed",
        judgements: ["GOOD", "GOOD"]
      });
    }

    expect(state.currentPhaseId).toBe("salute_free");
    expect(pointerEventForState(level, state)).toBeNull();
  });
});
