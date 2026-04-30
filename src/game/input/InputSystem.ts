import { AB_CHORD_WINDOW_MS } from "../../shared/constants";
import type { NormalizedInput, RawInput } from "./InputTypes";

export function normalizeRawInputs(
  rawInputs: readonly RawInput[],
  chordWindowMs = AB_CHORD_WINDOW_MS
): NormalizedInput[] {
  const sorted = [...rawInputs].sort((left, right) => left.timeMs - right.timeMs);
  const consumed = new Set<number>();
  const normalized: NormalizedInput[] = [];

  sorted.forEach((input, index) => {
    if (consumed.has(index)) {
      return;
    }

    const chordIndex = sorted.findIndex((candidate, candidateIndex) => {
      if (candidateIndex <= index || consumed.has(candidateIndex)) {
        return false;
      }

      return candidate.key !== input.key && candidate.timeMs - input.timeMs <= chordWindowMs;
    });

    if (chordIndex >= 0) {
      const chord = sorted[chordIndex];
      consumed.add(index);
      consumed.add(chordIndex);
      normalized.push({
        type: "AB",
        timeMs: Math.round((input.timeMs + chord.timeMs) / 2)
      });
      return;
    }

    consumed.add(index);
    normalized.push({
      type: input.key,
      timeMs: input.timeMs
    });
  });

  return normalized;
}
