import type { LevelFlowState } from "../level/LevelFlow";
import type { LevelDefinition } from "../level/LevelTypes";

type PointerLevelFlowEvent =
  | { type: "confirm" }
  | {
      type: "free-input";
      inputType: "A";
    };

export function pointerEventForState(
  level: LevelDefinition,
  state: LevelFlowState
): PointerLevelFlowEvent | null {
  if (state.phaseType === "opening") {
    return { type: "confirm" };
  }

  if (state.phaseType !== "free") {
    return null;
  }

  const phase = level.phases.find((entry) => entry.id === state.currentPhaseId);
  if (!phase || phase.type !== "free") {
    return null;
  }

  const action = level.actions[phase.actionId];
  if (!action || action.inputType !== "A") {
    return null;
  }

  return {
    type: "free-input",
    inputType: "A"
  };
}
