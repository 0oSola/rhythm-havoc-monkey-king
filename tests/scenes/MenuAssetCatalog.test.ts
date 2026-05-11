import { readFileSync } from "node:fs";
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

  it("does not load runtime menu backgrounds from the origin asset folder", () => {
    const source = readFileSync("src/game/scenes/MenuAssetCatalog.ts", "utf8");

    expect(source).not.toContain("../../assets/origin/");
  });

  it("provides the looping opening bgm used by the menu scene", () => {
    expect(MENU_SOUND_ENTRIES).toMatchObject({
      "menu-opening-bgm": expect.any(String)
    });
    expect(decodeURIComponent(MENU_SOUND_ENTRIES["menu-opening-bgm"])).toContain(
      "menu-opening-bgm-21bar.wav"
    );
  });

  it("keeps runtime menu audio paths portable by avoiding Chinese path segments", () => {
    Object.values(MENU_SOUND_ENTRIES).forEach((relativePath) => {
      expect(relativePath).not.toMatch(/[\u4E00-\u9FFF]/);
    });
  });
});
