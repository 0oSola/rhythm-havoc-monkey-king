import { GOOD_WINDOW_MS, GREAT_WINDOW_MS, PERFECT_WINDOW_MS, SCORE_BY_RESULT } from "../../shared/constants";
import type { JudgeInput, JudgeOutput, JudgementResult } from "./RhythmTypes";

export function judgeInput(input: JudgeInput): JudgeOutput {
  const deltaMs = Math.abs(input.inputTimeMs - input.targetTimeMs);

  if (input.inputType !== input.expectedType) {
    return {
      result: "MISS",
      deltaMs,
      score: SCORE_BY_RESULT.MISS
    };
  }

  const result = resultFromDelta(deltaMs);

  return {
    result,
    deltaMs,
    score: SCORE_BY_RESULT[result]
  };
}

function resultFromDelta(deltaMs: number): JudgementResult {
  if (deltaMs <= PERFECT_WINDOW_MS) {
    return "PERFECT";
  }

  if (deltaMs <= GREAT_WINDOW_MS) {
    return "GREAT";
  }

  if (deltaMs <= GOOD_WINDOW_MS) {
    return "GOOD";
  }

  return "MISS";
}
