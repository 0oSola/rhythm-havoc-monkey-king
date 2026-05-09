import type { ScoreSummary } from "../feedback/ScoreSystem";
import fanfuCgUrl from "../../assets/results/level1/result_cg_fanfu.png";
import daotongCgUrl from "../../assets/results/level1/result_cg_daotong.png";
import tianzunCgUrl from "../../assets/results/level1/result_cg_tianzun.png";
import zhenxianCgUrl from "../../assets/results/level1/result_cg_zhenxian.png";

export interface ResultCgEntry {
  key: string;
  fileName: string;
  url: string;
}

export const RESULT_CG_ENTRIES: Readonly<Record<ScoreSummary["rating"], ResultCgEntry>> = {
  天尊: {
    key: "level1-result-cg-tianzun",
    fileName: "result_cg_tianzun.png",
    url: tianzunCgUrl
  },
  真仙: {
    key: "level1-result-cg-zhenxian",
    fileName: "result_cg_zhenxian.png",
    url: zhenxianCgUrl
  },
  道童: {
    key: "level1-result-cg-daotong",
    fileName: "result_cg_daotong.png",
    url: daotongCgUrl
  },
  凡夫: {
    key: "level1-result-cg-fanfu",
    fileName: "result_cg_fanfu.png",
    url: fanfuCgUrl
  }
};

export function resultCgKeyForRating(rating: ScoreSummary["rating"]): string {
  return RESULT_CG_ENTRIES[rating].key;
}
