import type { LevelFlowState } from "../level/LevelFlow";
import type {
  ExamPhaseDefinition,
  LevelDefinition,
  OpeningPhaseDefinition,
  PracticePhaseDefinition
} from "../level/LevelTypes";
import type { JudgementResult } from "../rhythm/RhythmTypes";

export interface CueWindow {
  triggerTimeMs: number;
  sustainUntilMs: number;
}

export interface ExamCueWindow {
  npcBar: number;
  playerBar: number;
  handoffTimeMs: number;
  playerBarStartTimeMs: number;
  playerBarEndTimeMs: number;
  praiseTimeMs: number;
}

export function dialogueConfirmSfxKeyForState(
  level: LevelDefinition,
  state: LevelFlowState
): string | null {
  if (state.phaseType !== "opening") {
    return null;
  }

  const phase = level.phases.find(
    (entry): entry is OpeningPhaseDefinition => entry.id === state.currentPhaseId && entry.type === "opening"
  );
  const step = phase?.steps[state.stepIndex];

  if (!step || step.kind !== "dialogue") {
    return null;
  }

  return state.stepIndex >= phase.steps.length - 1
    ? "level1_dialogue_confirm_final_sfx"
    : "level1_dialogue_confirm_sfx";
}

export function practiceHandoffCueWindow(
  phase: PracticePhaseDefinition,
  loopIndex: number
): CueWindow {
  const loopStartMs = loopIndex * phase.loopDurationMs;

  return {
    triggerTimeMs: loopStartMs + phase.barMs - phase.beatMs / 2,
    sustainUntilMs: loopStartMs + phase.loopDurationMs
  };
}

export function practicePraiseCueTimeMs(
  phase: PracticePhaseDefinition,
  loopIndex: number
): number {
  const loopStartMs = loopIndex * phase.loopDurationMs;
  return loopStartMs + phase.loopDurationMs - phase.beatMs / 2;
}

export function isFullHitBar(judgements: readonly JudgementResult[]): boolean {
  return judgements.length > 0 && judgements.every((judgement) => judgement !== "MISS");
}

export function createExamCueWindows(exam: ExamPhaseDefinition): ExamCueWindow[] {
  const windows: ExamCueWindow[] = [];

  for (let index = 0; index < exam.bars.length - 1; index += 1) {
    const currentBar = exam.bars[index];
    const nextBar = exam.bars[index + 1];

    if (currentBar.role !== "NPC" || nextBar.role !== "PLAYER") {
      continue;
    }

    windows.push({
      npcBar: currentBar.bar,
      playerBar: nextBar.bar,
      handoffTimeMs: currentBar.startTimeMs + exam.barMs - exam.beatMs / 2,
      playerBarStartTimeMs: nextBar.startTimeMs,
      playerBarEndTimeMs: nextBar.endTimeMs,
      praiseTimeMs: nextBar.startTimeMs + exam.barMs - exam.beatMs / 2
    });
  }

  return windows;
}
