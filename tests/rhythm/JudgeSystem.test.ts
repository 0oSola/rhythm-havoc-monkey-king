import { describe, expect, it } from "vitest";
import { judgeInput } from "../../src/game/rhythm/JudgeSystem";

describe("JudgeSystem", () => {
  it("returns perfect inside the 80 ms window", () => {
    expect(
      judgeInput({
        inputTimeMs: 1080,
        targetTimeMs: 1000,
        inputType: "A",
        expectedType: "A"
      })
    ).toEqual({ result: "PERFECT", deltaMs: 80, score: 100 });
  });

  it("falls through great and good windows by delta", () => {
    expect(
      judgeInput({
        inputTimeMs: 1150,
        targetTimeMs: 1000,
        inputType: "A",
        expectedType: "A"
      }).result
    ).toBe("GREAT");

    expect(
      judgeInput({
        inputTimeMs: 1220,
        targetTimeMs: 1000,
        inputType: "A",
        expectedType: "A"
      }).result
    ).toBe("GOOD");
  });

  it("returns miss outside the timing window or for input mismatch", () => {
    expect(
      judgeInput({
        inputTimeMs: 1221,
        targetTimeMs: 1000,
        inputType: "A",
        expectedType: "A"
      }).result
    ).toBe("MISS");

    expect(
      judgeInput({
        inputTimeMs: 1000,
        targetTimeMs: 1000,
        inputType: "B",
        expectedType: "A"
      })
    ).toEqual({ result: "MISS", deltaMs: 0, score: 0 });
  });
});
