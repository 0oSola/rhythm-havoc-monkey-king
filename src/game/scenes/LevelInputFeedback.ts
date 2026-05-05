import type { InputType } from "../rhythm/RhythmTypes";

export type ResolvedInputFeedback =
  | {
      kind: "wrong-input";
      inputType: InputType;
    }
  | {
      kind: "miss-no-input";
    };

export function failedSfxKeyForResolvedInput(feedback: ResolvedInputFeedback): string | null {
  if (feedback.kind === "wrong-input") {
    return "PLAYER-failed.wav";
  }

  return null;
}
