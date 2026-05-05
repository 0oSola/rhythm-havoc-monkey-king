import { describe, expect, it } from "vitest";
import {
  MENU_BACKGROUND_ENTRIES,
  MENU_SOUND_ENTRIES
} from "../../src/game/scenes/MenuAssetCatalog";

describe("MenuAssetCatalog", () => {
  it("provides the single full-composition start scene background", () => {
    expect(MENU_BACKGROUND_ENTRIES).toMatchObject({
      "menu-start-bg": expect.any(String)
    });
    expect(decodeURIComponent(MENU_BACKGROUND_ENTRIES["menu-start-bg"])).toContain("bg-0.png");
  });

  it("provides the looping opening bgm used by the menu scene", () => {
    expect(MENU_SOUND_ENTRIES).toMatchObject({
      "menu-opening-bgm": expect.any(String)
    });
    expect(decodeURIComponent(MENU_SOUND_ENTRIES["menu-opening-bgm"])).toContain(
      "开场音乐-BPM108-21bar.wav"
    );
  });
});
