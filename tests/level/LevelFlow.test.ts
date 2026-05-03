import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import { advanceLevelFlow, createLevelFlowState } from "../../src/game/level/LevelFlow";

describe("LevelFlow", () => {
  it("moves through the eight opening presentation steps before the first free-training phase", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    expect(state).toMatchObject({
      phaseType: "opening",
      currentPhaseId: "opening",
      stepIndex: 0
    });

    for (let index = 0; index < 7; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
      expect(state.phaseType).toBe("opening");
      expect(state.currentPhaseId).toBe("opening");
    }

    expect(state.phaseType === "opening" ? state.stepIndex : -1).toBe(7);

    state = advanceLevelFlow(level, state, { type: "confirm" });

    expect(state.currentPhaseId).toBe("attention_free");
  });

  it("requires one A press plus three more A presses to finish the attention free-training phase", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 8; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }

    state = advanceLevelFlow(level, state, { type: "free-input", inputType: "B" });

    for (let index = 0; index < 3; index += 1) {
      state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });
    }

    expect(state.currentPhaseId).toBe("attention_free");

    state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });

    expect(state.currentPhaseId).toBe("attention_rhythm");
    expect(state).toMatchObject({
      phaseType: "practice",
      stage: "warmup"
    });
  });

  it("moves practice from warmup to loop only after the ready bar completes", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 8; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }
    for (let index = 0; index < 4; index += 1) {
      state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });
    }

    expect(state).toMatchObject({
      phaseType: "practice",
      currentPhaseId: "attention_rhythm",
      stage: "warmup"
    });

    state = advanceLevelFlow(level, state, { type: "practice-warmup-completed" });

    expect(state).toMatchObject({
      phaseType: "practice",
      currentPhaseId: "attention_rhythm",
      stage: "loop"
    });
  });

  it("counts practice loops as passes when all target hits are GOOD or better, and advances after three cumulative passes", () => {
    const level = parseLevelDefinition(gateLevelData);
    let state = createLevelFlowState(level);

    for (let index = 0; index < 8; index += 1) {
      state = advanceLevelFlow(level, state, { type: "confirm" });
    }
    for (let index = 0; index < 4; index += 1) {
      state = advanceLevelFlow(level, state, { type: "free-input", inputType: "A" });
    }
    state = advanceLevelFlow(level, state, { type: "practice-warmup-completed" });

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["PERFECT", "GREAT"]
    });
    expect(state.currentPhaseId).toBe("attention_rhythm");
    expect(state.phaseType === "practice" ? state.passCount : -1).toBe(1);

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["MISS", "PERFECT"]
    });
    expect(state.currentPhaseId).toBe("attention_rhythm");
    expect(state.phaseType === "practice" ? state.passCount : -1).toBe(1);

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["GOOD", "PERFECT"]
    });
    expect(state.currentPhaseId).toBe("attention_rhythm");
    expect(state.phaseType === "practice" ? state.passCount : -1).toBe(2);

    state = advanceLevelFlow(level, state, {
      type: "practice-loop-completed",
      judgements: ["GREAT", "GOOD"]
    });

    expect(state.currentPhaseId).toBe("salute_free");
  });
});
