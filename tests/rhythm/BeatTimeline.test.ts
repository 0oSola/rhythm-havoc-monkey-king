import { describe, expect, it } from "vitest";
import { beatToMs, createBeatTimeline } from "../../src/game/rhythm/BeatTimeline";

describe("BeatTimeline", () => {
  it("maps 120 bpm beats to 500 ms intervals", () => {
    expect(beatToMs(1, 120)).toBe(0);
    expect(beatToMs(2, 120)).toBe(500);
    expect(beatToMs(4, 120)).toBe(1500);
  });

  it("creates demo and player notes from call-response units", () => {
    const notes = createBeatTimeline({
      bpm: 120,
      beatsPerBar: 4,
      units: [
        {
          demo: ["A", null, "AB", null],
          player: [null, "A", null, "AB"]
        }
      ]
    });

    expect(notes).toEqual([
      { phase: "demo", beat: 1, timeMs: 0, expectedType: "A" },
      { phase: "demo", beat: 3, timeMs: 1000, expectedType: "AB" },
      { phase: "player", beat: 6, timeMs: 2500, expectedType: "A" },
      { phase: "player", beat: 8, timeMs: 3500, expectedType: "AB" }
    ]);
  });
});
