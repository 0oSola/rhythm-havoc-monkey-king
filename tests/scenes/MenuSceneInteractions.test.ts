import { describe, expect, it, vi } from "vitest";
import { bindMenuStartInteractions } from "../../src/game/scenes/MenuSceneInteractions";

describe("MenuSceneInteractions", () => {
  it("binds pointerup and keydown-A to the shared start action", () => {
    const startButtonZone = {
      on: vi.fn()
    };
    const keyboard = {
      once: vi.fn()
    };
    const onStart = vi.fn();

    bindMenuStartInteractions({
      startButtonZone: startButtonZone as never,
      keyboard: keyboard as never,
      onStart
    });

    expect(startButtonZone.on).toHaveBeenCalledWith("pointerup", onStart);
    expect(keyboard.once).toHaveBeenCalledWith("keydown-A", onStart);
  });
});
