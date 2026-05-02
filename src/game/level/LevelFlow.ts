import type { InputType, JudgementResult } from "../rhythm/RhythmTypes";
import type {
  FreeTrainingPhaseDefinition,
  LevelDefinition,
  LevelPhaseDefinition,
  OpeningPhaseDefinition,
  PracticePhaseDefinition
} from "./LevelTypes";

export type LevelFlowEvent =
  | { type: "confirm" }
  | { type: "free-input"; inputType: InputType }
  | { type: "practice-loop-completed"; judgements: readonly JudgementResult[] }
  | { type: "exam-completed" };

export type LevelFlowState =
  | {
      phaseType: "opening";
      currentPhaseId: string;
      dialogueIndex: number;
    }
  | {
      phaseType: "free";
      currentPhaseId: string;
      progressCount: number;
    }
  | {
      phaseType: "practice";
      currentPhaseId: string;
      passCount: number;
      attempts: number;
    }
  | {
      phaseType: "exam";
      currentPhaseId: string;
    }
  | {
      phaseType: "result";
      currentPhaseId: "result";
    };

export function createLevelFlowState(level: LevelDefinition): LevelFlowState {
  const firstPhase = level.phases[0];
  return stateForPhase(firstPhase);
}

export function advanceLevelFlow(
  level: LevelDefinition,
  state: LevelFlowState,
  event: LevelFlowEvent
): LevelFlowState {
  const phase = phaseById(level, state.currentPhaseId);

  switch (phase.type) {
    case "opening":
      return advanceOpeningFlow(level, phase, state, event);
    case "free":
      return advanceFreeFlow(level, phase, state, event);
    case "practice":
      return advancePracticeFlow(level, phase, state, event);
    case "exam":
      return advanceExamFlow(state, event);
  }
}

function advanceOpeningFlow(
  level: LevelDefinition,
  phase: OpeningPhaseDefinition,
  state: LevelFlowState,
  event: LevelFlowEvent
): LevelFlowState {
  if (state.phaseType !== "opening" || event.type !== "confirm") {
    return state;
  }

  const nextDialogueIndex = state.dialogueIndex + 1;

  if (nextDialogueIndex >= phase.dialogues.length) {
    return stateForPhase(phaseById(level, phase.nextPhaseId));
  }

  return {
    phaseType: "opening",
    currentPhaseId: phase.id,
    dialogueIndex: nextDialogueIndex
  };
}

function advanceFreeFlow(
  level: LevelDefinition,
  phase: FreeTrainingPhaseDefinition,
  state: LevelFlowState,
  event: LevelFlowEvent
): LevelFlowState {
  if (state.phaseType !== "free" || event.type !== "free-input") {
    return state;
  }

  const action = level.actions[phase.actionId];

  if (!action || action.inputType !== event.inputType) {
    return state;
  }

  const nextCount = state.progressCount + 1;

  if (nextCount >= phase.requiredCount) {
    return stateForPhase(phaseById(level, phase.nextPhaseId));
  }

  return {
    phaseType: "free",
    currentPhaseId: phase.id,
    progressCount: nextCount
  };
}

function advancePracticeFlow(
  level: LevelDefinition,
  phase: PracticePhaseDefinition,
  state: LevelFlowState,
  event: LevelFlowEvent
): LevelFlowState {
  if (state.phaseType !== "practice" || event.type !== "practice-loop-completed") {
    return state;
  }

  const loopPassed =
    event.judgements.length === phase.playerEvents.length &&
    event.judgements.every((judgement) => meetsThreshold(judgement, phase.passThreshold));
  const passCount = loopPassed ? state.passCount + 1 : state.passCount;

  if (passCount >= phase.requiredPassCount) {
    return stateForPhase(phaseById(level, phase.nextPhaseId));
  }

  return {
    phaseType: "practice",
    currentPhaseId: phase.id,
    passCount,
    attempts: state.attempts + 1
  };
}

function advanceExamFlow(state: LevelFlowState, event: LevelFlowEvent): LevelFlowState {
  if (state.phaseType !== "exam" || event.type !== "exam-completed") {
    return state;
  }

  return {
    phaseType: "result",
    currentPhaseId: "result"
  };
}

function meetsThreshold(judgement: JudgementResult, threshold: Exclude<JudgementResult, "MISS">): boolean {
  const ranks: Record<JudgementResult, number> = {
    PERFECT: 3,
    GREAT: 2,
    GOOD: 1,
    MISS: 0
  };

  return ranks[judgement] >= ranks[threshold];
}

function phaseById(level: LevelDefinition, phaseId: string): LevelPhaseDefinition {
  const phase = level.phases.find((entry) => entry.id === phaseId);

  if (!phase) {
    throw new Error(`Unknown phase id: ${phaseId}`);
  }

  return phase;
}

function stateForPhase(phase: LevelPhaseDefinition): LevelFlowState {
  switch (phase.type) {
    case "opening":
      return {
        phaseType: "opening",
        currentPhaseId: phase.id,
        dialogueIndex: 0
      };
    case "free":
      return {
        phaseType: "free",
        currentPhaseId: phase.id,
        progressCount: 0
      };
    case "practice":
      return {
        phaseType: "practice",
        currentPhaseId: phase.id,
        passCount: 0,
        attempts: 0
      };
    case "exam":
      return {
        phaseType: "exam",
        currentPhaseId: phase.id
      };
  }
}
