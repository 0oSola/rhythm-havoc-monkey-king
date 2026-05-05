import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import { createExamTimeline } from "../../src/game/level/LevelExamTimeline";

describe("LevelExamTimeline", () => {
  it("flattens the 34-bar exam into NPC and PLAYER event streams with the updated mid-section roles", () => {
    const level = parseLevelDefinition(gateLevelData);
    const timeline = createExamTimeline(level);

    expect(timeline.npcEvents).toHaveLength(38);
    expect(timeline.playerEvents).toHaveLength(38);

    expect(timeline.playerEvents[0]).toMatchObject({
      bar: 4,
      timeMs: 7200,
      actionId: "ATTENTION",
      inputType: "A"
    });

    expect(timeline.npcEvents.find((event) => event.bar === 20)).toBeUndefined();
    expect(
      timeline.playerEvents.filter((event) => event.bar === 20).map((event) => event.timeMs)
    ).toEqual([45600, 46800]);

    expect(
      timeline.npcEvents.filter((event) => event.bar === 21).map((event) => event.timeMs)
    ).toEqual([48000, 48900, 49800]);

    expect(timeline.playerEvents.at(-1)).toMatchObject({
      bar: 34,
      timeMs: 80400,
      actionId: "ATTENTION",
      inputType: "A"
    });
  });

  it("ignores NONE bars when expanding the exam phase", () => {
    const level = parseLevelDefinition(gateLevelData);
    const timeline = createExamTimeline(level);

    const noneBarEvents = [...timeline.npcEvents, ...timeline.playerEvents].filter(
      (event) => event.bar === 1 || event.bar === 2 || event.bar === 25 || event.bar === 26
    );

    expect(noneBarEvents).toEqual([]);
  });
});
