import { describe, expect, it } from "vitest";
import { normalizeRawInputs } from "../../src/game/input/InputSystem";

describe("InputSystem", () => {
  it("combines A and B within 50 ms into an AB input", () => {
    expect(
      normalizeRawInputs([
        { key: "A", timeMs: 1000 },
        { key: "B", timeMs: 1049 }
      ])
    ).toEqual([{ type: "AB", timeMs: 1025 }]);
  });

  it("keeps A and B separate when they exceed the chord window", () => {
    expect(
      normalizeRawInputs([
        { key: "A", timeMs: 1000 },
        { key: "B", timeMs: 1051 }
      ])
    ).toEqual([
      { type: "A", timeMs: 1000 },
      { type: "B", timeMs: 1051 }
    ]);
  });
});
