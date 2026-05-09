import type { LevelFlowState } from "../level/LevelFlow";
import type {
  FreeTrainingPhaseDefinition,
  LevelActor,
  LevelDefinition,
  PracticePhaseDefinition
} from "../level/LevelTypes";
import type { InputType } from "../rhythm/RhythmTypes";

export function phaseBackgroundKeyForState(level: LevelDefinition, state: LevelFlowState): string {
  const phase = level.phases.find((entry) => entry.id === state.currentPhaseId);
  return phase && "backgroundKey" in phase ? phase.backgroundKey : "level1-opening-bg";
}

export function bubbleActorForState(level: LevelDefinition, state: LevelFlowState): LevelActor | null {
  if (state.phaseType === "opening") {
    const phase = level.phases.find((entry) => entry.id === state.currentPhaseId);
    if (!phase || phase.type !== "opening") {
      return null;
    }

    const step = phase.steps[state.stepIndex];
    return step?.kind === "dialogue" ? step.speaker ?? null : null;
  }

  if (state.phaseType === "free" || state.phaseType === "practice" || state.phaseType === "exam") {
    return "guard";
  }

  return null;
}

export function phaseAudioKeyForState(level: LevelDefinition, state: LevelFlowState): string | null {
  if (state.phaseType === "opening" || state.phaseType === "free") {
    return "level1_dialogue_bgm";
  }

  if (state.phaseType === "practice") {
    const phase = level.phases.find((entry) => entry.id === state.currentPhaseId);
    if (!phase || phase.type !== "practice") {
      return null;
    }

    return state.stage === "warmup" ? phase.warmupAudioKey : phase.audioKey;
  }

  if (state.phaseType === "exam") {
    const phase = level.phases.find((entry) => entry.id === state.currentPhaseId);
    return phase && "audioKey" in phase ? phase.audioKey : null;
  }

  return null;
}

export function freeHudPromptForPhase(
  level: LevelDefinition,
  phase: FreeTrainingPhaseDefinition
): string {
  return phase.hudPrompt ?? `${phase.prompt} (${inputLabelForType(level.actions[phase.actionId].inputType)})`;
}

export function practiceHudPromptForPhase(
  phase: PracticePhaseDefinition,
  passCount: number
): string {
  const remaining = phase.requiredPassCount - passCount;
  return (phase.hudPromptTemplate ?? phase.promptTemplate).replace("{n}", String(remaining));
}

export function practiceBubblePromptForPhase(
  phase: PracticePhaseDefinition,
  passCount: number
): string {
  const remaining = phase.requiredPassCount - passCount;
  return phase.promptTemplate.replace("{n}", String(remaining));
}

function inputLabelForType(inputType: InputType): string {
  switch (inputType) {
    case "AB":
      return "A+S";
    default:
      return inputType;
  }
}
