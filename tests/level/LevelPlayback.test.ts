import { describe, expect, it } from "vitest";
import { cueForTimelineNote } from "../../src/game/level/LevelPlayback";
import type { LevelDefinition } from "../../src/game/level/LevelTypes";

const level: LevelDefinition = {
  levelId: "gate_01",
  name: "南天门 · 混进天庭",
  bpm: 120,
  audioKey: "gate_01_bgm",
  type: "call_response",
  introText: [],
  actions: { A: "stand", AB: "salute" },
  units: [
    {
      demo: ["A", null, "AB", null],
      player: [null, "A", null, "AB"],
      demoCues: [
        { actor: "guard", prompt: "看守卫立正", hitFrame: 1, sfxKey: "gate_01_sfx_stand" },
        null,
        { actor: "guard", prompt: "看守卫敬礼", hitFrame: 1, sfxKey: "gate_01_sfx_salute" },
        null
      ],
      playerCues: [
        null,
        { actor: "wukong", prompt: "A 立正", hitFrame: 1, sfxKey: "gate_01_sfx_stand" },
        null,
        { actor: "wukong", prompt: "A+S 敬礼", hitFrame: 1, sfxKey: "gate_01_sfx_salute" }
      ]
    }
  ]
};

describe("LevelPlayback", () => {
  it("finds the cue for a demo timeline note", () => {
    expect(
      cueForTimelineNote(level, {
        phase: "demo",
        beat: 3,
        timeMs: 1000,
        expectedType: "AB"
      })
    ).toEqual({
      actor: "guard",
      prompt: "看守卫敬礼",
      hitFrame: 1,
      sfxKey: "gate_01_sfx_salute"
    });
  });

  it("finds the cue for a player timeline note", () => {
    expect(
      cueForTimelineNote(level, {
        phase: "player",
        beat: 6,
        timeMs: 2500,
        expectedType: "A"
      })?.prompt
    ).toBe("A 立正");
  });
});
