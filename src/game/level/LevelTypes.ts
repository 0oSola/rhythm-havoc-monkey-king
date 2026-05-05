import type { ScoreSummary } from "../feedback/ScoreSystem";
import type { InputType, JudgementResult } from "../rhythm/RhythmTypes";

export type LevelType = "teaching";
export type LevelActor = "guard" | "wukong";
export type LevelActionId = string;
export type LevelPhaseType = "opening" | "free" | "practice" | "exam";
export type ExamBarRole = "NONE" | "NPC" | "PLAYER";
export type OpeningStepKind =
  | "story-caption"
  | "title-card"
  | "establishing-shot"
  | "wukong-run-in"
  | "guard-reveal"
  | "dialogue";
export type PracticeStage = "warmup" | "loop";

export interface LevelAudioDefinition {
  practiceKey: string;
  examKey: string;
}

export interface LevelActionDefinition {
  name: string;
  inputType: InputType;
  animationKey: string;
  playerSfxKey?: string;
  npcSfxKey?: string;
}

export interface DialogueLine {
  speaker: LevelActor;
  text: string;
}

export interface OpeningStepDefinition {
  kind: OpeningStepKind;
  speaker?: LevelActor;
  text?: string;
  autoAdvanceAfterMs?: number;
  requireConfirm?: boolean;
}

export interface OpeningPhaseDefinition {
  id: string;
  type: "opening";
  backgroundKey: string;
  steps: readonly OpeningStepDefinition[];
  nextPhaseId: string;
}

export interface FreeTrainingMilestone {
  count: number;
  text: string;
}

export interface FreeTrainingPhaseDefinition {
  id: string;
  type: "free";
  backgroundKey: string;
  prompt: string;
  actionId: LevelActionId;
  requiredCount: number;
  milestones: readonly FreeTrainingMilestone[];
  nextPhaseId: string;
}

export interface PracticeEventDefinition {
  timeMs: number;
  bar: number;
  beat: number;
  actionId: LevelActionId;
}

export interface PracticePhaseDefinition {
  id: string;
  type: "practice";
  backgroundKey: string;
  promptTemplate: string;
  warmupAudioKey: string;
  warmupDurationMs: number;
  audioKey: string;
  bpm: number;
  timeSignature: readonly [number, number];
  beatMs: number;
  barMs: number;
  loopBars: number;
  loopDurationMs: number;
  requiredPassCount: number;
  passThreshold: Exclude<JudgementResult, "MISS">;
  npcEvents: readonly PracticeEventDefinition[];
  playerEvents: readonly PracticeEventDefinition[];
  nextPhaseId: string;
}

export interface ExamBarEventDefinition {
  beat: number;
  timeMs: number;
  actionId: LevelActionId;
}

export interface ExamBarDefinition {
  bar: number;
  role: ExamBarRole;
  startTimeMs: number;
  endTimeMs: number;
  events: readonly ExamBarEventDefinition[];
}

export interface ExamPhaseDefinition {
  id: string;
  type: "exam";
  backgroundKey: string;
  audioKey: string;
  bpm: number;
  timeSignature: readonly [number, number];
  beatMs: number;
  barMs: number;
  totalBars: number;
  bars: readonly ExamBarDefinition[];
}

export type LevelPhaseDefinition =
  | OpeningPhaseDefinition
  | FreeTrainingPhaseDefinition
  | PracticePhaseDefinition
  | ExamPhaseDefinition;

export interface LevelDefinition {
  levelId: string;
  name: string;
  bpm: number;
  type: LevelType;
  audio: LevelAudioDefinition;
  actions: Readonly<Record<LevelActionId, LevelActionDefinition>>;
  phases: readonly LevelPhaseDefinition[];
  resultTexts: Readonly<Record<ScoreSummary["rating"], string>>;
}
