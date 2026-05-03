import type { LevelFlowState } from "../level/LevelFlow";

export function shouldRestartPracticeLoopAudio(
  currentState: LevelFlowState,
  nextState: LevelFlowState
): boolean {
  return (
    currentState.phaseType === "practice" &&
    currentState.stage === "loop" &&
    nextState.phaseType === "practice" &&
    nextState.stage === "loop" &&
    currentState.currentPhaseId === nextState.currentPhaseId
  );
}

export function didPracticePassIncrement(
  currentState: LevelFlowState,
  nextState: LevelFlowState
): boolean {
  return (
    currentState.phaseType === "practice" &&
    nextState.phaseType === "practice" &&
    currentState.currentPhaseId === nextState.currentPhaseId &&
    nextState.passCount > currentState.passCount
  );
}
