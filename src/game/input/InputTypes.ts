import type { InputType } from "../rhythm/RhythmTypes";

export type RawInputKey = "A" | "S";

export interface RawInput {
  key: RawInputKey;
  timeMs: number;
}

export interface NormalizedInput {
  type: InputType;
  timeMs: number;
}
