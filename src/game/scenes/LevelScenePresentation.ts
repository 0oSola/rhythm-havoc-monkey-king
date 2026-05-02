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

    return phase.dialogues[state.dialogueIndex]?.speaker ?? null;
  }

  if (state.phaseType === "free" || state.phaseType === "practice" || state.phaseType === "exam") {
    return "guard";
  }

  return null;
}

export function phaseAudioKeyForState(level: LevelDefinition, state: LevelFlowState): string | null {
  if (state.phaseType === "opening" || state.phaseType === "free") {
    return "level1_speak_bgm";
  }

  if (state.phaseType === "practice" || state.phaseType === "exam") {
    const phase = level.phases.find((entry) => entry.id === state.currentPhaseId);
    return phase && "audioKey" in phase ? phase.audioKey : null;
  }

  return null;
}
