import { describe, expect, it } from "vitest";
import {
  canConfirmOpeningStep,
  OPENING_BEAT_MATCHED_IDLE_FRAME_RATE,
  OPENING_CONTINUE_PROMPT_COLOR,
  OPENING_CONTINUE_PROMPT_FONT_SIZE_PX,
  OPENING_STORY_FONT_SIZE_PX,
  OPENING_STORY_LINE_SPACING_PX,
  openingAdvanceSfxKeyForStep,
  openingDisplayTextForStep,
  openingRevealSfxKeyForStep,
  openingShouldUseBeatMatchedIdleLoop,
  openingShouldAutoAdvanceAfterAnimation,
  openingShouldAcceptAdvanceKey,
  openingStoryTopY,
  openingContinuePromptForStep,
  openingStepAutoAdvanceMs,
  shouldPlayOpeningAdvanceSfx,
  shouldHideBackgroundForOpeningStep
} from "../../src/game/scenes/LevelOpeningStory";

describe("LevelOpeningStory", () => {
  it("auto-advances story captions until the final line", () => {
    expect(
      openingStepAutoAdvanceMs({
        kind: "story-caption",
        text: "故事要从玉帝宣孙悟空上天做官开始说起……",
        autoAdvanceAfterMs: 1800
      })
    ).toBe(1800);
    expect(
      openingStepAutoAdvanceMs({
        kind: "story-caption",
        text: "先溜进去再说！",
        requireConfirm: true
      })
    ).toBeNull();
  });

  it("only enables confirm and continue prompt on the final story line", () => {
    expect(
      canConfirmOpeningStep({
        kind: "story-caption",
        text: "门口天兵把守，队伍排得老长。"
      })
    ).toBe(false);
    expect(
      canConfirmOpeningStep({
        kind: "story-caption",
        text: "先溜进去再说！",
        requireConfirm: true
      })
    ).toBe(true);
    expect(canConfirmOpeningStep({ kind: "wukong-run-in" })).toBe(false);
    expect(canConfirmOpeningStep({ kind: "guard-reveal" })).toBe(false);
    expect(
      canConfirmOpeningStep({
        kind: "dialogue",
        speaker: "guard",
        text: "Oi——什么人？"
      })
    ).toBe(true);
    expect(openingShouldAutoAdvanceAfterAnimation({ kind: "wukong-run-in" })).toBe(true);
    expect(openingShouldAutoAdvanceAfterAnimation({ kind: "guard-reveal" })).toBe(true);
    expect(
      openingShouldAutoAdvanceAfterAnimation({
        kind: "dialogue",
        speaker: "guard",
        text: "Oi——什么人？"
      })
    ).toBe(false);
    expect(
      openingContinuePromptForStep({
        kind: "story-caption",
        text: "先溜进去再说！",
        requireConfirm: true
      })
    ).toBe("按 A 或点击继续");
    expect(
      openingShouldAcceptAdvanceKey({
        kind: "story-caption",
        text: "这天悟空来报到，却见南天门口排着长队，不知道在查什么。"
      })
    ).toBe(true);
    expect(
      openingAdvanceSfxKeyForStep({
        kind: "story-caption",
        text: "这天悟空来报到，却见南天门口排着长队，不知道在查什么。"
      })
    ).toBe("level1_dialogue_confirm_sfx");
    expect(shouldPlayOpeningAdvanceSfx("complete-current-line")).toBe(false);
    expect(shouldPlayOpeningAdvanceSfx("advance-next-line")).toBe(true);
    expect(openingShouldUseBeatMatchedIdleLoop({ kind: "wukong-run-in" })).toBe(false);
    expect(openingShouldUseBeatMatchedIdleLoop({ kind: "guard-reveal" })).toBe(true);
    expect(
      openingShouldUseBeatMatchedIdleLoop({
        kind: "dialogue",
        speaker: "guard",
        text: "Oi——什么人？"
      })
    ).toBe(true);
    expect(
      openingRevealSfxKeyForStep({
        kind: "guard-reveal"
      })
    ).toBe("level1_guard_oi_sfx");
    expect(
      openingRevealSfxKeyForStep({
        kind: "dialogue",
        speaker: "guard",
        text: "Oi——什么人？"
      })
    ).toBeNull();
    expect(
      openingRevealSfxKeyForStep({
        kind: "dialogue",
        speaker: "wukong",
        text: "俺是堂堂花果山水帘洞美猴王孙——"
      })
    ).toBeNull();
    expect(OPENING_BEAT_MATCHED_IDLE_FRAME_RATE).toBe(5 / 3);
  });

  it("builds cumulative left-aligned story text without clearing previous lines", () => {
    const steps = [
      { kind: "story-caption", text: "第一句" },
      { kind: "story-caption", text: "第二句" },
      { kind: "story-caption", text: "第三句", requireConfirm: true }
    ] as const;

    expect(openingDisplayTextForStep(steps, 0, 2)).toBe("第一");
    expect(openingDisplayTextForStep(steps, 2, 0)).toBe("第一句\n第二句");
    expect(openingDisplayTextForStep(steps, 1, 2)).toBe("第一句\n第二");
    expect(openingDisplayTextForStep(steps, 2, 3)).toBe("第一句\n第二句\n第三句");
  });

  it("hides the level background image during story captions only", () => {
    expect(
      shouldHideBackgroundForOpeningStep({
        kind: "story-caption",
        text: "故事要从玉帝宣孙悟空上天做官开始说起……"
      })
    ).toBe(true);
    expect(shouldHideBackgroundForOpeningStep({ kind: "wukong-run-in" })).toBe(false);
  });

  it("uses a smaller font, double line spacing, and a fixed top edge for the full story block", () => {
    const steps = [
      { kind: "story-caption", text: "第一句" },
      { kind: "story-caption", text: "第二句" },
      { kind: "story-caption", text: "第三句" },
      { kind: "story-caption", text: "第四句" },
      { kind: "story-caption", text: "第五句" },
      { kind: "story-caption", text: "第六句", requireConfirm: true }
    ] as const;

    expect(OPENING_STORY_FONT_SIZE_PX).toBe(20);
    expect(OPENING_STORY_LINE_SPACING_PX).toBe(20);
    expect(openingStoryTopY(steps)).toBe(88);
    expect(OPENING_CONTINUE_PROMPT_FONT_SIZE_PX).toBe(14);
    expect(OPENING_CONTINUE_PROMPT_COLOR).toBe("#8e8e8e");
  });
});
