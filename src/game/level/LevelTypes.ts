import type { InputType, TimelineUnit } from "../rhythm/RhythmTypes";

export type LevelType = "call_response" | "loop" | "mechanic" | "reaction";

export type ActionMap = Partial<Record<InputType, string>>;

export interface LevelDefinition {
  levelId: string;
  name: string;
  bpm: number;
  audioKey: string;
  type: LevelType;
  introText: readonly string[];
  actions: ActionMap;
  units: readonly TimelineUnit[];
}
