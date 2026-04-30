import type { JudgementResult } from "../rhythm/RhythmTypes";

export interface FeedbackView {
  label: string;
  color: string;
}

export function feedbackForResult(result: JudgementResult): FeedbackView {
  switch (result) {
    case "PERFECT":
      return { label: "PERFECT", color: "#ffd166" };
    case "GREAT":
      return { label: "GREAT", color: "#7bdff2" };
    case "GOOD":
      return { label: "GOOD", color: "#caffbf" };
    case "MISS":
      return { label: "MISS", color: "#ff6b6b" };
  }
}
