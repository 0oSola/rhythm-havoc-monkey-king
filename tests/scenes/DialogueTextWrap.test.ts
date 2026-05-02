import { describe, expect, it } from "vitest";
import { wrapDialogueText } from "../../src/game/scenes/DialogueTextWrap";

describe("DialogueTextWrap", () => {
  it("wraps continuous Chinese text without relying on spaces", () => {
    const wrapped = wrapDialogueText(
      "管你是谁，要过南天门，先跟我学礼仪。",
      6,
      (value) => value.length
    );

    expect(wrapped).toBe("管你是谁，要\n过南天门，先\n跟我学礼仪。");
  });

  it("preserves explicit paragraph breaks", () => {
    const wrapped = wrapDialogueText("第一句\n第二句很长", 4, (value) => value.length);

    expect(wrapped).toBe("第一句\n第二句很\n长");
  });
});
