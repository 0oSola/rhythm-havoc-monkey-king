import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";

describe("gate_01", () => {
  it("contains the three teaching units from the first level breakdown", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(level.units).toHaveLength(3);
    expect(level.units[2]).toMatchObject({
      demo: ["A", "AB", "A", null],
      player: ["A", "AB", null, "A"]
    });
  });

  it("only teaches A and AB inputs", () => {
    const level = parseLevelDefinition(gateLevelData);
    const cells = level.units.flatMap((unit) => [...unit.demo, ...unit.player]);

    expect(cells).not.toContain("Hold");
    expect(cells).not.toContain("Mash");
  });
});
