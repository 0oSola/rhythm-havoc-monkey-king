import { describe, expect, it } from "vitest";
import { BEAT_HUD_LAYOUT } from "../../src/game/ui/BeatHUDLayout";

describe("BeatHUDLayout", () => {
  it("keeps the title in the top-left safe area and the score in the top-right safe area", () => {
    expect(BEAT_HUD_LAYOUT.title.x).toBeGreaterThanOrEqual(0);
    expect(BEAT_HUD_LAYOUT.title.y).toBeGreaterThanOrEqual(0);
    expect(BEAT_HUD_LAYOUT.score.x).toBeGreaterThan(BEAT_HUD_LAYOUT.feedback.x);
  });

  it("keeps the bottom prompt high enough above the actor feet zone", () => {
    expect(BEAT_HUD_LAYOUT.prompt.y).toBeLessThan(500);
    expect(BEAT_HUD_LAYOUT.prompt.width).toBeLessThanOrEqual(400);
  });

  it("keeps the feedback banner centered between the title and score blocks", () => {
    expect(BEAT_HUD_LAYOUT.feedback.x).toBe(480);
    expect(BEAT_HUD_LAYOUT.feedback.y).toBe(BEAT_HUD_LAYOUT.title.y);
  });
});
