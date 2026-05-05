import { SCORE_BY_RESULT } from "../../shared/constants";
import type { JudgementResult } from "../rhythm/RhythmTypes";

export interface ScoreSummary {
  score: number;
  maxScore: number;
  accuracy: number;
  rating: "天尊" | "真仙" | "道童" | "凡夫";
}

export function createScoreSummary(results: readonly JudgementResult[]): ScoreSummary {
  const score = results.reduce((total, result) => total + SCORE_BY_RESULT[result], 0);
  const maxScore = results.length * SCORE_BY_RESULT.PERFECT;
  const accuracy = maxScore === 0 ? 0 : score / maxScore;

  return {
    score,
    maxScore,
    accuracy,
    rating: ratingFromAccuracy(accuracy)
  };
}

function ratingFromAccuracy(accuracy: number): ScoreSummary["rating"] {
  if (accuracy >= 0.95) {
    return "天尊";
  }

  if (accuracy >= 0.8) {
    return "真仙";
  }

  if (accuracy >= 0.6) {
    return "道童";
  }

  return "凡夫";
}
