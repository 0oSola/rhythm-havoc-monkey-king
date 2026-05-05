import { describe, expect, it, vi } from "vitest";
import {
  attachMenuStartAffordance,
  MENU_START_PROMPT_TEXT
} from "../../src/game/scenes/MenuSceneAffordance";
import {
  MENU_BACKGROUND_KEY,
  START_BUTTON_BOUNDS
} from "../../src/game/scenes/MenuSceneConfig";

describe("MenuSceneAffordance", () => {
  it("does not create a synthetic button overlay", () => {
    const promptText = {
      setOrigin: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis()
    };
    const scene = {
      add: {
        image: vi.fn(),
        text: vi.fn(() => promptText)
      },
      tweens: {
        add: vi.fn()
      }
    };

    attachMenuStartAffordance(scene as never, MENU_BACKGROUND_KEY);

    expect(scene.add.image).not.toHaveBeenCalled();
    expect(scene.tweens.add).not.toHaveBeenCalled();
  });

  it("adds the start prompt below the button hotspot", () => {
    const promptText = {
      setOrigin: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis()
    };
    const scene = {
      add: {
        image: vi.fn(),
        text: vi.fn(() => promptText)
      },
      tweens: {
        add: vi.fn()
      }
    };

    attachMenuStartAffordance(scene as never, MENU_BACKGROUND_KEY);

    expect(scene.add.text).toHaveBeenCalledWith(
      START_BUTTON_BOUNDS.x + START_BUTTON_BOUNDS.width / 2,
      START_BUTTON_BOUNDS.y + START_BUTTON_BOUNDS.height - 14,
      MENU_START_PROMPT_TEXT,
      expect.objectContaining({
        color: "#8e8e8e",
        fontSize: "14px"
      })
    );
  });
});
