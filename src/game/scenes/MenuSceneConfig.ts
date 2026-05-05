export const MENU_CANVAS_WIDTH = 960;
export const MENU_CANVAS_HEIGHT = 540;
export const MENU_BACKGROUND_KEY = "menu-start-bg";

export const START_BUTTON_BOUNDS = {
  x: 278,
  y: 225,
  width: 404,
  height: 115
} as const;

export function isPointInsideStartButton(x: number, y: number): boolean {
  return (
    x >= START_BUTTON_BOUNDS.x &&
    x <= START_BUTTON_BOUNDS.x + START_BUTTON_BOUNDS.width &&
    y >= START_BUTTON_BOUNDS.y &&
    y <= START_BUTTON_BOUNDS.y + START_BUTTON_BOUNDS.height
  );
}
