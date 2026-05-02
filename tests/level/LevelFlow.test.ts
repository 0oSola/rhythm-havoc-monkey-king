import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import { advanceLevelFlow, createLevelFlowState } from "../../src/game/level/LevelFlow";

describe("LevelFlow", () => {
  it("moves from opening to the first free-training phase after four confirms", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    state = advanceLevelFlow(level, state, { type: "confirm" });
    state = advanceLevelFlow(level, state, { type: "confirm" });
    state = advanceLevelFlow(level, state, { type: "confirm" });

    expect(state.currentPhaseId).toBe("opening");

    state = advanceLevelFlow(level, state, { type: "confirm" });

    expect(state.currentPhaseId).toBe("attention_free");
  });

  it("requires nine A inputs to finish the attention free-training phase", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 4; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }

    state = advanceLevelFlow(level, state, { type: "free-input", inputType: "B" });

    for (let index = 0; index < 8; index += 1) {
      state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });
    }

    expect(state.currentPhaseId).toBe("attention_free");

    state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });

    expect(state.currentPhaseId).toBe("attention_rhythm");
  });

  it("counts GOOD-or-better practice loops and advances after three cumulative passes", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 4; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }
    for (let index = 0; index < 9; index += 1) {
      state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });
    }

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["GOOD", "GREAT"]
    });
    expect(state.currentPhaseId).toBe("attention_rhythm");

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["MISS", "GOOD"]
    });
    expect(state.currentPhaseId).toBe("attention_rhythm");

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["PERFECT", "GOOD"]
    });
    expect(state.currentPhaseId).toBe("attention_rhythm");

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["GOOD", "GOOD"]
    });

    expect(state.currentPhaseId).toBe("salute_free");
  });
});
