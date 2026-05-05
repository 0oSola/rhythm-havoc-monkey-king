export type InputType = "A" | "B" | "AB" | "Hold" | "Mash";

export type JudgementResult = "PERFECT" | "GREAT" | "GOOD" | "MISS";

export type TimelinePhase = "demo" | "player";

export type TimelineCell = InputType | null;

export type TimelineActor = "guard" | "wukong";

export interface TimelineCue {
  actor: TimelineActor;
  prompt: string;
  hitFrame: number;
  sfxKey: string;
}

export type TimelineCueCell = TimelineCue | null;

export interface TimelineUnit {
  demo: readonly TimelineCell[];
  player: readonly TimelineCell[];
  demoCues?: readonly TimelineCueCell[];
  playerCues?: readonly TimelineCueCell[];
}

export interface TimelineConfig {
  bpm: number;
  beatsPerBar: number;
  units: readonly TimelineUnit[];
}

export interface TimelineNote {
  phase: TimelinePhase;
  beat: number;
  timeMs: number;
  expectedType: InputType;
}

export interface JudgeInput {
  inputTimeMs: number;
  targetTimeMs: number;
  inputType: InputType;
  expectedType: InputType;
}

export interface JudgeOutput {
  result: JudgementResult;
  deltaMs: number;
  score: number;
}
