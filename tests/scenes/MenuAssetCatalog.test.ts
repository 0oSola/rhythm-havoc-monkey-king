import { describe, expect, it } from "vitest";
import { MENU_BACKGROUND_ENTRIES } from "../../src/game/scenes/MenuAssetCatalog";

describe("MenuAssetCatalog", () => {
  it("provides the single full-composition start scene background", () => {
    expect(MENU_BACKGROUND_ENTRIES).toMatchObject({
      "menu-start-bg": expect.any(String)
    });
    expect(decodeURIComponent(MENU_BACKGROUND_ENTRIES["menu-start-bg"])).toContain("bg-0.png");
  });
});
