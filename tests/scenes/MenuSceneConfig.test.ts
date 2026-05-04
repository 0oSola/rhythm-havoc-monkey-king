import { describe, expect, it } from "vitest";
import {
  MENU_BACKGROUND_KEY,
  MENU_CANVAS_HEIGHT,
  MENU_CANVAS_WIDTH,
  START_BUTTON_BOUNDS,
  isPointInsideStartButton
} from "../../src/game/scenes/MenuSceneConfig";

describe("MenuSceneConfig", () => {
  it("keeps the menu scene locked to the 960x540 reference composition", () => {
    expect(MENU_CANVAS_WIDTH).toBe(960);
    expect(MENU_CANVAS_HEIGHT).toBe(540);
    expect(MENU_BACKGROUND_KEY).toBe("menu-start-bg");
  });

  it("matches the start button hotspot to the center plaque in the reference", () => {
    expect(START_BUTTON_BOUNDS).toEqual({
      x: 278,
      y: 225,
      width: 404,
      height: 115
    });
  });

  it("only accepts clicks inside the start button hotspot", () => {
    expect(isPointInsideStartButton(480, 282)).toBe(true);
    expect(isPointInsideStartButton(300, 240)).toBe(true);
    expect(isPointInsideStartButton(220, 282)).toBe(false);
    expect(isPointInsideStartButton(480, 160)).toBe(false);
    expect(isPointInsideStartButton(760, 282)).toBe(false);
  });
});
