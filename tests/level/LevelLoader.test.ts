import { describe, expect, it } from "vitest";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";

describe("LevelLoader", () => {
  it("parses a valid call-response level", () => {
    const level = parseLevelDefinition({
      levelId: "gate_01",
      name: "南天门 · 混进天庭",
      bpm: 120,
      audioKey: "gate_01_bgm",
      type: "call_response",
      introText: ["新来的？先学礼仪！", "俺也去？"],
      actions: {
        A: "stand",
        AB: "salute"
      },
      units: [
        {
          demo: ["A", null, "AB", null],
          player: [null, "A", null, "AB"]
        }
      ]
    });

    expect(level.levelId).toBe("gate_01");
    expect(level.units).toHaveLength(1);
    expect(level.actions.A).toBe("stand");
  });

  it("rejects levels without playable units", () => {
    expect(() =>
      parseLevelDefinition({
        levelId: "gate_01",
        name: "南天门 · 混进天庭",
        bpm: 120,
        audioKey: "gate_01_bgm",
        type: "call_response",
        introText: [],
        actions: { A: "stand" },
        units: []
      })
    ).toThrow("Level must include at least one unit");
  });

  it("preserves optional cue metadata for animation and prompts", () => {
    const level = parseLevelDefinition({
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
    });

    expect(level.units[0].demoCues?.[0]).toEqual({
      actor: "guard",
      prompt: "看守卫立正",
      hitFrame: 1,
      sfxKey: "gate_01_sfx_stand"
    });
    expect(level.units[0].playerCues?.[1]?.prompt).toBe("A 立正");
  });
});
