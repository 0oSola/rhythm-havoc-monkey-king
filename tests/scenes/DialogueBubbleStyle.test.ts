import { describe, expect, it } from "vitest";
import {
  DEFAULT_DIALOGUE_BUBBLE_STYLE,
  clampDialogueBubbleStyle,
  mergeDialogueBubbleStyle
} from "../../src/game/scenes/DialogueBubbleStyle";

describe("DialogueBubbleStyle", () => {
  it("clamps bubble style values into safe ranges", () => {
    expect(
      clampDialogueBubbleStyle({
        fontSize: 99,
        lineSpacing: -3,
        maxTextWidth: 999,
        paddingX: 1,
        paddingTop: 200,
        paddingBottom: 3,
        textOffsetY: 99,
        textPaddingTop: 99,
        textPaddingBottom: -5,
        textPaddingLeft: 99,
        textPaddingRight: -4,
        minBubbleWidth: 20,
        textColor: "red"
      })
    ).toEqual({
      fontSize: 40,
      lineSpacing: 0,
      maxTextWidth: 420,
      paddingX: 8,
      paddingTop: 40,
      paddingBottom: 8,
      textOffsetY: 16,
      textPaddingTop: 16,
      textPaddingBottom: 0,
      textPaddingLeft: 16,
      textPaddingRight: 0,
      minBubbleWidth: 120,
      textColor: DEFAULT_DIALOGUE_BUBBLE_STYLE.textColor
    });
  });

  it("merges partial updates without dropping existing values", () => {
    expect(
      mergeDialogueBubbleStyle(DEFAULT_DIALOGUE_BUBBLE_STYLE, {
        fontSize: 24,
        textColor: "#123456"
      })
    ).toEqual({
      ...DEFAULT_DIALOGUE_BUBBLE_STYLE,
      fontSize: 24,
      textColor: "#123456"
    });
  });
});
