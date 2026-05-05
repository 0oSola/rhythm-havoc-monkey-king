import type { ScoreSummary } from "../feedback/ScoreSystem";
import type { LevelDefinition } from "./LevelTypes";

export interface LevelResultPayload {
  levelName: string;
  summary: ScoreSummary;
  quote: string;
}

export function createLevelResultPayload(
  level: LevelDefinition,
  summary: ScoreSummary
): LevelResultPayload {
  return {
    levelName: level.name,
    summary,
    quote: level.resultTexts[summary.rating]
  };
}
