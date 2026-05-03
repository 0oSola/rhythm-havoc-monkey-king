import type { LevelFlowState } from "../level/LevelFlow";
import type { LevelActor, LevelDefinition } from "../level/LevelTypes";

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
